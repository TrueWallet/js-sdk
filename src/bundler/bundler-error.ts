export enum BundlerErrorCodes {
  BUNDLER_ERROR = 'BUNDLER_ERROR',
}

export type BundlerErrorConfig = {
  code: BundlerErrorCodes;
  message: string
};

export class BundlerError extends Error {
  code: BundlerErrorCodes;

  constructor(error: BundlerErrorConfig) {
    super(error.message);
    this.code = error.code;
  }
}
