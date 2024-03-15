[True Wallet SDK](../README.md) / [Modules](../modules.md) / [classes](../modules/classes.md) / Erc1155Manager

# Class: Erc1155Manager

[classes](../modules/classes.md).Erc1155Manager

Helper class to run ERC-1155 tokens functions

## Table of contents

### Methods

- [balanceOf](classes.Erc1155Manager.md#balanceof)
- [balanceOfBatch](classes.Erc1155Manager.md#balanceofbatch)
- [isApprovedForAll](classes.Erc1155Manager.md#isapprovedforall)
- [safeBatchTransferFrom](classes.Erc1155Manager.md#safebatchtransferfrom)
- [safeTransferFrom](classes.Erc1155Manager.md#safetransferfrom)
- [setApprovalForAll](classes.Erc1155Manager.md#setapprovalforall)
- [uri](classes.Erc1155Manager.md#uri)

## Methods

### balanceOf

▸ **balanceOf**(`contractAddress`, `owner`, `id`): `Promise`\<`bigint`\>

Get the balance of an account's tokens.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contractAddress` | `string` | Address of the ERC-1155 contract |
| `owner` | `string` | The address of the token holder |
| `id` | `number` | ID of the token |

#### Returns

`Promise`\<`bigint`\>

The `params.owner`'s balance of the token type requested

___

### balanceOfBatch

▸ **balanceOfBatch**(`contractAddress`, `owners`, `ids`): `Promise`\<`ProxyConstructor`\>

Get the balance of multiple account/token pairs

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contractAddress` | `string` | Address of the ERC-1155 contract |
| `owners` | `string`[] | The addresses of the token holders |
| `ids` | `number`[] | ID of the tokens |

#### Returns

`Promise`\<`ProxyConstructor`\>

The `params.owner`'s balance of the token types requested (i.e. balance for each (owner, id) pair)

___

### isApprovedForAll

▸ **isApprovedForAll**(`contractAddress`, `owner`, `operator`): `Promise`\<`boolean`\>

Queries the approval status of an `operator` for a given `owner`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contractAddress` | `string` | Address of the ERC-1155 contract |
| `owner` | `string` | The owner of the tokens |
| `operator` | `string` | Address of authorized operator |

#### Returns

`Promise`\<`boolean`\>

True if the operator is approved, false if not

___

### safeBatchTransferFrom

▸ **safeBatchTransferFrom**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Transfers `params.values` amount(s) of `params.ids` from the `params.from` address to the `params.to` address specified (with safety call).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `BatchTransferErc1155Params` | `undefined` | Batch transfer parameters |
| `paymaster?` | `string` | `'0x'` | Paymaster address |

#### Returns

`Promise`\<`UserOperationResponse`\>

**`Dev`**

Caller must be approved to manage the tokens being transferred out of the `params.from` account.

___

### safeTransferFrom

▸ **safeTransferFrom**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Transfers `params.value` amount of an `params.id` from the `params.from` address to the `params.to` address specified (with safety call).

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `TransferErc1155Params` | `undefined` | Transfer parameters |
| `paymaster?` | `string` | `'0x'` | Paymaster address |

#### Returns

`Promise`\<`UserOperationResponse`\>

**`Dev`**

Caller must be approved to manage the tokens being transferred out of the `params.from` account.

___

### setApprovalForAll

▸ **setApprovalForAll**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Enable or disable approval for a third party ("`params.operator`") to manage all the caller's tokens.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `SetApprovalForAllErc1155Params` | `undefined` | Approval parameters |
| `paymaster?` | `string` | `'0x'` | Paymaster address |

#### Returns

`Promise`\<`UserOperationResponse`\>

___

### uri

▸ **uri**(`contractAddress`, `id`): `Promise`\<`string`\>

A distinct Uniform Resource Identifier (URI) for a given token.
The URI MUST point to a JSON file that conforms to the "ERC-1155 Metadata URI JSON Schema".

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `contractAddress` | `string` | Address of the ERC-1155 contract |
| `id` | `number` | ID of the token |

#### Returns

`Promise`\<`string`\>

URI string
