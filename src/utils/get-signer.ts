import { BrowserProvider, Mnemonic, solidityPackedKeccak256, Wallet } from "ethers";
import { TrueWalletConfig, TrueWalletSigner } from "../interfaces";
import { Eip1193Provider } from "ethers";
import { JWTSigner, JWTSignerService } from "../classes";
import { TWInvalidSignerTypeError } from "../types";

export const getSigner = async (config: TrueWalletConfig): Promise<TrueWalletSigner> => {
  switch (config.signer.type) {
    case 'salt':
      return await getSaltSigner(config.signer.data[0] as string);
    case 'injected':
      return await getInjectedSigner(config.signer.data[0] as Eip1193Provider);
    case 'privateKey':
      return new Wallet(config.signer.data[0] as string);
    case 'jwt':
      return await getJWTSigner(config.bundlerUrl, config.signer.data[0] as () => Promise<string>);
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

export const getJWTSigner = async (bundlerUrl: string, jwt: () => Promise<string>) => {
  const url = new URL(bundlerUrl);

  const apiUrl = url.origin;
  const [_, version, projectKey] = url.pathname.split('/');

  const service = new JWTSignerService(`${apiUrl}/${version}/${projectKey}`, jwt);
  const signer = new JWTSigner(service);
  await signer.init();

  return signer;
};
