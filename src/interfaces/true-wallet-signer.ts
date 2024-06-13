export type TrueWalletSigner = {
  address: string;
  signMessage(message: string | Uint8Array): Promise<string>;
}
