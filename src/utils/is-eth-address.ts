import { isAddress } from "ethers";

/**
 * Utility function to check if given address is a valid Ethereum address
 * @param {string} address - Address to check if it is a valid Ethereum address
 * @returns {boolean} - true if given address is a valid Ethereum address, false otherwise
 * */
export const isEthAddress = (address: string): boolean => {
  return isAddress(address);
}
