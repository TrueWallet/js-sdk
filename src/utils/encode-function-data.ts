import { Interface } from "ethers";

export const encodeFunctionData = (scAbi: any[], functionName: string, functionParams: unknown[]) => {
  const abiInterface = new Interface(scAbi);
  return abiInterface.encodeFunctionData(functionName, functionParams);
}
