import { Interface, InterfaceAbi } from "ethers/lib.commonjs/abi";

export interface SendParams {
  amount: number | string | bigint;
  to: string;
  from: string;
}

export interface SendErc20Params extends SendParams {
  contractAddress: string;
}

export interface ContractCallParams {
  address: string;
  abi: InterfaceAbi | Interface;
  method: string;
  args: unknown[];
}

export interface ContractWriteParams extends ContractCallParams {
  payableAmount?: number | string;
}

export interface ApproveErc20Params {
  spender: string,
  contractAddress: string,
  amount: bigint | number | string
}

export interface ApproveErc721Params {
  to: string,
  contractAddress: string,
  tokenId: number
}

export interface ApproveAllErc721Params {
  operator: string,
  approved: boolean,
  contractAddress: string
}

export interface TransferErc721Params {
  from: string,
  to: string,
  tokenId: number,
  contractAddress: string
}

export interface SafeTransferErc721Params extends TransferErc721Params {
  data?: string;
}

export interface BaseErc1155TransferParams {
  from: string,
  to: string,
  data?: string,
  contractAddress: string
}

export interface TransferErc1155Params extends BaseErc1155TransferParams {
  id: number,
  value: number
}

export interface BatchTransferErc1155Params extends BaseErc1155TransferParams {
  ids: number[],
  values: number[]
}

export interface SetApprovalForAllErc1155Params {
  operator: string,
  approved: boolean,
  contractAddress: string
}
