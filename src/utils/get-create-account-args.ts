import { ethers } from "ethers";
import { Modules } from "../constants";
import { RecoveryModuleData } from "../modules";
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
    ethers.utils.solidityKeccak256(['string'], [config.salt])
  ];
}

export const getSecurityModuleInitData = (): string => {
  const securityCallData = ethers.utils.defaultAbiCoder.encode(['uint32'], [1]);
  return ethers.utils.hexConcat([Modules.SecurityControlModule, securityCallData]);
};
