import { JsonRpcProvider } from "ethers";
import { UserOperationBuilder, UserOperationResponse } from "../user-operation-builder";
import { BundlerClient } from "../bundler";
import { ContractCallParams, ContractWriteParams, SendErc20Params, SendParams } from "./true-wallet-params";
import { TrueWalletModules } from "../types";

export interface TrueWallet {
  ready: boolean;
  rpcProvider: JsonRpcProvider;
  operationBuilder: UserOperationBuilder;
  bundler: BundlerClient;

  get address(): string;

  getBalance(): Promise<string>;
  getNonce(): Promise<bigint>;
  getERC20Balance(tokenAddress: string): Promise<string>;
  send(params: SendParams, paymaster?: string): Promise<UserOperationResponse>;
  sendErc20(params: SendErc20Params, paymaster?: string): Promise<UserOperationResponse>;
  deployWallet(paymaster?: string): Promise<UserOperationResponse>;
  execute(payload: string, target?: string, value?: string, paymaster?: string): Promise<UserOperationResponse>;
  contractCall(params: ContractWriteParams, paymaster?: string): Promise<UserOperationResponse>;
  contractRead(params: ContractCallParams): Promise<unknown>;
  installModule(module: TrueWalletModules, moduleData: unknown): Promise<UserOperationResponse>;
  removeModule(module: TrueWalletModules): Promise<UserOperationResponse>;
  getInstalledModules(): Promise<string[]>;
  getModuleAddress(module: TrueWalletModules): string;
  isWalletOwner(address: string): Promise<boolean>;
}
