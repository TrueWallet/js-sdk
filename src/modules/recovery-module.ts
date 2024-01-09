import { BigNumber, constants, Contract, ethers, providers, Signer } from "ethers";
import { Modules } from "../constants";
import { SocialRecoveryModuleAbi, TrueWalletAbi } from "../abis";
import { encodeFunctionData } from "../utils";
import { UserOperationBuilder } from "../user-operation-builder";
import { BundlerClient } from "../bundler";
import { SecurityControlModuleAbi } from "../abis/security-control-module-abi";


export type RecoveryModuleData = {
  guardians: string[],
  threshold: number,
  anonymousGuardiansSalt?: number,
}

export interface TrueWalletRecoveryModuleConfig {
  walletAddress: string;
  operationBuilder: UserOperationBuilder;
  bundlerClient: BundlerClient;
  signer: Signer;
}

export const getRecoveryModuleInitData = (data: RecoveryModuleData): string => {
  let callData = ethers.utils.defaultAbiCoder.encode(
    ['address[]', 'uint256', 'bytes32'],
    [data.guardians, data.threshold, ethers.constants.HashZero]
  );

  const isAnonymous = !!data.anonymousGuardiansSalt;

  if (isAnonymous) {
    const guardiansHash = ethers.utils.solidityKeccak256(
      ['address[]', 'uint256'],
      [data.guardians, data.anonymousGuardiansSalt]
    );

    callData = ethers.utils.defaultAbiCoder.encode(
      ['address[]', 'uint256', 'bytes32'],
      [[], data.threshold, guardiansHash]
    );
  }

  return ethers.utils.hexConcat([Modules.SocialRecoveryModule, callData]);
};


export class TrueWalletRecoveryModule {
  private readonly signer: Signer;
  private readonly walletAddress: string;
  private operationBuilder: UserOperationBuilder;
  bundlerClient: BundlerClient;
  recoveryModuleSC: Contract;

  constructor(config: TrueWalletRecoveryModuleConfig) {
    this.operationBuilder = config.operationBuilder;
    this.bundlerClient = config.bundlerClient;
    this.recoveryModuleSC = new Contract(Modules.SocialRecoveryModule, SocialRecoveryModuleAbi, config.signer);
    this.walletAddress = config.walletAddress;
    this.signer = config.signer;
  }

  async install(data: RecoveryModuleData): Promise<string> {
    const recoveryInitData = getRecoveryModuleInitData(data);

    const security = new ethers.Contract(Modules.SecurityControlModule, SecurityControlModuleAbi, this.signer);
    const txResponse = await security.execute(
      this.walletAddress,
      encodeFunctionData(TrueWalletAbi, 'addModule', [recoveryInitData]),
    );
    const txReceipt = await txResponse.wait();
    return txReceipt.transactionHash;
  }

  async getGuardians(): Promise<string[]> {
    return this.recoveryModuleSC['getGuardians'](this.walletAddress);
  }

  async getGuardiansCount(): Promise<BigNumber> {
    return this.recoveryModuleSC['guardiansCount'](this.walletAddress);
  }

  async encodeSocialRecoveryData(newOwners: string[]): Promise<string> {
    const nonce = await this.nonce();
    return this.recoveryModuleSC.encodeSocialRecoveryData(this.walletAddress, newOwners, nonce);
  }

  async isGuardian(guardianAddress: string): Promise<boolean> {
    return this.recoveryModuleSC['isGuardian'](this.walletAddress, guardianAddress);
  }

  async hasGuardianApproved(guardianAddress: string, owners: string[]): Promise<boolean> {
    return this.recoveryModuleSC['hasGuardianApproved'](guardianAddress, this.walletAddress, owners);
  }

  async pendingGuardian(): Promise<string[]> {
    return this.recoveryModuleSC['pendingGuardian'](this.walletAddress);
  }

  async getGuardiansHash(): Promise<string> {
    return this.recoveryModuleSC['getGuardiansHash'](this.walletAddress);
  }

