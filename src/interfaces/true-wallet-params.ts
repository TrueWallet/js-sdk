export interface SendParams {
  amount: number | string;
  to: string;
}

export interface SendErc20Params extends SendParams {
  tokenAddress: string;
}
