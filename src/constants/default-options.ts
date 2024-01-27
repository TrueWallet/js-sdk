import { TrueWalletConfig } from "../interfaces";
import { factoryABI, entrypointABI } from "../abis";

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
