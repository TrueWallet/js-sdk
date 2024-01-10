import { Addressable } from "ethers";

export interface OperationParams {
  sender: Addressable;
  data: string;
}

export interface UserOperationData {
  sender: Addressable;
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
