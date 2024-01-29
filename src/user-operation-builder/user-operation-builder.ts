import { OperationParams, UserOperationData } from "./user-operation-data";
import {
  Contract,
  getBytes,
  JsonRpcProvider,
  toBeHex,
} from "ethers";
import { BundlerClient } from "../bundler";
import { TrueWalletSigner } from "../interfaces";

export interface UserOperationBuilderConfig {
  entrypointSC: Contract;
  bundlerClient: BundlerClient;
  rpcProvider: JsonRpcProvider;
  signer: TrueWalletSigner;
}

export class UserOperationBuilder {
  private readonly bundlerClient: BundlerClient;

  signer: TrueWalletSigner;
  entrypointSC: Contract;
  rpcProvider: JsonRpcProvider;

  constructor(config: UserOperationBuilderConfig) {
    this.rpcProvider = config.rpcProvider;
    this.bundlerClient = config.bundlerClient;
    this.signer = config.signer;
    this.entrypointSC = config.entrypointSC;
  }

  async buildOperation(operation: OperationParams, paymaster: string = '0x'): Promise<UserOperationData> {
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrice();

    const op: Partial<UserOperationData> = {
      sender: operation.sender as string,
      nonce: operation.nonce,
      initCode: operation.initCode,
      callData: operation.callData,

      maxFeePerGas: toBeHex(maxFeePerGas),
      maxPriorityFeePerGas: toBeHex(maxPriorityFeePerGas),

      preVerificationGas: toBeHex(0),
      verificationGasLimit: toBeHex(0),
      callGasLimit: toBeHex(0),

      paymasterAndData: paymaster,
      signature: await this.getDummySignature(),
    }

    const estimatedOperation = await this.getGasEstimation(op);

    return {
      ...estimatedOperation,
      signature: await this.getSignature(estimatedOperation),
    } as UserOperationData;
  }

  private async getGasEstimation(userOperation: Partial<UserOperationData>): Promise<any> {
    const est = await this.bundlerClient.estimateUserOperationGas(userOperation);

    return {
      ...userOperation,
      preVerificationGas: est.preVerificationGas,
      verificationGasLimit: est.verificationGasLimit ?? est.verificationGas,
      callGasLimit: est.callGasLimit,
    }
  }

  private async getGasPrice(): Promise<{maxFeePerGas: bigint, maxPriorityFeePerGas: bigint }> {
    /**
     * https://github.com/stackup-wallet/userop.js/blob/ef1a5fc368fd84422ee35a240b99aabae76c83e8/src/preset/middleware/gasPrice.ts#L4
     * */
    // FIXME: refactor with rpcProvider.getFeeData()
    const [fee, block] = await Promise.all([
      this.rpcProvider.send("eth_maxPriorityFeePerGas", []),
      this.rpcProvider.getBlock("latest"),
    ]);

    const tip = BigInt(fee);
    const buffer = tip / BigInt(100)  * BigInt(13);
    const maxPriorityFeePerGas = tip + buffer;
    const maxFeePerGas = block?.baseFeePerGas
      ? block.baseFeePerGas * BigInt(2) + maxPriorityFeePerGas
      : maxPriorityFeePerGas;

    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  private async getDummySignature(): Promise<string> {
    return '0x73c3ac716c487ca34bb858247b5ccf1dc354fbaabdd089af3b2ac8e78ba85a4959a2d76250325bd67c11771c31fccda87c33ceec17cc0de912690521bb95ffcb1b';
  }

  private async getSignature(userOperation: Partial<UserOperationData>): Promise<string> {
    const message = await this.entrypointSC['getUserOpHash'](userOperation);
    return await this.signer.signMessage(getBytes(message));
  }
}
