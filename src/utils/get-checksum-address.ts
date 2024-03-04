import { getAddress } from "ethers";

/**
 * Utility function to get the checksum address of given address
 * @param {string} address - Address to get the checksum address
 * @returns {string} - Checksum address of given address
 * */
export const getChecksumAddress = (address: string): string => {
  return getAddress(address);
}
