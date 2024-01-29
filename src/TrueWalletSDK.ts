import { SendErc20Params, SendParams, TrueWalletConfig, TrueWalletSigner } from "./interfaces";
import {
  concat,
  Contract,
  formatEther, formatUnits,
  JsonRpcProvider,
  parseEther, parseUnits, toBeHex
} from "ethers";
import { Modules, SmartContracts, TrueWalletErrorCodes } from "./constants";
import { BalanceOfAbi, DecimalsAbi, entrypointABI, factoryABI, TransferAbi, TrueWalletAbi, } from "./abis";
import { UserOperationBuilder } from "./user-operation-builder";
import { TrueWalletError, TrueWalletModules } from "./types";
import { BundlerClient } from "./bundler";
import { encodeFunctionData, isContract, getCreateWalletArgs, getSigner } from "./utils";
import { TrueWalletRecoveryModule } from "./modules";
import { onlyOwner, walletReady } from "./decorators";

export class TrueWalletSDK {
  private ready: boolean = false;

  private signer!: TrueWalletSigner;
  rpcProvider!: JsonRpcProvider;

  private factorySC!: Contract;
  private entrypointSC!: Contract;
  private walletSC!: Contract;

  private socialRecoveryModule: TrueWalletRecoveryModule | null = null;

  operationBuilder!: UserOperationBuilder;
  bundlerClient!: BundlerClient;

  get address(): string {
    return this.walletSC.target as string;
  }

  constructor() {}

