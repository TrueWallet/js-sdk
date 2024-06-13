import { TWWalletNotReadyError } from "../types";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const walletReady = (originalMethod: any, _context: unknown) => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return async function replacementMethod(this: any, ...args: unknown[]) {
    if (!this.ready) {
      this.ready = await this.isWalletReady();

      if (!this.ready) {
        throw new TWWalletNotReadyError(`Wallet is not smart contract yet.`);
      }
    }

    return originalMethod.call(this, ...args);
  }
}
