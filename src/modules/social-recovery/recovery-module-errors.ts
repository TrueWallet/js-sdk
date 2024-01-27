export enum RecoveryErrorCodes {
  RECOVERY_EXECUTE_NOT_READY = 'RECOVERY_EXECUTE_NOT_READY',
}

export class RecoveryError extends Error {
  code: RecoveryErrorCodes;

  constructor(err: {code: RecoveryErrorCodes, message: string}) {
    super(err.message);
    this.code = err.code;
  }
}
