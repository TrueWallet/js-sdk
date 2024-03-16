import { TrueWalletSDK } from "../TrueWalletSDK";
import { UserOperationResponse } from "../user-operation-builder";
import { BatchTransferErc1155Params, SetApprovalForAllErc1155Params, TransferErc1155Params } from "../interfaces";
import { Contract, toBeHex } from "ethers";

export const ERC1155Abi = [
  'function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data) external',
  'function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data) external',
  'function balanceOf(address _owner, uint256 _id) external view returns (uint256)',
  'function balanceOfBatch(address[] calldata _owners, uint256[] calldata _ids) external view returns (uint256[] memory)',
  'function setApprovalForAll(address _operator, bool _approved) external',
  'function isApprovedForAll(address _owner, address _operator) external view returns (bool)',
  'function uri(uint256 _id) external view returns (string memory)',
];

/**
 * Helper class to run ERC-1155 tokens functions
 * */
export class Erc1155Manager {
  private sdk: TrueWalletSDK;

  constructor(sdk: TrueWalletSDK) {
    this.sdk = sdk;
  }

  /**
   * Transfers `params.value` amount of an `params.id` from the `params.from` address to the `params.to` address specified (with safety call).
   * @dev Caller must be approved to manage the tokens being transferred out of the `params.from` account.
   * @param {TransferErc1155Params} params - Transfer parameters
   * @param {string} params.contractAddress - Address of the ERC-1155 contract
   * @param {string} params.from - Source address
   * @param {string} params.to - Target address
   * @param {number} params.id - ID of the token type
   * @param {number} params.value - Transfer amount
   * @param {string} [params.data] - Additional data with no specified format, MUST be sent unaltered in call to `onERC1155Received` on `params.to`
   * @param {string} [paymaster] - Paymaster address
   * @return {Promise<UserOperationResponse>}
   * */
  async safeTransferFrom(params: TransferErc1155Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = this._getContract(params.contractAddress);

    const callParams = [params.from, params.to, params.id, params.value, params.data || '0x'];

    const txData = contract.interface.encodeFunctionData('safeTransferFrom', callParams);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);
  }

  /**
   * Transfers `params.values` amount(s) of `params.ids` from the `params.from` address to the `params.to` address specified (with safety call).
   * @dev Caller must be approved to manage the tokens being transferred out of the `params.from` account.
   * @param {BatchTransferErc1155Params} params - Batch transfer parameters
   * @param {string} params.contractAddress - Address of the ERC-1155 contract
   * @param {string} params.from - Source address
   * @param {string} params.to - Target address
   * @param {number[]} params.ids - IDs of the token types
   * @param {number[]} params.values - Transfer amounts
   * @param {string} [params.data] - Additional data with no specified format, MUST be sent unaltered in call to `onERC1155BatchReceived` on `params.to`
   * @param {string} [paymaster] - Paymaster address
   * @return {Promise<UserOperationResponse>}
   * */
  async safeBatchTransferFrom(params: BatchTransferErc1155Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = this._getContract(params.contractAddress);

    const callParams = [params.from, params.to, params.ids, params.values, params.data || '0x'];

    const txData = contract.interface.encodeFunctionData('safeBatchTransferFrom', callParams);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);
  }

  /**
   *  Get the balance of an account's tokens.
   *  @param {string} contractAddress - Address of the ERC-1155 contract
   *  @param {string} owner - The address of the token holder
   *  @param {number} id - ID of the token
   *  @return {Promise<bigint>} The `params.owner`'s balance of the token type requested
   * */
  async balanceOf(contractAddress: string, owner: string, id: number): Promise<bigint> {
    const contract = this._getContract(contractAddress);

    return contract.balanceOf(owner, id);
  }

  /**
   * Get the balance of multiple account/token pairs
   * @param {string} contractAddress - Address of the ERC-1155 contract
   * @param {string[]} owners - The addresses of the token holders
   * @param {number[]} ids - ID of the tokens
   * @return {Promise<bigint[]>} The `params.owner`'s balance of the token types requested (i.e. balance for each (owner, id) pair)
   * */
  async balanceOfBatch(contractAddress: string, owners: string[], ids: number[]): Promise<bigint[]> {
    const contract = this._getContract(contractAddress);

    return contract.balanceOfBatch(owners, ids);
  }

  /**
   * Enable or disable approval for a third party ("`params.operator`") to manage all the caller's tokens.
   * @param {SetApprovalForAllErc1155Params} params - Approval parameters
   * @param {string} params.contractAddress - Address of the ERC-1155 contract
   * @param {string} params.operator - Address to add to the set of authorized operators
   * @param {boolean} params.approved - True if the operator is approved, false to revoke approval
   * @param {string} [paymaster] - Paymaster address
   * @return {Promise<UserOperationResponse>}
   * */
  async setApprovalForAll(params: SetApprovalForAllErc1155Params, paymaster: string = '0x'): Promise<UserOperationResponse> {
    const contract = this._getContract(params.contractAddress);

    const callParams = [params.operator, params.approved];

    const txData = contract.interface.encodeFunctionData('setApprovalForAll', callParams);
    return this.sdk.execute(txData, params.contractAddress, toBeHex(0), paymaster);
  }

  /**
   * Queries the approval status of an `operator` for a given `owner`.
   * @param {string} contractAddress - Address of the ERC-1155 contract
   * @param {string} owner - The owner of the tokens
   * @param {string} operator - Address of authorized operator
   * @return {Promise<boolean>} True if the operator is approved, false if not
   * */
  async isApprovedForAll(contractAddress: string, owner: string, operator: string): Promise<boolean> {
    const contract = this._getContract(contractAddress);

    return contract.isApprovedForAll(owner, operator);
  }

  /**
   * A distinct Uniform Resource Identifier (URI) for a given token.
   * The URI MUST point to a JSON file that conforms to the "ERC-1155 Metadata URI JSON Schema".
   * @param {string} contractAddress - Address of the ERC-1155 contract
   * @param {number} id - ID of the token
   * @return {Promise<string>} URI string
   * */
  async uri(contractAddress: string, id: number): Promise<string> {
    const contract = this._getContract(contractAddress);

    return contract.uri(id);
  }

  private _getContract(contractAddress: string): Contract {
    return new Contract(contractAddress, ERC1155Abi, this.sdk.rpcProvider);
  }
}
