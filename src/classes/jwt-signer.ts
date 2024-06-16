import { TrueWalletSigner } from "../interfaces";
import {
  TWJwtInitSignerError,
  TWJwtSignerInitializedError,
  TWJwtSignerInvalidJwtError,
  TWJwtSignerInvalidKeyError, TWJwtSignerLimitError
} from "../types";
import { hexlify } from "ethers";

export class JWTSignerService {
  private readonly _apiUrl: string;
  private readonly _getJwt: () => Promise<string>;

  protected readonly endpoints = {
    getAddress: 'wallets/get-address',
    getSignature: 'wallets/sign',
  }

  constructor(apiUrl: string, getJwt: () => Promise<string>) {
    this._apiUrl = apiUrl;
    this._getJwt = getJwt;
  }

  async getAddress(): Promise<string> {
    const requestOptions = this._getDefaultRequestOptions();

    const response = await fetch(
      `${this._apiUrl}/${this.endpoints.getAddress}`,
      {
        ...requestOptions,
        body: JSON.stringify({
          jwt_token: await this._getJwt(),
        }),
      }
    );

    if (!response.ok) {
      await this._handleError(response);
    }

    const { address } = await response.json();
    return address;
  }

  async sign(message: string ): Promise<string> {
    const requestOptions = this._getDefaultRequestOptions();

    const response = await fetch(
      `${this._apiUrl}/${this.endpoints.getSignature}`,
      {
        ...requestOptions,
        body: JSON.stringify({
          message,
          jwt_token: await this._getJwt(),
          // TODO: extend message type
          message_type: 'hash', // hash | message
          // TODO: extend wallet type
          wallet_type: 'evm'
        }),
      }
    );

    if (!response.ok) {
      await this._handleError(response);
    }

    const { signature } = await response.json();
    return signature;
  }

  private async _handleError(response: Response): Promise<void> {
    const error = await response.json();

    switch (response.status) {
      case 400:
        throw new TWJwtSignerInvalidJwtError(Object.values(error.detail).join(' '));
      case 401:
        throw new TWJwtSignerInvalidKeyError(error.detail);
      case 403:
        throw new TWJwtSignerLimitError(error.detail);
      default:
        throw new TWJwtInitSignerError(JSON.stringify(error.detail));
    }
  }

  private _getDefaultRequestOptions(): RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }
}

export class JWTSigner implements TrueWalletSigner {
  private _service: JWTSignerService;

  private _initialized = false;
  private _address: string | null = null;

  get address(): string {
    return this._address as string;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  constructor(service: JWTSignerService) {
    this._service = service;
  }

  async init(): Promise<void> {
    if (this._initialized) {
      throw new TWJwtSignerInitializedError('JWT Signer is already initialized');
    }

    this._address = await this._service.getAddress();
    this._initialized = true;
  }

  async signMessage(_message: string | Uint8Array): Promise<string> {
    const message = _message instanceof Uint8Array ? hexlify(_message) : _message;
    return await this._service.sign(message);
  }
}
