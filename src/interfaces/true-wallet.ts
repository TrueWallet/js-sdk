import { JsonRpcProvider } from "ethers";
import { UserOperationBuilder, UserOperationResponse } from "../user-operation-builder";
import { BundlerClient } from "../bundler";
import { ContractCallParams, ContractWriteParams, SendParams } from "./true-wallet-params";
import { TrueWalletModules } from "../types";
import { Erc20Manager, Erc721Manager } from "../classes";

export interface TrueWallet {
  ready: boolean;
  rpcProvider: JsonRpcProvider;
  operationBuilder: UserOperationBuilder;
  bundler: BundlerClient;
  erc20: Erc20Manager;
  erc721: Erc721Manager;

  get address(): string;

  getBalance(): Promise<string>;
  getNonce(): Promise<bigint>;
  send(params: Omit<SendParams, 'from'>, paymaster?: string): Promise<UserOperationResponse>;
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
