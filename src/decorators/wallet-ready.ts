import { TrueWalletError } from "../types";
import { TrueWalletErrorCodes } from "../constants";

export const walletReady = (originalMethod: any, _context: any) => {
  return async function replacementMethod(this: any, ...args: any[]) {
    if (!this.ready) {
      this.ready = await this.isWalletReady();

      if (!this.ready) {
        throw new TrueWalletError({
          code: TrueWalletErrorCodes.WALLET_NOT_READY,
          message: `Wallet is not smart contract yet.`
        });
      }
    }

    return  originalMethod.call(this, ...args);
  }
}
