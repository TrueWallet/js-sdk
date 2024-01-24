import { TrueWalletConfig } from "../interfaces";
import { factoryABI } from "../abis/factory-abi";
import { entrypointABI } from "../abis/entrypoint-abi";

const defaultOptions: Partial<TrueWalletConfig> = {
  factory: {
    address: <string>process.env.FACTORY_ADDRESS,
    abi: factoryABI,
  },
  entrypoint: {
    address: <string>process.env.ENTRYPOINT_ADDRESS,
    abi: entrypointABI,
  },
};

export default defaultOptions;
