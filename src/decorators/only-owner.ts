import { TWOwnerCallError } from "../types";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const onlyOwner = (originalMethod: any, _context: unknown) => {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return async function replacementMethod(this: any, ...args: unknown[]) {
    if (!this.ready) {
      this.ready = await this.isWalletReady();
    }

    if (this.ready) {
      const isOwner = await this.isWalletOwner(this.signer.address);

      if (!isOwner) {
        throw new TWOwnerCallError('This operation is allowed only for the wallet owner.');
      }
    }

    return  originalMethod.call(this, ...args);
  }
};
