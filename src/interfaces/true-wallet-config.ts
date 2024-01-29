import { TrueWalletSignerConfig } from "./true-wallet-signer-config";

export interface TrueWalletConfig {
  rpcProviderUrl: string;
  bundlerUrl: string;
  signer: TrueWalletSignerConfig;
}
