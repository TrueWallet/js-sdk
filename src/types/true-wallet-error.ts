import { TWErrorCodes } from "../constants";

export interface TWError {
  message: string;
  readonly code: string;
}

export class TWConfigError extends Error implements TWError {
  code = TWErrorCodes.CONFIG_ERROR;
}

export class TWUnsupportedModuleError extends Error implements TWError {
  code = TWErrorCodes.MODULE_NOT_SUPPORTED;
}

export class TWModuleNotInstalledError extends Error implements TWError {
  code = TWErrorCodes.MODULE_NOT_INSTALLED;
}

export class TWModuleAlreadyInstalledError extends Error implements TWError {
  code = TWErrorCodes.MODULE_ALREADY_INSTALLED;
}

export class TWOwnerCallError extends Error implements TWError {
  code = TWErrorCodes.WALLET_NOT_OWNED;
}

export class TWWalletNotReadyError extends Error implements TWError {
  code = TWErrorCodes.WALLET_NOT_READY;
}

export class TWInvalidSignerTypeError extends Error implements TWError {
  code = TWErrorCodes.INVALID_SIGNER_TYPE;
}

export class TWJwtSignerInvalidJwtError extends Error implements TWError {
  code = TWErrorCodes.JWT_SIGNER_INVALID_JWT;
}

export class TWJwtInitSignerError extends Error implements TWError {
  code = TWErrorCodes.JWT_INIT_SIGNER_ERROR;
}

export class TWCallException extends Error implements TWError {
  code = TWErrorCodes.CALL_EXCEPTION;
}