  async getRecoveryApprovals(newOwners: string[]): Promise<number> {
    return this.recoveryModuleSC['getRecoveryApprovals'](this.walletAddress, newOwners);
  }

  async getRecoveryEntry(): Promise<string> {
    return this.recoveryModuleSC['getRecoveryEntry'](this.walletAddress);
  }

  async nonce(): Promise<number> {
    const nonce: BigNumber = await this.recoveryModuleSC['nonce'](this.walletAddress);
    return nonce.toNumber();
  }

  async getSocialRecoveryHash(newOwners: string[]): Promise<string> {
    const nonce = await this.nonce();
    return this.recoveryModuleSC['getSocialRecoveryHash'](this.walletAddress, newOwners, nonce);
  }

  async getThreshold(): Promise<number> {
    const threshold: BigNumber = await this.recoveryModuleSC['threshold'](this.walletAddress);
    return threshold.toNumber();
  }

  /**
   * Should be called by guardian to start recovery process
   * @param walletAddress - address of the wallet that is being restored
   * @param newOwners - list of new owners of the restored wallet
   * @returns Promise<string> - userOperationHash
   * */
  // TODO: check method when wallet is guardian
  async approveRecovery(walletAddress: string, newOwners: string[]): Promise<string> {
    const functionName = 'approveRecovery';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [walletAddress, newOwners]);
    return this.executeFn(functionName, txData);
  }

  // fixme: check signatures
  async batchApproveRecovery(newOwners: string[], signatureCount: number, signatures: string): Promise<string> {
    const functionName = 'batchApproveRecovery';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress, newOwners, signatureCount, signatures]);
    return this.executeFn(functionName, txData);
  }

  async cancelSetGuardians(): Promise<string> {
    const functionName = 'cancelSetGuardians';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress]);
    return this.executeFn(functionName, txData);
  }

  // fixme: check signatures
  async checkNSignatures(dataHash: string, _signatureCount: number, signatures: string): Promise<string> {
    const functionName = 'checkNSignatures';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress, dataHash, _signatureCount, signatures]);
    return this.executeFn(functionName, txData);
  }

  /**
   * Should be called by guardian to approve and set new owner of the wallet
   * Before executing this function, guardian should call `approveRecovery` function `threshold` times
   * @param wallet - address of the wallet that is being restored
   * @returns Promise<string> - userOperationHash
   * */
  // TODO: check method when wallet is guardian
  async executeRecovery(wallet: string): Promise<string> {
    const functionName = 'executeRecovery';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [wallet]);
    return this.executeFn(functionName, txData);
  }

  async processGuardianUpdates(): Promise<string> {
    const functionName = 'processGuardianUpdates';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress]);
    return this.executeFn(functionName, txData);
  }

  async revealAnonymousGuardians(guardians: string[], salt: number): Promise<string> {
    const functionName = 'revealAnonymousGuardians';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress, guardians, salt]);
    return this.executeFn(functionName, txData);
  }

  async updatePendingGuardians(threshold: number, guardiansHash: string): Promise<string> {
    const functionName = 'updatePendingGuardians';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress, threshold, guardiansHash]);
    return this.executeFn(functionName, txData);
  }

  async cancelRecovery(): Promise<string> {
    // FIXME: issue in alchemy rundler
    const functionName = 'cancelRecovery';
    const txData = this.recoveryModuleSC.interface.encodeFunctionData(functionName, [this.walletAddress]);
    return this.executeFn(functionName, txData);
  }

  private async executeFn(functionName: string, txData: string, payableAmount: BigNumber = constants.Zero): Promise<string> {
    const callData = encodeFunctionData(TrueWalletAbi, 'execute', [
      Modules.SocialRecoveryModule,
      payableAmount,
      txData,
    ]);

    const userOperation = await this.operationBuilder.buildOperation({
      sender: this.walletAddress,
      data: callData,
    });

    return this.bundlerClient.sendUserOperation(userOperation);
  }
}
