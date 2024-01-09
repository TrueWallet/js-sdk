import { TrueWalletConfig } from "../interfaces";
import { factoryABI } from "../abis/factory-abi";
import { entrypointABI } from "../abis/entrypoint-abi";

const defaultOptions: TrueWalletConfig = {
  factory: {
    address: <string>process.env.FACTORY_ADDRESS,
    abi: factoryABI,
  },
  rpcProviderUrl: <string>process.env.DEFAULT_RPC_URL,
  bundleUrl: <string>process.env.DEFAULT_BUNDLER_URL,
  entrypoint: {
    address: <string>process.env.ENTRYPOINT_ADDRESS,
    abi: entrypointABI,
  },
};

export default defaultOptions;
