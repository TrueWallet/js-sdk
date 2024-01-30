import { TrueWalletError } from "../types";
import { TrueWalletErrorCodes } from "../constants";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const walletReady = (originalMethod: any, _context: unknown) => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return async function replacementMethod(this: any, ...args: unknown[]) {
    if (!this.ready) {
      this.ready = await this.isWalletReady();

      if (!this.ready) {
        throw new TrueWalletError({
          code: TrueWalletErrorCodes.WALLET_NOT_READY,
          message: `Wallet is not smart contract yet.`
        });
      }
    }

    return originalMethod.call(this, ...args);
  }
}
