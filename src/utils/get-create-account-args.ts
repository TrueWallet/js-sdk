import { AbiCoder, concat, solidityPackedKeccak256 } from "ethers";
import { Modules } from "../constants";

export const getCreateWalletArgs = (
  walletIndex: number,
  entrypoint: string,
  owner: string,
  modules: string[],
): unknown[] => {

  const securityInitData = getSecurityModuleInitData();
  return [
    entrypoint,
    owner,
    [
      securityInitData,
      ...modules,
    ],
    solidityPackedKeccak256(['string'], [walletIndex.toString()]),
  ];
}

export const getSecurityModuleInitData = (): string => {
  const securityCallData = AbiCoder.defaultAbiCoder().encode(['uint32'], [1]);
  return concat([Modules.SecurityControlModule, securityCallData]);
};
