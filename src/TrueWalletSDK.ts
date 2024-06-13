import {
  ContractCallParams,
  ContractWriteParams,
  SendParams, TrueWallet,
  TrueWalletConfig,
  TrueWalletSigner
} from "./interfaces";
import {
  concat,
  Contract,
  formatEther,
  JsonRpcProvider,
  parseEther, solidityPackedKeccak256, toBeHex
} from "ethers";
import { Modules, SmartContracts } from "./constants";
import { entrypointABI, factoryABI, TrueWalletAbi, } from "./abis";
import { UserOperationBuilder, UserOperationResponse } from "./user-operation-builder";
import { TrueWalletModules, TWConfigError, TWUnsupportedModuleError } from "./types";
import { BundlerClient } from "./bundler";
import { encodeFunctionData, isContract, getSigner, getSecurityModuleInitData } from "./utils";
import { RecoveryModuleData, TrueWalletRecoveryModule } from "./modules";
import { onlyOwner, walletReady } from "./decorators";
import { Erc1155Manager, Erc20Manager, Erc721Manager } from "./classes";


/** Main SDK class */
export class TrueWalletSDK implements TrueWallet {
  /** @property {boolean} ready - is wallet deployed to blockchain */
  ready: boolean = false;

  private signer!: TrueWalletSigner;
  rpcProvider!: JsonRpcProvider;

  private factorySC!: Contract;
  private entrypointSC!: Contract;
  private walletSC!: Contract;

  socialRecoveryModule!: TrueWalletRecoveryModule;

  operationBuilder!: UserOperationBuilder;
  bundler!: BundlerClient;
  erc20!: Erc20Manager;
  erc721!: Erc721Manager;
  erc1155!: Erc1155Manager;

  get address(): string {
    return this.walletSC.target as string;
  }

  constructor() {}

  async init(config: TrueWalletConfig): Promise<TrueWalletSDK> {
    const requiredParams = ['signer', 'bundlerUrl'];
    const isConfigValid = requiredParams.every((param) => Object.prototype.hasOwnProperty.call(config, param));

    if (!isConfigValid) {
      throw new TWConfigError(`Parameters 'salt', 'bundlerUrl' are required in config.`)
    }

    this.rpcProvider = new JsonRpcProvider(config.rpcProviderUrl || config.bundlerUrl);

    this.factorySC = new Contract(SmartContracts.Factory, factoryABI, this.rpcProvider);
    this.entrypointSC = new Contract(SmartContracts.Entrypoint, entrypointABI, this.rpcProvider);

    this.bundler = new BundlerClient({
      url: config.bundlerUrl,
      entrypoint: this.entrypointSC.target as string,
    });

    this.signer = await getSigner(config);

    // FIXME: hardcoded wallet idx
    const walletAddress = await this.getWalletAddress(0);
    this.walletSC = new Contract(walletAddress, TrueWalletAbi, this.rpcProvider);
    this.ready = await this.isWalletReady()

    this.operationBuilder = new UserOperationBuilder({
      entrypointSC: this.entrypointSC,
      rpcProvider: this.rpcProvider,
      bundlerClient: this.bundler,
      signer: this.signer,
    });

    this.socialRecoveryModule = new TrueWalletRecoveryModule({
      wallet: this,
    });

    this.erc20 = new Erc20Manager(this);
    this.erc721 = new Erc721Manager(this);
    this.erc1155 = new Erc1155Manager(this);

    return this;
  }

