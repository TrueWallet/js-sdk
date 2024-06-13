import { BundlerMethods } from "./bundler-methods";
import { UserOperationData, UserOperationReceipt, UserOperationResponse } from "../user-operation-builder";
import { BundlerError, BundlerMaxRetriesError } from "./bundler-error";
import { getAddress } from "ethers";


/**
 * @type BundlerConfig - parameters for bundler client
 * @param {string} url - the url of the bundler server
 * @param {string} entrypoint - the address of the entrypoint smart contract
 * */
export type BundlerConfig = {
  url: string,
  entrypoint: string,
}

export type GasEstimation = {
  callGasLimit: number,
  preVerificationGas: number,
  // Fixme: Some property should be calculated depending on this value
  verificationGas: number,
  verificationGasLimit?: number,
}


/**
 * @class BundlerClient - http client for interacting with the bundler server
 * */
export class BundlerClient {
  protected readonly bundlerUrl: string;
  protected readonly entrypoint: string;
  private id: number = 0;

  constructor(config: BundlerConfig) {
    this.bundlerUrl = config.url;
    this.entrypoint = getAddress(config.entrypoint);
  }

  /**
   * @method sendUserOperation - send user operation to the bundler server
   * @param {UserOperationData} operation - user operation data
   * @returns {string} Promise<string> - userOperationHash
   * */
  async sendUserOperation(operation : UserOperationData): Promise<UserOperationResponse> {
    const opHash = await this.fetch<string>(BundlerMethods.sendUserOperation, [operation, this.entrypoint]);

    return {
      userOperationHash: opHash,
      wait: (maxRetry: number = 0) => this.getUserOperationReceipt(opHash, maxRetry),
    }
  }

  estimateUserOperationGas(operation: Partial<UserOperationData>): Promise<GasEstimation> {
    return this.fetch<GasEstimation>(BundlerMethods.estimateUserOperationGas, [operation, this.entrypoint]);
  }

  getUserOperationByHash(hash: string): Promise<UserOperationData | null> {
    return this.fetch<UserOperationData>(BundlerMethods.getUserOperationByHash, [hash, this.entrypoint]);
  }

  getUserOperationReceipt(hash: string, maxRetry: number = 0): Promise<UserOperationReceipt> {
    const useRetry = maxRetry > 0;
    let retries = 0;

    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          const receipt = await this.fetch<UserOperationReceipt>(BundlerMethods.getUserOperationReceipt, [hash]);

          if (receipt === null) {
            if (useRetry && retries >= maxRetry) {
              return reject(new BundlerMaxRetriesError('User operation not found'));
            }

            retries++;
            setTimeout(execute, 3000);
          } else {
            resolve(receipt);
          }
        } catch (e) {
          reject(e);
        }
      };

      execute();
    });
  }

  getSupportedEntryPoints(): Promise<string[]> {
    return this.fetch<string[]>(BundlerMethods.supportedEntryPoints, []);
  }

  protected async fetch<T>(method: BundlerMethods, data: unknown[], options: RequestInit = {}): Promise<T> {
    const body: BodyInit = JSON.stringify({
      jsonrpc: '2.0',
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

    const res = await fetch(this.bundlerUrl, Object.assign({}, defaultOptions, options)).then((res) => res.json());

    if (res.error) {
      throw new BundlerError(res.error.message);
    }

    return res.result;
  }

  protected getId(): number {
    return this.id++;
  }
}
