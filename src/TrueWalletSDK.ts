import { Bundler, Network, TrueWalletConfig } from "./interfaces";
import { Contract, ethers } from "ethers";

export class TrueWalletSDK {
    private bundler: Bundler;

    private rpcProvider: ethers.providers.JsonRpcProvider;

    readonly network: Network;

    factorySC: Contract;

    constructor(config: TrueWalletConfig) {
        this.bundler = config.bundler;
        this.network = config.network;

        this.rpcProvider = new ethers.providers.JsonRpcProvider(config.rpcProviderUrl)
        this.factorySC = new ethers.Contract(config.factorySC.address, config.factorySC.abi);
    }
}
