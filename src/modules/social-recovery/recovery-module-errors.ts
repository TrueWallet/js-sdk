import { TWError } from "../../types";

export enum RecoveryErrorCodes {
  RECOVERY_EXECUTE_NOT_READY = 'RECOVERY_EXECUTE_NOT_READY',
}

export class RecoveryError extends Error implements TWError {
  readonly code = RecoveryErrorCodes.RECOVERY_EXECUTE_NOT_READY;
}
