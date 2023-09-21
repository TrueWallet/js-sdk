import { Bundler, Network, TrueWalletConfig } from "./interfaces";
import { Contract, ethers } from "ethers";

export class TrueWalletSDK {
    private bundler: Bundler;

    private readonly rpcProvider: ethers.providers.JsonRpcProvider;

    readonly network: Network;

    private readonly factorySC: Contract;
    private entrypointSC: Contract;

    private ownerWallet: ethers.Wallet;

    constructor(config: TrueWalletConfig) {
        this.bundler = config.bundler;
        this.network = config.network;

        this.rpcProvider = new ethers.providers.JsonRpcProvider(config.rpcProviderUrl)
        this.factorySC = new ethers.Contract(config.factorySC.address, config.factorySC.abi);
        this.entrypointSC = new ethers.Contract(config.entrypointSC.address, config.entrypointSC.abi);
    }

    async getWalletAddress(entropy: string): Promise<string> {
        const ownerPk = this.getOwnerPk(entropy);
        this.ownerWallet = new ethers.Wallet(ownerPk, this.rpcProvider);

        const args = [
            this.entrypointSC.address,
            this.ownerWallet.address,
            172800,
            ethers.utils.keccak256(ethers.utils.hexlify(Number(entropy)))
        ];

        return await this.factorySC['getWalletAddress'](...args);
    }

    private getOwnerPk(entropy: string): string {
        const mnemonic = ethers.utils.entropyToMnemonic(entropy);
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);

        return wallet.privateKey;
    }
}
