import { UserOperationResponse } from "../user-operation-builder";
import { Contract, formatUnits, parseUnits, toBeHex } from "ethers";
import { BalanceOfAbi, DecimalsAbi, TransferAbi } from "../abis";
import { TrueWalletError } from "../types";
import { TrueWalletErrorCodes } from "../constants";
import { ApproveErc20Params, SendErc20Params } from "../interfaces";
import { TrueWalletSDK } from "../TrueWalletSDK";

export const ERC20Abi = [
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function decimals() public view returns (uint8)',
  'function totalSupply() public view returns (uint256)',
  'function balanceOf(address _owner) public view returns (uint256 balance)',
  'function transfer(address _to, uint256 _value) public returns (bool success)',
  'function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)',
  'function approve(address _spender, uint256 _value) public returns (bool success)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)'
];

/**
 * Helper class to run ERC20 tokens functions
 * */
export class Erc20Manager {
  private sdk: TrueWalletSDK;

  constructor(sdk: TrueWalletSDK) {
    this.sdk = sdk;
  }

  /**
   * Returns the balance of the current wallet in tokens
   * @param {string} tokenAddress - Address of the token
   * @returns {Promise<string>} - Balance of the wallet in tokens
   * */
  async getBalance(tokenAddress: string): Promise<string> {
    const contract = new Contract(tokenAddress, [...BalanceOfAbi, ...DecimalsAbi], this.sdk.rpcProvider);

    try {
      const decimals = await contract.decimals();
      const balance = await contract['balanceOf'](this.sdk.address);

      return formatUnits(balance, decimals);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Send the `params.amount` of tokens from the current wallet to the `params.to` address
   * @param {SendErc20Params} params - Parameters for the transfer
   * @param {string} params.to - Address to transfer the tokens to
   * @param {number | string | bigint} params.amount - Amount of tokens to transfer in tokens
   * @param {string} params.tokenAddress - Address of the token
   * @param {string} [paymaster=0x] - Address of the paymaster
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  async send(params: Omit<SendErc20Params, 'from'>, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = new Contract(params.tokenAddress, [...DecimalsAbi, ...TransferAbi], this.sdk.rpcProvider);
    const decimals = await tokenContract.decimals();

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
      params.to,
      parseUnits(params.amount.toString(), decimals),
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);
  }

  /**
   * Returns the name of the token
   * @param {string} tokenAddress - Address of the token
   * @returns {Promise<string>} - Name of the token
   * */
  async name(tokenAddress: string): Promise<string> {
    const contract = this._getContract(tokenAddress);

    try {
      return await contract.name();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Returns the symbol of the token
   * @param {string} tokenAddress - Address of the token
   * @returns {Promise<string>} - Symbol of the token
   * */
  async symbol(tokenAddress: string): Promise<string> {
    const contract = this._getContract(tokenAddress);

    try {
      return await contract.symbol();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Returns the number of decimals the token uses
   * @param {string} tokenAddress - Address of the token
   * @returns {Promise<bigint>} - Number of decimals
   * */
  async decimals(tokenAddress: string): Promise<bigint> {
    const contract = this._getContract(tokenAddress);

    try {
      return await contract.decimals();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Returns the total token supply.
   * @param {string} tokenAddress - Address of the token
   * @returns {Promise<bigint>} - Total supply of the token in wei
   * */
  async totalSupply(tokenAddress: string): Promise<bigint> {
    const contract = this._getContract(tokenAddress);

    try {
      return await contract.totalSupply();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Returns the account balance of another account with address `owner`.
   * @param {string} tokenAddress - Address of the token
   * @param {string} owner - Address of the account for the balance check
   * @returns {Promise<bigint>} - Balance of the account in wei
   * */
  async balanceOf(tokenAddress: string, owner: string): Promise<bigint> {
    const contract = this._getContract(tokenAddress);

    try {
      return await contract.balanceOf(owner);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Returns the amount which `spender` is still allowed to withdraw from `owner`.
   * @param {string} tokenAddress - Address of the token
   * @param {string} owner - Address of the account that owns the tokens
   * @param {string} spender - Address of the account that is allowed to spend the tokens
   * @returns {Promise<bigint>} - Remaining allowance of the spender in wei
   * */
  async allowance(tokenAddress: string, owner: string, spender: string): Promise<bigint> {
    const contract = this._getContract(tokenAddress);

    try {
      return await contract.allowance(owner, spender);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }

  }

  /**
   * Transfers `params.amount` of tokens to address 'params.to', and MUST fire the Transfer event.
   * The function SHOULD throw if the message caller’s account balance does not have enough tokens to spend.
   * @param {SendErc20Params} params - Parameters for the transfer
   * @param {string} params.to - Address to transfer the tokens to
   * @param {number | string | bigint} params.amount - Amount of tokens to transfer in wei
   * @param {string} params.tokenAddress - Address of the token
   * @param {string} [paymaster=0x] - Address of the paymaster
   * */
  async transfer(params: Omit<SendErc20Params, 'from'>, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = this._getContract(params.tokenAddress);

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
      params.to,
      params.amount,
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);
  }


  /**
   * Transfers `params.amount` of tokens from address `params.from` to address `params.to`, and MUST fire the Transfer event.
   * The transferFrom method is used for a withdrawal workflow, allowing contracts to transfer tokens on your behalf.
   * This can be used for example to allow a contract to transfer tokens on your behalf and/or to charge fees in sub-currencies.
   * The function SHOULD throw unless the `params.from` account has deliberately authorized the sender of the message via some mechanism.
   *
   * @param {SendErc20Params} params - Parameters for the transfer
   * @param {string} params.from - Address to transfer the tokens from
   * @param {string} params.to - Address to transfer the tokens to
   * @param {number | string | bigint} params.amount - Amount of tokens to transfer in wei
   * @param {string} params.tokenAddress - Address of the token
   * @param {string} [paymaster=0x] - Address of the paymaster
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  async transferFrom(params: SendErc20Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = this._getContract(params.tokenAddress);

    const txData = tokenContract.interface.encodeFunctionData('transferFrom', [
      params.from,
      params.to,
      params.amount,
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);

  }

  /**
   * Allows `params.spender` to withdraw from your account multiple times, up to the `params.amount`.
   * If this function is called again it overwrites the current allowance with 'params.amount'.
   *
   * @param {object} params - Parameters for the transfer
   * @param {string} params.spender - Address of the account that is allowed to spend the tokens
   * @param {number | string | bigint} params.amount - Amount of tokens to approve in wei
   * @param {string} params.tokenAddress - Address of the token
   * @param {string} [paymaster=0x] - Address of the paymaster
   * @returns {Promise<UserOperationResponse>} - User Operation Response
   * */
  async approve(params: ApproveErc20Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = this._getContract(params.tokenAddress);

    const txData = tokenContract.interface.encodeFunctionData('approve', [
      params.spender,
      params.amount,
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);

  }

  private _getContract(tokenAddress: string): Contract {
    return new Contract(tokenAddress, ERC20Abi, this.sdk.rpcProvider);
  }
}
