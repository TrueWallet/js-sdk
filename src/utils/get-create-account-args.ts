import { AbiCoder, concat, solidityPackedKeccak256 } from "ethers";
import { Modules } from "../constants";
import { TrueWalletConfig } from "../interfaces";

export const getCreateWalletArgs = (
  config: TrueWalletConfig,
  owner: string,
  modules: string[]
): any[] => {

  const securityInitData = getSecurityModuleInitData();
  return [
    config.entrypoint.address,
    owner,
    [
      securityInitData,
      ...modules,
    ],
    solidityPackedKeccak256(['string'], [config.salt])
  ];
}

export const getSecurityModuleInitData = (): string => {
  const securityCallData = AbiCoder.defaultAbiCoder().encode(['uint32'], [1]);
  return concat([Modules.SecurityControlModule, securityCallData]);
};
