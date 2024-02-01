import { BrowserProvider, Mnemonic, solidityPackedKeccak256, Wallet } from "ethers";
import { TrueWalletSignerConfig } from "../interfaces";
import { Eip1193Provider } from "ethers";

export const getSigner = async (config: TrueWalletSignerConfig) => {
  switch (config.type) {
    case 'salt':
      return await getSaltSigner(config.data[0] as string);
    case 'injected':
      return await getInjectedSigner(config.data[0] as Eip1193Provider);
    case 'privateKey':
      return new Wallet(config.data[0] as string);
    default:
      throw new Error('Invalid signer type');
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
