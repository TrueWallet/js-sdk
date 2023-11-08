import { ethers } from "ethers";

export const encodeFunctionData = (scAbi: any[], functionName: string, functionParams: unknown[]) => {
  const abiInterface = new ethers.utils.Interface(scAbi);
  return abiInterface.encodeFunctionData(functionName, functionParams);
}
