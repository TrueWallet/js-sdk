import { AbiCoder, concat } from "ethers";
import { Modules } from "../constants";

export const getSecurityModuleInitData = (): string => {
  const securityCallData = AbiCoder.defaultAbiCoder().encode(['uint32'], [1]);
  return concat([Modules.SecurityControlModule, securityCallData]);
};