  private async getWalletAddress(idx: number): Promise<string> {
    const walletSalt = this.getWalletSalt(idx);

    return this.factorySC['getWalletAddress'](walletSalt);
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
   * Send native currency to recipient
   * @method send
   * @param {Object} params
   * @param {string} params.to - recipient address
   * @param {string | number} params.amount - amount to send in ether unit
   * @param {string} [paymaster=0x] - paymaster address (optional)
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   *
   * @example
   * const wallet = new TrueWalletSDK({ ... });
   * await wallet.send({
   *   to: '0x...',
   *   amount: '0.1',
   * });
   * */
  @onlyOwner
  async send(params: Omit<SendParams, 'from'>, paymaster: string = '0x'): Promise<UserOperationResponse> {
    return this.execute('0x', params.to, parseEther(params.amount.toString()).toString(), paymaster);
  }

  @onlyOwner
  async deployWallet(paymaster: string = '0x'): Promise<UserOperationResponse> {
    return this.buildAndSendOperation('0x', paymaster);
  }

  /**
   * Low level method to execute the transaction on behalf of the wallet
   * @method execute
   * @param {string} payload - transaction data
   * @param {string} [target=this.address] - target address
   * @param {string} [value=0] - amount to send in ether unit
   * @param {string} [paymaster=0x] - paymaster contract address
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  @onlyOwner
  async execute(
    payload: string,
    target: string = this.address,
    value: string = toBeHex(0),
    paymaster: string = '0x',
  ): Promise<UserOperationResponse> {
    const executeTxData = encodeFunctionData(
      TrueWalletAbi,
      'execute',
      [ target, value, payload]
    );

    return this.buildAndSendOperation(executeTxData, paymaster);
  }


  /**
   * Used to call contract methods that change state
   * @param params - contract call params
   * @param {string} params.address - contract address
   * @param {InterfaceAbi | Interface} params.abi - contract abi
   * @param {string} params.method - contract method name to call
   * @param {unknown[]} params.args - contract method arguments
   * @param {string | number} [params.payableAmount] - amount to send in ether unit (optional)
   * @param {string} [paymaster='0x'] - paymaster contract address (optional)
   * @returns {Promise<UserOperationResponse>} - User Operation hash
   * */
  @onlyOwner
  async contractCall(params: ContractWriteParams, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = new Contract(params.address, params.abi, this.rpcProvider);
    const txData = contract.interface.encodeFunctionData(params.method, params.args);

    return this.execute(
      txData,
      params.address,
      params.payableAmount?.toString() || toBeHex(0),
      paymaster,
    )
  }

  /**
   * Used to call contract methods that don't change state
   * @param params - contract call params
   * @param {string} params.address - contract address
   * @param {InterfaceAbi | Interface} params.abi - contract abi
   * @param {string} params.method - contract method name to call
   * @param {unknown[]} params.args - contract method arguments
   * @returns {Promise<unknown>} - contract method call result
   * */
  async contractRead(params: ContractCallParams): Promise<unknown> {
    const contract = new Contract(params.address, params.abi, this.rpcProvider);
    return contract[params.method](...params.args);
  }

  private async buildAndSendOperation(data: string, paymaster: string): Promise<UserOperationResponse> {
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

    return this.bundler.sendUserOperation(userOperation);
  }

  private async getInitCode(): Promise<string> {
    if(this.ready) {
      return '0x';
    }

    const initializer = await this.getInitializerData();
    // FIXME: hardcoded wallet idx
    const walletSalt = this.getWalletSalt(0);
    const callData = encodeFunctionData(factoryABI, 'createWallet', [initializer, walletSalt]);

    return concat([this.factorySC.target as string, callData]);
  }

  // MODULES
  /**
   * Method to install internal modules
   * @method installModule
   * @param {TrueWalletModules} module - module to install
   * @param {unknown} moduleData - data for the module installation
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  @onlyOwner
  async installModule(module: TrueWalletModules, moduleData: unknown): Promise<UserOperationResponse> {
    const moduleAddress = Modules[module];

    switch (moduleAddress) {
      case Modules.SocialRecoveryModule:
        return await (<TrueWalletRecoveryModule>this.socialRecoveryModule).install(moduleData as RecoveryModuleData);
      default:
        throw new TWUnsupportedModuleError(`Module ${module} is not supported`);
    }
  }

  /**
   * Method to remove internal modules
   * @method removeModule
   * @param {TrueWalletModules} module - module to remove
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  @onlyOwner
  async removeModule(module: TrueWalletModules): Promise<UserOperationResponse> {
    const moduleAddress = Modules[module];

    switch (moduleAddress) {
      case Modules.SocialRecoveryModule:
        return (<TrueWalletRecoveryModule>this.socialRecoveryModule).remove();
      default:
        throw new TWUnsupportedModuleError(`Module ${module} is not supported`);
    }
  }


  /**
   * Method to get installed modules
   * @method getInstalledModules
   * @returns {Promise<string[]>} - list of contract addresses of installed modules
   * */
  @walletReady
  async getInstalledModules(): Promise<string[]> {
    return this.walletSC['listModules']();
  }

  /**
   * Method to get module smart contract address
   * @method getModuleAddress
   * @param {TrueWalletModules} module - module
   * @returns {string} - contract address of the module
   * */
  getModuleAddress(module: TrueWalletModules): string {
    return Modules[module];
  }

  /**
   * Method to check if given module is installed
   * @method isModuleInstalled
   * @param {TrueWalletModules} module - module to check
   * @returns {Promise<boolean>} - is module installed
   * */
  async isModuleInstalled(module: TrueWalletModules): Promise<boolean> {
    const modules = await this.getInstalledModules();
    const moduleAddress = this.getModuleAddress(module);
    return modules[0].includes(moduleAddress);
  }

  /**
   * Method to check if given address is wallet owner
   * @method isWalletOwner
   * @param {string} address - address to check
   * @returns {Promise<boolean>} - is wallet owner
   * */
  @walletReady
  async isWalletOwner(address: string): Promise<boolean> {
    return this.walletSC['isOwner'](address);
  }

  private async isWalletReady(): Promise<boolean> {
    return isContract(this.address, this.rpcProvider);
  }

  private async getInitializerData(): Promise<string> {
    const args = [
      this.entrypointSC.target,
      this.signer.address,
      [getSecurityModuleInitData()]
    ];

    return await this.factorySC['getInitializer'](...args);
  }

  private getWalletSalt(walletIdx: number): string {
    return solidityPackedKeccak256(
      ['address', 'address', 'bytes', 'string'],
      [
        this.entrypointSC.target,
        this.signer.address,
        getSecurityModuleInitData(),
        walletIdx.toString(),
      ]
    );
  }
}
