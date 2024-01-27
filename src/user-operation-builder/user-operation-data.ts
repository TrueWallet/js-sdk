export interface OperationParams {
  sender: string;
  callData: string;
  initCode: string;
  nonce: string;
}

export interface UserOperationData {
  sender: string;
  nonce: bigint | string;
  initCode: string;
  callData: string;
  callGasLimit: number | string;
  verificationGasLimit: number | string;
  preVerificationGas: number | string;
  maxFeePerGas: number | string;
  maxPriorityFeePerGas: number | string;
  paymasterAndData: string;
  signature: string;
}
