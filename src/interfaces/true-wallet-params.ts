import { Interface, InterfaceAbi } from "ethers/lib.commonjs/abi";

export interface SendParams {
  amount: number | string;
  to: string;
}

export interface SendErc20Params extends SendParams {
  tokenAddress: string;
}

export interface ContractCallParams {
  address: string;
  abi: InterfaceAbi | Interface;
  method: string;
  args: unknown[];
}

export interface ContractWriteParams extends ContractCallParams {
  payableAmount?: number | string;
  paymaster?: string;
}
