import { TrueWalletErrorCodes } from "../constants";

export interface TrueWalletErrorConfig {
  message: string;
  code: TrueWalletErrorCodes;
}

export class TrueWalletError extends Error {
  constructor(error: TrueWalletErrorConfig) {
    super(error.message);
  }
}
