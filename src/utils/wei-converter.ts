import { parseUnits, formatUnits } from "ethers";

/**
 * Utility function to convert Wei value to the ETH value
 * @param {string | number | bigint} wei - Wei value to convert to ETH
 * @param {number} [decimals=18] - Number of decimals to use on conversion
 * @returns {string} - ETH value of given Wei
 * */
export const weiToEth = (wei: string | number | bigint, decimals: number = 18): string => {
  return formatUnits(wei, decimals);
}

/**
 * Utility function to convert ETH value to the Wei value
 * @param {string} eth - ETH value to convert to Wei
 * @param {number} [decimals=18] - Number of decimals to use on conversion
 * @returns {bigint} - Wei value of given ETH
 * */
export const ethToWei = (eth: string, decimals: number = 18): bigint => {
  return parseUnits(eth, decimals);
}
