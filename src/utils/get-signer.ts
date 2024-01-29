import { BrowserProvider, Mnemonic, solidityPackedKeccak256, Wallet } from "ethers";
import { TrueWalletSignerConfig } from "../interfaces";

export const getSigner = async (config: TrueWalletSignerConfig) => {
  switch (config.type) {
    case 'salt':
      return await getSaltSigner(config.data[0]);
    case 'injected':
      return await getInjectedSigner(config.data[0]);
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

export const getInjectedSigner = async (provider: any) => {
  const browserProvider = new BrowserProvider(provider);
  await browserProvider.send('eth_requestAccounts', []);
  return await browserProvider.getSigner();
};
