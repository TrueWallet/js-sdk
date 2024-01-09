import { TrueWalletConfig } from "./interfaces";
import { Contract, ethers, Signer } from "ethers";
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
  protected rpcProvider!: ethers.providers.JsonRpcProvider;
  private config: TrueWalletConfig;

  protected factorySC!: Contract;
  private walletSC!: Contract;
  private owner!: Signer;

  private socialRecoveryModule: TrueWalletRecoveryModule | null = null;

  operationBuilder!: UserOperationBuilder;
  bundlerClient: BundlerClient;

  get walletAddress(): string {
    return this.walletSC.address;
  }

  constructor(c: Partial<TrueWalletConfig>) {
    this.config = Object.assign(defaultOptions, c);

    if (!this.config.salt) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CONFIG_ERROR,
        message: `Parameter 'salt' is required in config.`,
      })
    }

    this.rpcProvider = new ethers.providers.JsonRpcProvider(this.config.rpcProviderUrl);

    const pk = this.getOwnerPk(this.config.salt);
    this.owner = new ethers.Wallet(pk, this.rpcProvider);

    this.factorySC = new ethers.Contract(this.config.factory.address, this.config.factory.abi, this.rpcProvider);

    this.bundlerClient = new BundlerClient({
      url: this.config.bundleUrl,
      entrypoint: this.config.entrypoint.address
    });
  }

  async init(): Promise<TrueWalletSDK> {
    const walletAddress = await this.getWalletAddress();
    this.walletSC = new ethers.Contract(walletAddress, TrueWalletAbi, this.owner);

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
    const entropy = ethers.utils.solidityKeccak256(['string'], [salt]);
    const mnemonic = ethers.utils.entropyToMnemonic(entropy);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet.privateKey;
  }

  async getBalance(): Promise<string> {
    return this.rpcProvider.getBalance(this.walletSC.address).then((res) => {
      return ethers.utils.formatEther(res);
    });
  }

  async getERC20Balance(tokenAddress: string): Promise<string> {
    const contract = new ethers.Contract(tokenAddress, [...BalanceOfAbi, ...DecimalsAbi], this.rpcProvider);

    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(this.walletSC.address);

    return ethers.utils.formatUnits(balance, decimals);
  }

  async send(recipient: string, amount: string): Promise<any> {
    const args = [
      recipient,
      ethers.utils.parseEther(amount).toString(),
      '0x',
    ];

    const data = encodeFunctionData(TrueWalletAbi, 'execute', args);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletSC.address,
      data
    });

    return this.bundlerClient.sendUserOperation(userOperation);
  }

  async sendErc20(recipient: string, amount: string, tokenAddress: string): Promise<any> {
    const tokenContract = new ethers.Contract(tokenAddress, [...DecimalsAbi, ...TransferAbi], this.rpcProvider);
    const decimals = await tokenContract.decimals();

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
        recipient,
        ethers.utils.parseUnits(amount, decimals),
      ]);

    const data = encodeFunctionData(TrueWalletAbi, 'execute', [
      tokenContract.address,
      ethers.constants.Zero,
      txData,
    ]);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletSC.address,
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
      sender: this.walletSC.address,
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

    const security = new ethers.Contract(Modules.SecurityControlModule, SecurityControlModuleAbi, this.owner);
    const txResponse = await security.execute(this.walletAddress, data);

    const txReceipt = await txResponse.wait();
    return txReceipt.transactionHash;
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
