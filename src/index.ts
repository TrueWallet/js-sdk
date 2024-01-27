import { TrueWalletConfig } from "./interfaces";
import { TrueWalletSDK } from './TrueWalletSDK';

export { TrueWalletErrorCodes } from './constants';
export { BundlerError } from './bundler';
export * from './types';
export * from './interfaces';
export * from './modules';
export { encodeFunctionData } from './utils';

export async function init(config: Partial<TrueWalletConfig>): Promise<TrueWalletSDK> {
  return await new TrueWalletSDK(config).init();
}
