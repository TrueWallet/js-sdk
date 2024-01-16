import { OperationParams, UserOperationData } from "./user-operation-data";
import { concat, Contract, getBytes, JsonRpcProvider, Signer, toBeHex, ZeroHash, } from "ethers";
import { TrueWalletConfig } from "../interfaces";
import { getCreateWalletArgs } from "../utils/get-create-account-args";
import { encodeFunctionData } from "../utils";
import { factoryABI } from "../abis";

export interface UserOperationBuilderConfig {
  walletConfig: TrueWalletConfig
  rpcProvider: JsonRpcProvider;
  walletSC: Contract;
  owner: Signer;
}

export class UserOperationBuilder {
  private readonly trueWalletConfig: TrueWalletConfig;

  owner: Signer;
  walletSC: Contract;
  entrypointSC: Contract;
  rpcProvider: JsonRpcProvider;
  salt: string;
  factoryAddress: string;

  constructor(config: UserOperationBuilderConfig) {
    this.trueWalletConfig = config.walletConfig;
    this.rpcProvider = config.rpcProvider;
    this.owner = config.owner;
    this.walletSC = config.walletSC;
    this.factoryAddress = config.walletConfig.factory.address;
    this.entrypointSC = new Contract(config.walletConfig.entrypoint.address, config.walletConfig.entrypoint.abi, this.rpcProvider);
    this.salt = <string>config.walletConfig.salt;
  }

  async buildOperation(operation: OperationParams): Promise<UserOperationData> {
    const isDeployed = await this.isDeployed(await this.walletSC.getAddress());

    const { maxFeePerGas, maxPriorityFeePerGas } = await this.getGasPrice();

    // FIXME: clear callData if directly deploy wallet
    const op: Partial<UserOperationData> = {
      sender: operation.sender as string,
      nonce: isDeployed ? await this.getNonce() : toBeHex(0),
      initCode: isDeployed ? '0x': await this.getInitCode(),
      callData: operation.data,

      maxFeePerGas: toBeHex(maxFeePerGas),
      maxPriorityFeePerGas: toBeHex(maxPriorityFeePerGas),

      paymasterAndData: '0x',
      signature: await this.getDummySignature(),
    }

    // FIXME: move to separate method and
    //  use `eth_estimateUserOperationGas` with bundler client, not rpc provider
    const est = await this.rpcProvider.send(
      'eth_estimateUserOperationGas',
      [op, this.trueWalletConfig.entrypoint.address]
    );

    op.preVerificationGas = est.preVerificationGas;
    op.verificationGasLimit = est.verificationGasLimit ?? est.verificationGas;
    op.callGasLimit = est.callGasLimit;

    return {
      ...op,
      signature: await this.getSignature(op),
    } as UserOperationData;
  }

  private async getDummySignature(): Promise<string> {
    return await this.owner.signMessage(getBytes('0xdead'));
  }

  private async getNonce(): Promise<string> {
    return toBeHex(await this.walletSC['nonce']());
  }

  private async getInitCode(): Promise<string> {
    const args = getCreateWalletArgs(
      this.trueWalletConfig,
      await this.owner.getAddress(),
      []
    );

    const callData = encodeFunctionData(factoryABI, 'createWallet', args);

    return concat([this.factoryAddress, callData]);
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

  private async isDeployed(address: string): Promise<boolean> {
    const code = await this.rpcProvider.getCode(address);
    return code !== '0x';
  }

  private async getSignature(userOperation: Partial<UserOperationData>): Promise<string> {
    const message = await this.entrypointSC['getUserOpHash'](userOperation);
    return await this.owner.signMessage(getBytes(message));
  }
}