  async init(config: TrueWalletConfig): Promise<TrueWalletSDK> {
    const requiredParams = ['rpcProviderUrl', 'signer', 'bundlerUrl'];
    const isConfigValid = requiredParams.every((param) => config.hasOwnProperty(param));

    if (!isConfigValid) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CONFIG_ERROR,
        message: `Parameters 'rpcProviderUrl', 'salt', 'bundlerUrl' are required in config.`,
      })
    }

    this.rpcProvider = new JsonRpcProvider(config.rpcProviderUrl);

    this.factorySC = new Contract(SmartContracts.Factory, factoryABI, this.rpcProvider);
    this.entrypointSC = new Contract(SmartContracts.Entrypoint, entrypointABI, this.rpcProvider);

    this.bundlerClient = new BundlerClient({
      url: config.bundlerUrl,
      entrypoint: this.entrypointSC.target as string,
    });

    this.signer = await getSigner(config.signer);

    // FIXME: hardcoded wallet idx
    const walletAddress = await this.getWalletAddress(0);
    this.walletSC = new Contract(walletAddress, TrueWalletAbi, this.rpcProvider);
    this.ready = await this.isWalletReady()

    this.operationBuilder = new UserOperationBuilder({
      entrypointSC: this.entrypointSC,
      rpcProvider: this.rpcProvider,
      bundlerClient: this.bundlerClient,
      signer: this.signer,
    });

    this.socialRecoveryModule = new TrueWalletRecoveryModule({
      wallet: this,
    });

    return this;
  }

  private async getWalletAddress(idx: number): Promise<string> {
    const args = getCreateWalletArgs(
      idx,
      this.entrypointSC.target as string,
      this.signer.address,
      [],
    );

    return this.factorySC['getWalletAddress'](...args);
  }

  /**
   * Get balance of the wallet in native currency
   * @method getBalance
   * @returns {Promise<string>} - balance of the wallet in ether unit
   *
   * @example
   * const wallet = new TrueWalletSDK({ ... });
   * await wallet.getBalance();
   * */
  async getBalance(): Promise<string> {
    const balance = await this.rpcProvider.getBalance(this.address);
    return formatEther(balance)
  }

  /**
   * Get nonce of the wallet
   * @method getNonce
   * @returns {Promise<bigint>} - nonce of the wallet
   *
   * @example
   * const wallet = new TrueWalletSDK({ ... });
   * await wallet.getNonce();
   * */
  @walletReady
  async getNonce(): Promise<bigint> {
    return await this.walletSC['nonce']();
  }

  /**
   * Get ERC20 token balance
   * @method getERC20Balance
   * @param {string} tokenAddress - ERC20 token contract address
   * @returns {Promise<string>} - token balance in ether unit
   *
   * @example
   * const wallet = new TrueWalletSDK({ ... });
   * await wallet.getERC20Balance('0x...');
   * */
  async getERC20Balance(tokenAddress: string): Promise<string> {
    const contract = new Contract(tokenAddress, [...BalanceOfAbi, ...DecimalsAbi], this.rpcProvider);

    try {
      const decimals = await contract.decimals();
      const balance = await contract['balanceOf'](this.address);

      return formatUnits(balance, decimals);
    } catch (err: any) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: err.message,
      });
    }
  }

  /**
   * Send native currency to recipient
   * @method send
   * @param {Object} params
   * @param {string} params.to - recipient address
   * @param {string | number} params.amount - amount to send in ether unit
   * @param {string} [paymaster=0x] - paymaster address (optional)
   * @returns {Promise<string>} - User Operation hash
   *
   * @example
   * const wallet = new TrueWalletSDK({ ... });
   * await wallet.send({
   *   to: '0x...',
   *   amount: '0.1',
   * });
   * */
  @onlyOwner
  async send(params: SendParams, paymaster = '0x'): Promise<any> {
    return this.execute('0x', params.to, parseEther(params.amount.toString()).toString(), paymaster);
  }

  /**
   * Send ERC20 token to recipient
   * @method sendErc20
   * @param {Object} params
   * @param {string} params.to - recipient address
   * @param {string | number} params.amount - amount to send in ether unit
   * @param {string} params.tokenAddress - ERC20 token contract address
   * @param {string} [paymaster=0x] - paymaster contract address (optional)
   * @returns {Promise<string>} - User Operation hash
   *
   * @example
   * const wallet = new TrueWalletSDK({ ... });
   * await wallet.sendErc20({
   *   to: '0x...',
   *   amount: '0.1',
   *   tokenAddress: '0x...',
   * });
   * */
  @onlyOwner
  async sendErc20(params: SendErc20Params, paymaster: string = '0x'): Promise<any> {
    const tokenContract = new Contract(params.tokenAddress, [...DecimalsAbi, ...TransferAbi], this.rpcProvider);
    const decimals = await tokenContract.decimals();

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
      params.to,
      parseUnits(params.amount.toString(), decimals),
    ]);

    const data = encodeFunctionData(TrueWalletAbi, 'execute', [
      await tokenContract.getAddress(),
      parseEther('0'),
      txData,
    ]);

    return this.buildAndSendOperation(data, paymaster);
  }

  @onlyOwner
  async deployWallet(paymaster: string = '0x'): Promise<string> {
    return this.buildAndSendOperation('0x', paymaster);
  }

  @onlyOwner
  async execute(
    payload: string,
    target: string = this.address,
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
    let nonce;

    try {
      nonce = await this.getNonce();
    } catch (err) {
      nonce = 0;
    }

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.address,
      callData: data,
      initCode: await this.getInitCode(),
      nonce: toBeHex(nonce),
    }, paymaster);

    return this.bundlerClient.sendUserOperation(userOperation);
  }

  private async getInitCode(): Promise<string> {
    if(this.ready) {
      return '0x';
    }

    // FIXME: hardcoded wallet idx
    const args = getCreateWalletArgs(
      0,
      this.entrypointSC.target as string,
      this.signer.address,
      []
    );

    const callData = encodeFunctionData(factoryABI, 'createWallet', args);
    return concat([this.factorySC.target as string, callData]);
  }

  // MODULES
  @onlyOwner
  async installModule(module: TrueWalletModules, moduleData: any): Promise<string> {
    const moduleAddress = Modules[module];

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

  @onlyOwner
  async removeModule(module: TrueWalletModules): Promise<string> {
    const moduleAddress = Modules[module];

    switch (moduleAddress) {
      case Modules.SocialRecoveryModule:
        return (<TrueWalletRecoveryModule>this.socialRecoveryModule).remove();
      default:
        throw new TrueWalletError({
          code: TrueWalletErrorCodes.MODULE_NOT_SUPPORTED,
          message: `Module ${module} is not supported`,
        });
    }
  }


  @walletReady
  async getInstalledModules(): Promise<string[]> {
    return this.walletSC['listModules']();
  }

  getModuleAddress(module: TrueWalletModules): string {
    return Modules[module];
  }

  @walletReady
  async isWalletOwner(address: string): Promise<boolean> {
    return this.walletSC['isOwner'](address);
  }

  private async isWalletReady(): Promise<boolean> {
    return isContract(this.address, this.rpcProvider);
  }
}
