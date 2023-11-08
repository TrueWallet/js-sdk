import { SmartContractConfig } from "./smart-contract-config";
import { Network } from "./network";

export interface TrueWalletConfig {
  factory: SmartContractConfig;
  entrypoint: SmartContractConfig;
  rpcProviderUrl: string;
  bundleUrl: string;
  network?: Network;
  salt?: string;
}
