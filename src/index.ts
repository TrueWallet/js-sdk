import { TrueWalletConfig } from "./interfaces";
import { TrueWalletSDK } from './TrueWalletSDK';

export { TrueWalletErrorCodes } from './constants';
export { BundlerError } from './bundler';
export * from './user-operation-builder/user-operation-data';
export * from './types';
export * from './interfaces';
export * from './modules';
export { encodeFunctionData, isContract, toWei, fromWei, getChecksumAddress, isEthAddress } from './utils';

export async function initTrueWallet(config: TrueWalletConfig): Promise<TrueWalletSDK> {
  return await new TrueWalletSDK().init(config);
}
