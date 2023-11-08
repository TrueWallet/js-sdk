import { BundlerMethods } from "./bundler-methods";
import { UserOperationData } from "../user-operation-builder";
import { BundlerError, BundlerErrorCodes } from "./bundler-error";
import { ethers } from "ethers";

export type BundlerConfig = {
  url: string,
  entrypoint: string,
}

export type GasEstimation = {
  callGasLimit: number,
  preVerificationGas: number,
  // Fixme: Some property should be calculated depending on this value
  verificationGas: number,
}

export class BundlerClient {
  protected readonly bundlerUrl: string;
  protected readonly entrypoint: string;
  private id: number = 0;

  constructor(config: BundlerConfig) {
    this.bundlerUrl = config.url;
    this.entrypoint = ethers.utils.getAddress(config.entrypoint);
  }

  async sendUserOperation(operation : UserOperationData): Promise<any> {
    return await this.fetch(BundlerMethods.sendUserOperation, [operation, this.entrypoint]);
  }

  estimateUserOperationGas(operation: UserOperationData): Promise<GasEstimation> {
    return this.fetch<GasEstimation>(BundlerMethods.estimateUserOperationGas, [operation, this.entrypoint]);
  }

  getUserOperationByHash(hash: string): Promise<UserOperationData> {
    return this.fetch<UserOperationData>(BundlerMethods.getUserOperationByHash, [hash, this.entrypoint]);
  }

  getUserOperationReceipt(hash: string): Promise<any> {
    return this.fetch(BundlerMethods.getUserOperationReceipt, [hash, this.entrypoint]);
  }

  getSupportedEntryPoints(): Promise<string[]> {
    return this.fetch<string[]>(BundlerMethods.supportedEntryPoints, []);
  }

  protected async fetch<T>(method: BundlerMethods, data: any[], options: RequestInit = {}): Promise<T> {
    const body: BodyInit = JSON.stringify({
      jsonrpc: '2.0',
      // TODO: check logic,
      id: this.getId(),
      method: method,
      params: data,
    });

    const defaultOptions: RequestInit = {
      method: 'POST',
      body,
      headers: {
        "Content-Type": "application/json",
      }
    }

    const res = await fetch(this.bundlerUrl, Object.assign(defaultOptions, options)).then((res) => res.json());

    if (res.error) {
      throw new BundlerError({
        code: BundlerErrorCodes.BUNDLER_ERROR,
        message: res.error.message,
      });
    }

    return res.result;
  }

  protected getId(): number {
    return this.id++;
  }
}
