import { AbstractProvider } from "ethers";

export const isContract = async (address: string, provider: AbstractProvider): Promise<boolean> => {
  const bytecode = await provider.getCode(address);
  return bytecode !== '0x';
};
