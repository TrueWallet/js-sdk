import { TrueWalletConfig } from "./interfaces";
import {
  Addressable,
  Contract,
  formatEther, formatUnits,
  JsonRpcProvider,
  Mnemonic,
  parseEther, parseUnits,
  Signer,
  solidityPackedKeccak256,
  Wallet
} from "ethers";
import { Modules, TrueWalletErrorCodes } from "./constants";
import { BalanceOfAbi, DecimalsAbi, TransferAbi, TrueWalletAbi, } from "./abis";
import { UserOperationBuilder } from "./user-operation-builder";
import { TrueWalletError, TrueWalletModules } from "./types";
import { BundlerClient } from "./bundler";
import { encodeFunctionData } from "./utils";
import { getCreateWalletArgs } from "./utils/get-create-account-args";
import { TrueWalletRecoveryModule } from "./modules";
import defaultOptions from "./constants/default-options";
import { SecurityControlModuleAbi } from "./abis/security-control-module-abi";


export class TrueWalletSDK {
  protected rpcProvider!: JsonRpcProvider;
  private config: TrueWalletConfig;

  protected factorySC!: Contract;
  private walletSC!: Contract;
  private owner!: Signer;

  private socialRecoveryModule: TrueWalletRecoveryModule | null = null;

  operationBuilder!: UserOperationBuilder;
  bundlerClient: BundlerClient;

  get walletAddress(): Addressable {
    return this.walletSC.target as Addressable;
  }

  constructor(c: Partial<TrueWalletConfig>) {
    this.config = Object.assign(defaultOptions, c);

    if (!this.config.salt) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CONFIG_ERROR,
        message: `Parameter 'salt' is required in config.`,
      })
    }

    this.rpcProvider = new JsonRpcProvider(this.config.rpcProviderUrl);

    const pk = this.getOwnerPk(this.config.salt);
    this.owner = new Wallet(pk, this.rpcProvider);

    this.factorySC = new Contract(this.config.factory.address, this.config.factory.abi, this.owner);

    this.bundlerClient = new BundlerClient({
      url: this.config.bundleUrl,
      entrypoint: this.config.entrypoint.address
    });
  }

  async init(): Promise<TrueWalletSDK> {
    const walletAddress = await this.getWalletAddress();
    this.walletSC = new Contract(walletAddress, TrueWalletAbi, this.owner);

    this.operationBuilder = new UserOperationBuilder({
      walletConfig: this.config,
      rpcProvider: this.rpcProvider,
      walletSC: this.walletSC,
      owner: this.owner,
    });

    this.socialRecoveryModule = new TrueWalletRecoveryModule({
      walletAddress: this.walletAddress,
      operationBuilder: this.operationBuilder,
      bundlerClient: this.bundlerClient,
      signer: this.owner,
    });

    return this;
  }

  private async getWalletAddress(): Promise<string> {
    const args = getCreateWalletArgs(
      this.config,
      await this.owner.getAddress(),
      [],
    );

    return this.factorySC['getWalletAddress'](...args);
  }

  private getOwnerPk(salt: string): string {
    const entropy = solidityPackedKeccak256(['string'], [salt]);
    const mnemonic = Mnemonic.entropyToPhrase(entropy);
    const wallet = Wallet.fromPhrase(mnemonic);
    return wallet.privateKey;
  }

  async getBalance(): Promise<string> {
    const balance = await this.rpcProvider.getBalance(this.walletAddress);
    return formatEther(balance)
  }

  async getERC20Balance(tokenAddress: string): Promise<string> {
    const contract = new Contract(tokenAddress, [...BalanceOfAbi, ...DecimalsAbi], this.rpcProvider);

    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(this.walletSC.address);

    return formatUnits(balance, decimals);
  }

  async send(recipient: string, amount: string): Promise<any> {
    const args = [
      recipient,
      parseEther(amount),
      '0x',
    ];

    const data = encodeFunctionData(TrueWalletAbi, 'execute', args);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletAddress,
      data
    });

    return this.bundlerClient.sendUserOperation(userOperation);
  }

  async sendErc20(recipient: string, amount: string, tokenAddress: string): Promise<any> {
    const tokenContract = new Contract(tokenAddress, [...DecimalsAbi, ...TransferAbi], this.rpcProvider);
    const decimals = await tokenContract.decimals();

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
        recipient,
        parseUnits(amount, decimals),
      ]);

    const data = encodeFunctionData(TrueWalletAbi, 'execute', [
      tokenContract.address,
      parseEther('0'),
      txData,
    ]);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletAddress,
      data,
    });

    return this.bundlerClient.sendUserOperation(userOperation);
  }

  async deployWallet(): Promise<string> {
    const args = getCreateWalletArgs(
      this.config,
      await this.owner.getAddress(),
      [],
    );

    const data = encodeFunctionData(this.config.factory.abi, 'createWallet', args);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletAddress,
      data
    });

    return await this.bundlerClient.sendUserOperation(userOperation);
  }

  // MODULES
  async installModule(module: TrueWalletModules, moduleData: any): Promise<string> {
    const moduleAddress = Modules[module];

    // TODO: check if security module is already installed, throw error if not
    // TODO: check if module is already installed
    switch (moduleAddress) {
      case Modules.SocialRecoveryModule:
        return await (<TrueWalletRecoveryModule>this.socialRecoveryModule).install(moduleData);
      default:
        throw new TrueWalletError({
          code: TrueWalletErrorCodes.MODULE_NOT_SUPPORTED,
          message: `Module ${module} is not supported`,
        });
    }
  }

  async removeModule(module: TrueWalletModules): Promise<string> {
    const moduleAddress = Modules[module];
    const data = encodeFunctionData(TrueWalletAbi, 'removeModule', [moduleAddress]);

    const security = new Contract(Modules.SecurityControlModule, SecurityControlModuleAbi, this.owner);
    const txResponse = await security.execute(this.walletAddress, data);

    const txReceipt = await txResponse.wait();
    return txReceipt.hash;
  }

  async getInstalledModules(): Promise<string[]> {
    return this.walletSC['listModules']();
  }

  getModuleAddress(module: TrueWalletModules): string {
    return Modules[module];
  }

  async isWalletOwner(address: string): Promise<boolean> {
    return this.walletSC['isOwner'](address);
  }
}
