import { SmartContractConfig } from "./smart-contract-config";

export interface TrueWalletConfig {
  factory: SmartContractConfig;
  entrypoint: SmartContractConfig;
  rpcProviderUrl: string;
  bundlerUrl: string;
  salt: string;
}
