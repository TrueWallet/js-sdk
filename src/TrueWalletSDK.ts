import { TrueWalletConfig } from "./interfaces";
import { Contract, ethers, providers, Signer } from "ethers";
import {
  BalanceOfAbi,
  DecimalsAbi,
  defaultOptions,
  TransferAbi,
  TrueWalletAbi,
  TrueWalletErrorCodes
} from "./constants";
import { UserOperationBuilder } from "./user-operation-builder";
import { TrueWalletError } from "./types";
import { BundlerClient } from "./bundler";
import { encodeFunctionData } from "./utils";
import { getCreateWalletArgs } from "./utils/get-create-account-args";

export class TrueWalletSDK {
  protected rpcProvider!: ethers.providers.JsonRpcProvider;
  private config: TrueWalletConfig;

  protected factorySC!: Contract;
  private walletSC!: Contract;
  private owner!: Signer;

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
      rpcProvider: this.rpcProvider,
      walletSC: this.walletSC,
      entrypoint: this.config.entrypoint,
      owner: this.owner,
      salt: <string>this.config.salt,
      factoryAddress: this.config.factory.address,
    });

    return this;
  }

  private async getWalletAddress(): Promise<string> {
    const args = getCreateWalletArgs(
      this.config.entrypoint.address,
      await this.owner.getAddress(),
      <string>this.config.salt,
      []
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

  async sendErc20(recipient: string, amount: string, tokenAddress: string): Promise<providers.TransactionReceipt> {
    const tokenContract = new ethers.Contract(tokenAddress, [...DecimalsAbi, ...TransferAbi], this.rpcProvider);
    const decimals = await tokenContract.decimals();

    const data = encodeFunctionData(TrueWalletAbi, 'execute', [
      tokenContract.address,
      ethers.constants.Zero,
      tokenContract.interface.encodeFunctionData('transfer', [
        recipient,
        ethers.utils.parseUnits(amount, decimals),
      ]),
    ]);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletSC.address,
      data,
    });

    return this.bundlerClient.sendUserOperation(userOperation);
  }

  async deployWallet(): Promise<providers.TransactionReceipt> {
    const args = getCreateWalletArgs(
      this.config.entrypoint.address,
      await this.owner.getAddress(),
      <string>this.config.salt,
      []
    );

    const data = encodeFunctionData(this.config.factory.abi, 'createWallet', args);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletSC.address,
      data
    });

    return await this.bundlerClient.sendUserOperation(userOperation);
  }
}
