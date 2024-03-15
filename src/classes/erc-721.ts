import { TrueWalletSDK } from "../TrueWalletSDK";
import { Contract, toBeHex } from "ethers";
import { TrueWalletError } from "../types";
import { TrueWalletErrorCodes } from "../constants";
import { UserOperationResponse } from "../user-operation-builder";
import {
  ApproveAllErc721Params,
  ApproveErc721Params,
  SafeTransferErc721Params,
  TransferErc721Params
} from "../interfaces";

export const ERC721Abi = [
  'function balanceOf(address _owner) external view returns (uint256)',
  'function getApproved(uint256 _tokenId) external view returns (address)',
  'function isApprovedForAll(address _owner, address _operator) external view returns (bool)',
  'function name() external view returns (string _name)',
  'function ownerOf(uint256 _tokenId) external view returns (address)',
  'function symbol() external view returns (string _symbol)',
  'function tokenURI(uint256 _tokenId) external view returns (string)',
  'function approve(address _approved, uint256 _tokenId) external payable',
  'function setApprovalForAll(address _operator, bool _approved) external',
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable',
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable',
  'function transferFrom(address _from, address _to, uint256 _tokenId) external payable',
];

/**
 * Helper class to run ERC-721 tokens functions
 * */
export class Erc721Manager {
  private sdk: TrueWalletSDK;

  constructor(sdk: TrueWalletSDK) {
    this.sdk = sdk;
  }

  /**
   * Count all NFTs assigned to an owner
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @returns {Promise<string>} Promise with the number of NFTs owned by the wallet
   * */
  async balanceOf(contractAddress: string): Promise<string> {
    const contract = this._getContract(contractAddress);

    try {
      const balance = await contract['balanceOf'](this.sdk.address);

      return balance.toString();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Get the approved address for a single NFT
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @param {number} tokenId - ID of the NFT
   * @returns {Promise<string>} Promise with the address of the approved account
   * */
  async getApproved(contractAddress: string, tokenId: number): Promise<string> {
    const contract = this._getContract(contractAddress);

    try {
      return await contract['getApproved'](tokenId);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
  * Query if an address is an authorized operator for another address
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @param {string} owner - The address that owns the NFTs
   * @param {string} operator - The address that acts on behalf of the owner
   * @returns {Promise<boolean>} Promise with True if `operator` is an approved operator for `owner`, false otherwise
  * */
  async isApprovedForAll(contractAddress: string, owner: string, operator: string): Promise<boolean> {
    const contract = this._getContract(contractAddress);

    try {
      return await contract['isApprovedForAll'](owner, operator);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * A descriptive name for a collection of NFTs in this contract
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @returns {Promise<string>} Promise with the name of the token
   * */
  async name(contractAddress: string): Promise<string> {
    const contract = this._getContract(contractAddress);

    try {
      return await contract['name']();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * An abbreviated name for NFTs in this contract
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @returns {Promise<string>} Promise with the symbol of the token
   * */
  async symbol(contractAddress: string): Promise<string> {
    const contract = this._getContract(contractAddress);

    try {
      return await contract['symbol']();
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * A distinct Uniform Resource Identifier (URI) for a given asset.
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @param {number} tokenId - ID of the NFT
   * @returns {Promise<string>} Promise with the URI of the token
   * */
  async tokenURI(contractAddress: string, tokenId: number): Promise<string> {
    const contract = this._getContract(contractAddress);

    try {
      return await contract['tokenURI'](tokenId);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Find the owner of an NFT
   * @param {string} contractAddress - Address of the ERC-721 NFT token contract
   * @param {number} tokenId - ID of the NFT
   * @returns {Promise<string>} Promise with the address of the owner of the NFT
   * */
  async ownerOf(contractAddress: string, tokenId: number): Promise<string> {
    const contract = this._getContract(contractAddress);

    try {
      return await contract['ownerOf'](tokenId);
    } catch (err: unknown) {
      throw new TrueWalletError({
        code: TrueWalletErrorCodes.CALL_EXCEPTION,
        message: (err as Error).message,
      });
    }
  }

  /**
   * Change or reaffirm the approved address for an NFT
   * @param {object} params - Object with the parameters for the operation
   * @param {string} params.to - Address to be approved for the given NFT
   * @param {string} params.contractAddress - Address of the ERC-721 NFT token contract
   * @param {number} params.tokenId - ID of the NFT
   * @param {string} [paymaster='0x'] - Address of the paymaster contract
   * @returns {Promise<UserOperationResponse>} Promise with the response of the operation
   * */
  async approve(params: ApproveErc721Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = new Contract(params.contractAddress, ERC721Abi, this.sdk.rpcProvider);

    const txData = contract.interface.encodeFunctionData('approve', [params.to, params.tokenId]);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);
  }

  /**
   * Enable or disable approval for a third party ("operator") to manage
   * all of `msg.sender`'s assets
   * @param {object} params - Object with the parameters for the operation
   * @param {string} params.operator - Address to be approved for the given NFT
   * @param {boolean} params.approved - True if the operator is approved, false to revoke approval
   * @param {string} params.contractAddress - Address of the ERC-721 NFT token contract
   * @param {string} [paymaster='0x'] - Address of the paymaster contract
   * @returns {Promise<UserOperationResponse>} Promise with the response of the operation
   * */
  setApprovalForAll(params: ApproveAllErc721Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = this._getContract(params.contractAddress);

    const txData = contract.interface.encodeFunctionData('setApprovalForAll', [params.operator, params.approved]);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);

  }

  /**
   * Transfer ownership of an NFT - THE CALLER IS RESPONSIBLE
   * TO CONFIRM THAT `params.to` IS CAPABLE OF RECEIVING NFTS OR ELSE
   * THEY MAY BE PERMANENTLY LOST
   * @param {object} params - Object with the parameters for the operation
   * @param {string} params.from - The current owner of the NFT
   * @param {string} params.to - The new owner
   * @param {number} params.tokenId - ID of the NFT
   * @param {string} params.contractAddress - Address of the ERC-721 NFT token contract
   * @param {string} [paymaster='0x'] - Address of the paymaster contract
   * @returns {Promise<UserOperationResponse>} Promise with the response of the operation
   * */
  transferFrom(params: TransferErc721Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = this._getContract(params.contractAddress);

    const txData = contract.interface.encodeFunctionData('transferFrom', [params.from, params.to, params.tokenId]);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);
  }

  /**
   * Transfers the ownership of an NFT from one address to another address
   * @param {object} params - Object with the parameters for the operation
   * @param {string} params.from - The current owner of the NFT
   * @param {string} params.to - The new owner
   * @param {number} params.tokenId - ID of the NFT
   * @param {string} params.contractAddress - Address of the ERC-721 NFT token contract
   * @param {string} [params.data] - Additional data with no specified format, sent in call to `params.to`
   * @param {string} [paymaster='0x'] - Address of the paymaster contract
   * @returns {Promise<UserOperationResponse>} Promise with the response of the operation
   * */
  safeTransferFrom(params: SafeTransferErc721Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = this._getContract(params.contractAddress);

    const callParams = [params.from, params.to, params.tokenId];
    let functionName = 'safeTransferFrom(address _from, address _to, uint256 _tokenId)';

    if (params.data) {
      functionName = 'safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data)';
      callParams.push(params.data);
    }

    const txData = contract.interface.encodeFunctionData(functionName, callParams);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);
  }

  private _getContract(contractAddress: string): Contract {
    return new Contract(contractAddress, ERC721Abi, this.sdk.rpcProvider);
  }
}
