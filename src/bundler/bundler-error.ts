import { TWError } from "../types";

export enum BundlerErrorCodes {
  BUNDLER_ERROR = 'BUNDLER_ERROR',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED',
}

export class BundlerError extends Error implements TWError {
  readonly code = BundlerErrorCodes.BUNDLER_ERROR;
}

export class BundlerMaxRetriesError extends Error implements TWError {
  readonly code = BundlerErrorCodes.MAX_RETRIES_EXCEEDED;
}
