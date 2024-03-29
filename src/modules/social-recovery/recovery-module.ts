import {
  AbiCoder,
  concat,
  Contract,
  encodeBytes32String,
  solidityPackedKeccak256,
  toBeHex,
  ZeroHash
} from "ethers";
import { Modules, TrueWalletErrorCodes } from "../../constants";
import { SocialRecoveryModuleAbi, TrueWalletAbi } from "../../abis";
import { encodeFunctionData } from "../../utils";
import { SecurityControlModuleAbi } from "../../abis/security-control-module-abi";
import { TrueWalletError } from "../../types";
import { RecoveryError, RecoveryErrorCodes } from "./recovery-module-errors";
import { TrueWalletSDK } from "../../TrueWalletSDK";
import { UserOperationResponse } from "../../user-operation-builder";


export type RecoveryModuleData = {
  guardians: string[],
  threshold: number,
  anonymousGuardiansSalt?: string,
}

export interface TrueWalletRecoveryModuleConfig {
  wallet: TrueWalletSDK,
}

export const getRecoveryModuleInitData = (moduleData: RecoveryModuleData): string => {
  let callData = AbiCoder.defaultAbiCoder().encode(
    ['address[]', 'uint256', 'bytes32'],
    [moduleData.guardians, moduleData.threshold, ZeroHash]
  );

  const isAnonymous = !!moduleData.anonymousGuardiansSalt;

  if (isAnonymous) {
    const salt= encodeBytes32String(<string>moduleData.anonymousGuardiansSalt?.toString());

    const guardiansHash = solidityPackedKeccak256(
      ['address[]', 'bytes32'],
      [moduleData.guardians, salt]
    );

    callData = AbiCoder.defaultAbiCoder().encode(
      ['address[]', 'uint256', 'bytes32'],
      [[], moduleData.threshold, guardiansHash]
    );
  }

  return concat([Modules.SocialRecoveryModule, callData]);
};


export class TrueWalletRecoveryModule {
  private readonly wallet: TrueWalletSDK;
  private readonly recoveryModuleSC: Contract;
  private readonly securityControlModuleSC: Contract;

  constructor(config: TrueWalletRecoveryModuleConfig) {
    this.wallet = config.wallet;
    this.recoveryModuleSC = new Contract(Modules.SocialRecoveryModule, SocialRecoveryModuleAbi, this.wallet.rpcProvider);
    this.securityControlModuleSC = new Contract(Modules.SecurityControlModule, SecurityControlModuleAbi, this.wallet.rpcProvider);
  }

