import { TrueWalletConfig } from "./interfaces";
import {
  Contract,
  formatEther, formatUnits,
  JsonRpcProvider,
  Mnemonic,
  parseEther, parseUnits,
  Signer,
  solidityPackedKeccak256, toBeHex,
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

  get walletAddress(): string {
    return this.walletSC.target as string;
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
      bundlerClient: this.bundlerClient,
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

  async getNonce(): Promise<bigint> {
    return await this.walletSC['nonce']();
  }

  async getERC20Balance(tokenAddress: string): Promise<string> {
    const contract = new Contract(tokenAddress, [...BalanceOfAbi, ...DecimalsAbi], this.rpcProvider);

    const decimals = await contract.decimals();
    const balance = await contract['balanceOf'](this.walletAddress);

    return formatUnits(balance, decimals);
  }

  async send(recipient: string, amount: string, paymaster = '0x'): Promise<any> {
    return this.execute('0x', recipient, parseEther(amount).toString(), paymaster);
  }

  async sendErc20(
    recipient: string,
    amount: string,
    tokenAddress: string,
    paymaster: string = '0x'
  ): Promise<any> {
    const tokenContract = new Contract(tokenAddress, [...DecimalsAbi, ...TransferAbi], this.rpcProvider);
    const decimals = await tokenContract.decimals();

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
      recipient,
      parseUnits(amount, decimals),
    ]);

    const data = encodeFunctionData(TrueWalletAbi, 'execute', [
      await tokenContract.getAddress(),
      parseEther('0'),
      txData,
    ]);

    return this.buildAndSendOperation(data, paymaster);
  }

  async deployWallet(paymaster: string = '0x'): Promise<string> {
    const args = getCreateWalletArgs(
      this.config,
      await this.owner.getAddress(),
      [],
    );

    const executeData = encodeFunctionData(this.config.factory.abi, 'createWallet', args);

    return this.buildAndSendOperation(executeData, paymaster);
  }

  async execute(
    payload: string,
    target: string = this.walletAddress,
    value: string = toBeHex(0),
    paymaster: string = '0x',
  ): Promise<string> {
    const executeTxData = encodeFunctionData(
      TrueWalletAbi,
      'execute',
      [ target, value, payload]
    );

    return this.buildAndSendOperation(executeTxData, paymaster);
  }

  private async buildAndSendOperation(data: string, paymaster: string): Promise<string> {
    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletAddress,
      data,
    }, paymaster);

    return this.bundlerClient.sendUserOperation(userOperation);
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
