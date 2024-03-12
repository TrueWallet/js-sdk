import { UserOperationResponse } from "../user-operation-builder";
import { Contract, formatUnits, parseUnits, toBeHex } from "ethers";
import { BalanceOfAbi, DecimalsAbi, TransferAbi } from "../abis";
import { TrueWalletError } from "../types";
import { TrueWalletErrorCodes } from "../constants";
import { SendErc20Params } from "../interfaces";
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
 * Helper class to manage ERC20 tokens
 * */
export class Erc20Manager {
  private sdk: TrueWalletSDK;

  constructor(sdk: TrueWalletSDK) {
    this.sdk = sdk;
  }

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

  async send(params: Omit<SendErc20Params, 'from'>, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = new Contract(params.tokenAddress, [...DecimalsAbi, ...TransferAbi], this.sdk.rpcProvider);
    const decimals = await tokenContract.decimals();

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
      params.to,
      parseUnits(params.amount.toString(), decimals),
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);
  }

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

  async transfer(params: Omit<SendErc20Params, 'from'>, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = this._getContract(params.tokenAddress);

    const txData = tokenContract.interface.encodeFunctionData('transfer', [
      params.to,
      params.amount,
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);
  }

  async transferFrom(params: SendErc20Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const tokenContract = this._getContract(params.tokenAddress);

    const txData = tokenContract.interface.encodeFunctionData('transferFrom', [
      params.from,
      params.to,
      params.amount,
    ]);

    return this.sdk.execute(txData, params.tokenAddress, toBeHex(0), paymaster);

  }

  async approve(params: { spender: string, tokenAddress: string, amount: bigint }, paymaster: string = '0x'): Promise<UserOperationResponse> {
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