  async install(data: RecoveryModuleData): Promise<UserOperationResponse> {
    const isInit = await this.recoveryModuleSC.isInit(this.wallet.address);

    if (isInit) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.MODULE_ALREADY_INSTALLED,
        message: `Social Recovery Module is already installed.`,
      });
    }

    const isBasicInitialized = await this.securityControlModuleSC.basicInitialized(this.wallet.address);
    if (!isBasicInitialized) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.WALLET_NOT_READY,
        message: `Wallet is not initialized.`,
      });
    }

    const addModuleFromWalletTxData = encodeFunctionData(
      TrueWalletAbi,
      'addModule',
      [getRecoveryModuleInitData(data)]
    );

    let txData = encodeFunctionData(
      SecurityControlModuleAbi,
      'fullInitAndAddModule',
      [this.wallet.address, addModuleFromWalletTxData]
    );

    const isFullInitialized = await this.securityControlModuleSC.fullInitialized(this.wallet.address);
    if (isFullInitialized) {
      txData = encodeFunctionData(
        SecurityControlModuleAbi,
        'execute',
        [this.wallet.address, addModuleFromWalletTxData]
      );
    }

    return this.executeFn(txData, Modules.SecurityControlModule);
  }

  async remove(): Promise<UserOperationResponse> {
    const isInit = await this.recoveryModuleSC.isInit(this.wallet.address);

    if (!isInit) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.MODULE_NOT_INSTALLED,
        message: `Social Recovery Module is not installed.`,
      });
    }

    const removeModuleTxData = encodeFunctionData(
      TrueWalletAbi,
      'removeModule',
      [Modules.SocialRecoveryModule]
    );

    const txData = encodeFunctionData(
      SecurityControlModuleAbi,
      'execute',
      [this.wallet.address, removeModuleTxData]
    );

    return this.executeFn(txData, Modules.SecurityControlModule);
  }

  async getGuardians(): Promise<string[]> {
    return this.recoveryModuleSC['getGuardians'](this.wallet.address);
  }

  async getGuardiansCount(): Promise<bigint> {
    return this.recoveryModuleSC['guardiansCount'](this.wallet.address);
  }

  async encodeSocialRecoveryData(newOwners: string[]): Promise<string> {
    const nonce = await this.nonce();
    return this.recoveryModuleSC.encodeSocialRecoveryData(this.wallet.address, newOwners, nonce);
  }

  async isGuardian(guardianAddress: string): Promise<boolean> {
    return this.recoveryModuleSC['isGuardian'](this.wallet.address, guardianAddress);
  }

  async hasGuardianApproved(guardianAddress: string, owners: string[]): Promise<boolean> {
    return this.recoveryModuleSC['hasGuardianApproved'](guardianAddress, this.wallet.address, owners);
  }

  async pendingGuardian(): Promise<string[]> {
    return this.recoveryModuleSC['pendingGuardian'](this.wallet.address);
  }

  async getGuardiansHash(): Promise<string> {
    return this.recoveryModuleSC['getGuardiansHash'](this.wallet.address);
  }

  async getRecoveryApprovals(newOwners: string[]): Promise<number> {
    return this.recoveryModuleSC['getRecoveryApprovals'](this.wallet, newOwners);
  }

  async getRecoveryEntry(walletAddress: string): Promise<[string[], string, string]> {
    return this.recoveryModuleSC['getRecoveryEntry'](walletAddress);
  }

  async nonce(): Promise<bigint> {
    return await this.recoveryModuleSC['nonce'](this.wallet.address);
  }

  async getSocialRecoveryHash(newOwners: string[]): Promise<string> {
    const nonce = await this.nonce();
    return this.recoveryModuleSC['getSocialRecoveryHash'](this.wallet, newOwners, nonce);
  }

  async getThreshold(): Promise<bigint> {
    return await this.recoveryModuleSC['threshold'](this.wallet.address);
  }

  /**
   * Method should be called by guardian to start recovery process
   * @method approveRecovery
   * @param {string} restoringWallet - address of the wallet that is being restored.
   * @param {string[]} newOwners - the list of addresses that will be the new owners of the wallet after recovery.
   * @param {number} pendingUntil - the time in seconds until which the recovery will be pending.
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  async approveRecovery(restoringWallet: string, newOwners: string[], pendingUntil: number): Promise<UserOperationResponse> {
    const callData = encodeFunctionData(
      SocialRecoveryModuleAbi,
      'approveRecovery',
      [restoringWallet, newOwners, pendingUntil]
    );
    return this.executeFn(callData);
  }

  /**
   * Should be called by guardian to approve and set new owner of the wallet.
   * Before executing this function, guardian should call `approveRecovery` function `threshold` times.
   * @param {string} wallet - address of the wallet that is being restored
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  async executeRecovery(wallet: string): Promise<UserOperationResponse> {
    const [_newOwners, executeAfter, _nonce] = await this.getRecoveryEntry(wallet);

    const canExecute = Number(executeAfter) * 1000 < Date.now();
    if (!canExecute) {
      throw new RecoveryError({
        code: RecoveryErrorCodes.RECOVERY_EXECUTE_NOT_READY,
        message: `Execute recovery will be available after ${new Date(Number(executeAfter) * 1000).toLocaleString()}`,
      });
    }

    const callData = encodeFunctionData(SocialRecoveryModuleAbi, 'executeRecovery', [wallet]);
    return this.executeFn(callData);
  }

  /**
   * Method called by wallet owner to cancel recovery process
   * @method cancelRecovery
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  async cancelRecovery(): Promise<UserOperationResponse> {
    const txData = encodeFunctionData(SocialRecoveryModuleAbi, 'cancelRecovery', [this.wallet.address]);
    return this.executeFn(txData);
  }

  private async executeFn(txData: string, target: string = Modules.SocialRecoveryModule, payableAmount = toBeHex(0)): Promise<UserOperationResponse> {
    return this.wallet.execute(txData, target, payableAmount);
  }
}
