import { parseUnits, formatUnits } from "ethers";

/**
 * Utility function to convert wei value to the given unit value
 * @param {string | number | bigint} wei - Wei value to convert to ETH
 * @param {number} [decimals=18] - Number of decimals to use on conversion
 * @returns {string} - ETH value of given Wei
 * */
export const fromWei = (wei: string | number | bigint, decimals: number = 18): string => {
  return formatUnits(wei, decimals);
}

/**
 * Utility function to convert given unit value to the wei value
 * @param {string} eth - ETH value to convert to Wei
 * @param {number} [decimals=18] - Number of decimals to use on conversion
 * @returns {bigint} - Wei value of given ETH
 * */
export const toWei = (eth: string, decimals: number | bigint = 18): bigint => {
  return parseUnits(eth, decimals);
}
