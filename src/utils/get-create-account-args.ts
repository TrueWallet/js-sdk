import { ethers } from "ethers";

export const getCreateWalletArgs = (entrypoint: string, owner: string, salt: string, modules: string[]): any[] => {
  return [
    entrypoint,
    owner,
    172800,
    modules,
    ethers.utils.solidityKeccak256(['string'], [salt])
  ];
}
