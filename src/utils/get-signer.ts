import { BrowserProvider, Mnemonic, solidityPackedKeccak256, Wallet } from "ethers";
import { TrueWalletConfig, TrueWalletSigner } from "../interfaces";
import { Eip1193Provider } from "ethers";
import { JWTSigner } from "../classes";
import { TWInvalidSignerTypeError, TWJwtInitSignerError, TWJwtSignerInvalidJwtError } from "../types";

export const getSigner = async (config: TrueWalletConfig): Promise<TrueWalletSigner> => {
  switch (config.signer.type) {
    case 'salt':
      return await getSaltSigner(config.signer.data[0] as string);
    case 'injected':
      return await getInjectedSigner(config.signer.data[0] as Eip1193Provider);
    case 'privateKey':
      return new Wallet(config.signer.data[0] as string);
    case 'jwt':
      return await getJWTSigner(config.bundlerUrl, config.signer.data[0] as string);
    default:
      throw new TWInvalidSignerTypeError(`${config.signer.type} is invalid signer type`);
  }
};

export const getSaltSigner = async (salt: string) => {
  const entropy = solidityPackedKeccak256(['string'], [salt]);
  const mnemonic = Mnemonic.entropyToPhrase(entropy);
  const { privateKey} = Wallet.fromPhrase(mnemonic);
  return new Wallet(privateKey);
}

export const getInjectedSigner = async (provider: Eip1193Provider) => {
  const browserProvider = new BrowserProvider(provider);
  await browserProvider.send('eth_requestAccounts', []);
  return await browserProvider.getSigner();
};

export const getJWTSigner = async (bundlerUrl: string, jwt: string) => {
  const url = new URL(bundlerUrl);

  const apiUrl = url.origin;
  const version = url.pathname.split('/')[1];
  const projectKey = url.pathname.split('/').slice(-1)[0];

  // TODO: uncomment to handle error
  // projectKey.replace('0', '1');

  const response = await fetch(`${apiUrl}/${version}/${projectKey}/wallets/get-address`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jwt_token: jwt }),
  });

  if (!response.ok) {
    const error = await response.json();

    switch (response.status) {
      case 400:
        throw new TWJwtSignerInvalidJwtError(error.detail.jwt_token);
      // case 401:
        // TODO: throw error
      // case 403:
        // TODO: throw error
      default:
        throw new TWJwtInitSignerError(JSON.stringify(error.detail));

    }
  }

  const { address } = await response.json();

  return new JWTSigner(address);
};
