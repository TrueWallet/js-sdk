import { TrueWalletConfig } from "./interfaces";

export { TrueWalletErrorCodes } from './constants';
export * from './types';
export * from './interfaces';
import { TrueWalletSDK } from './TrueWalletSDK';

export function init(config: Partial<TrueWalletConfig>): Promise<TrueWalletSDK>  {
  const sdk = new TrueWalletSDK(config);
  return sdk.init();
}
