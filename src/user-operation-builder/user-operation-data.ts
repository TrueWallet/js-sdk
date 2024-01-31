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

export interface UserOperationLog {
  address: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  logIndex: string;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}

export interface UserOperationTransactionReceipt {
  blockHash: string;
  blockNumber: string;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: UserOperationLog[];
  logsBloom: string;
  transactionHash: string;
  transactionIndex: string;
}

export interface UserOperationReceipt {
  actualGasCost: string;
  actualGasUsed: string;
  from: string;
  logs: UserOperationLog[];
  nonce: string;
  paymaster: string;
  receipt: UserOperationTransactionReceipt;
  sender: string;
  success: boolean;
  userOpHash: string;
}

export interface UserOperationResponse {
  userOperationHash: string;
  wait: () => Promise<UserOperationReceipt>;
}
