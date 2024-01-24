import { TrueWalletErrorCodes } from "../constants";

export interface TrueWalletErrorConfig {
  message: string;
  code: TrueWalletErrorCodes;
}

export class TrueWalletError extends Error {
  code: TrueWalletErrorCodes;

  constructor(error: TrueWalletErrorConfig) {
    super(error.message);
    this.code = error.code;
  }
}
