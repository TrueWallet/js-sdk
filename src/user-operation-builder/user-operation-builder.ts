import { OperationParams, UserOperationData } from "./user-operation-data";
import { BigNumber, Contract, ethers, Signer, Wallet } from "ethers";
import { TrueWalletConfig } from "../interfaces";
import { getCreateWalletArgs } from "../utils/get-create-account-args";
import { encodeFunctionData } from "../utils";
import { factoryABI } from "../abis";

export interface UserOperationBuilderConfig {
  walletConfig: TrueWalletConfig
  rpcProvider: ethers.providers.JsonRpcProvider;
  walletSC: Contract;
  owner: Signer;
}

export class UserOperationBuilder {
  private readonly trueWalletConfig: TrueWalletConfig;

  owner: Signer;
  walletSC: Contract;
  entrypointSC: Contract;
  rpcProvider: ethers.providers.JsonRpcProvider;
  salt: string;
  factoryAddress: string;

  constructor(config: UserOperationBuilderConfig) {
    this.trueWalletConfig = config.walletConfig;
    this.rpcProvider = config.rpcProvider;
    this.owner = config.owner;
    this.walletSC = config.walletSC;
    this.factoryAddress = config.walletConfig.factory.address;
    this.entrypointSC = new ethers.Contract(config.walletConfig.entrypoint.address, config.walletConfig.entrypoint.abi, this.rpcProvider);
    this.salt = <string>config.walletConfig.salt;
  }

  async buildOperation(operation: OperationParams): Promise<UserOperationData> {
    const isDeployed = await this.isDeployed(this.walletSC.address);

    const block = await this.rpcProvider.getBlock('latest');

    const maxPriorityFeePerGas = 1_500_000_000; // fixme https://github.com/stackup-wallet/userop.js/blob/ef1a5fc368fd84422ee35a240b99aabae76c83e8/src/preset/middleware/gasPrice.ts#L4
    const maxFeePerGas = Number(block.baseFeePerGas?.mul(2).add(maxPriorityFeePerGas).toString())

    // FIXME: clear callData if directly deploy wallet
    const op = {
      sender: operation.sender,
      nonce: isDeployed ? await this.getNonce() : ethers.utils.hexlify(0),
      initCode: isDeployed ? '0x': await this.getInitCode(),
      callData: operation.data,

      maxFeePerGas: ethers.utils.hexlify(maxFeePerGas),
      maxPriorityFeePerGas: ethers.utils.hexlify(maxPriorityFeePerGas),

      // TODO: calculate gas limits
      callGasLimit: ethers.utils.hexlify(2_000_000),
      verificationGasLimit: ethers.utils.hexlify(1_500_000),
      preVerificationGas: ethers.utils.hexlify(1_000_000),

      paymasterAndData: '0x',
      signature: '0x',
    }

    return {
      ...op,
      signature: await this.getSignature(op),
    };
  }

  private async getNonce(): Promise<string> {
    const nonce: BigNumber = await this.walletSC['nonce']();
    return nonce.toHexString();
  }

  private async getInitCode(): Promise<string> {
    const args = getCreateWalletArgs(
      this.trueWalletConfig,
      await this.owner.getAddress(),
      []
    );

    const callData = encodeFunctionData(factoryABI, 'createWallet', args);

    return ethers.utils.hexConcat([this.factoryAddress, callData]);
  }

  private async isDeployed(address: string): Promise<boolean> {
    const code = await this.rpcProvider.getCode(address);
    return code !== '0x';
  }

  private async getSignature(userOperation: Partial<UserOperationData>): Promise<string> {
    const message = await this.entrypointSC['getUserOpHash'](userOperation);
    return await this.owner.signMessage(ethers.utils.arrayify(message));
  }
}
