import { Interface } from "ethers";
import { InterfaceAbi } from "ethers";

export const encodeFunctionData = (scAbi: InterfaceAbi, functionName: string, functionParams: unknown[]) => {
  const abiInterface = new Interface(scAbi);
  return abiInterface.encodeFunctionData(functionName, functionParams);
}
