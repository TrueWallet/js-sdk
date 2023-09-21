import { SmartContractConfig } from "./smart-contract-config";
import { Bundler } from "./bundler";
import { Network } from "./network";

export interface TrueWalletConfig {
    factorySC: SmartContractConfig;
    entrypointSC: SmartContractConfig;
    bundler: Bundler;
    rpcProviderUrl: string;
    network: Network;
}
