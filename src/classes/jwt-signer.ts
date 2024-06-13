import { TrueWalletSigner } from "../interfaces";

export class JWTSigner implements TrueWalletSigner {
  private readonly _address: string;

  get address(): string {
    return this._address;
  }

  constructor(address: string) {
    this._address = address;
  }

  async signMessage(_message: string | Uint8Array): Promise<string> {
    // TODO: implement
    return '';
  }
}
