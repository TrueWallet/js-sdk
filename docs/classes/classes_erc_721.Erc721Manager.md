[True Wallet SDK](../README.md) / [Modules](../modules.md) / [classes/erc-721](../modules/classes_erc_721.md) / Erc721Manager

# Class: Erc721Manager

[classes/erc-721](../modules/classes_erc_721.md).Erc721Manager

Helper class to run ERC721 tokens functions

## Table of contents

### Methods

- [approve](classes_erc_721.Erc721Manager.md#approve)
- [balanceOf](classes_erc_721.Erc721Manager.md#balanceof)
- [getApproved](classes_erc_721.Erc721Manager.md#getapproved)
- [isApprovedForAll](classes_erc_721.Erc721Manager.md#isapprovedforall)
- [name](classes_erc_721.Erc721Manager.md#name)
- [ownerOf](classes_erc_721.Erc721Manager.md#ownerof)
- [safeTransferFrom](classes_erc_721.Erc721Manager.md#safetransferfrom)
- [setApprovalForAll](classes_erc_721.Erc721Manager.md#setapprovalforall)
- [symbol](classes_erc_721.Erc721Manager.md#symbol)
- [tokenURI](classes_erc_721.Erc721Manager.md#tokenuri)
- [transferFrom](classes_erc_721.Erc721Manager.md#transferfrom)

## Methods

### approve

▸ **approve**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Change or reaffirm the approved address for an NFT

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `ApproveErc721Params` | `undefined` | Object with the parameters for the operation |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster contract |

#### Returns

`Promise`\<`UserOperationResponse`\>

Promise with the response of the operation

___

### balanceOf

▸ **balanceOf**(`tokenAddress`): `Promise`\<`string`\>

Count all NFTs assigned to an owner

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract |

#### Returns

`Promise`\<`string`\>

Promise with the number of NFTs owned by the wallet

___

### getApproved

▸ **getApproved**(`tokenAddress`, `tokenId`): `Promise`\<`string`\>

Get the approved address for a single NFT

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract |
| `tokenId` | `number` | ID of the NFT |

#### Returns

`Promise`\<`string`\>

Promise with the address of the approved account

___

### isApprovedForAll

▸ **isApprovedForAll**(`tokenAddress`, `owner`, `operator`): `Promise`\<`boolean`\>

Query if an address is an authorized operator for another address
 *

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract * |
| `owner` | `string` | The address that owns the NFTs * |
| `operator` | `string` | The address that acts on behalf of the owner * |

#### Returns

`Promise`\<`boolean`\>

Promise with True if `operator` is an approved operator for `owner`, false otherwise

___

### name

▸ **name**(`tokenAddress`): `Promise`\<`string`\>

A descriptive name for a collection of NFTs in this contract

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract |

#### Returns

`Promise`\<`string`\>

Promise with the name of the token

___

### ownerOf

▸ **ownerOf**(`tokenAddress`, `tokenId`): `Promise`\<`string`\>

Find the owner of an NFT

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract |
| `tokenId` | `number` | ID of the NFT |

#### Returns

`Promise`\<`string`\>

Promise with the address of the owner of the NFT

___

### safeTransferFrom

▸ **safeTransferFrom**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Transfers the ownership of an NFT from one address to another address

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `SafeTransferErc721Params` | `undefined` | Object with the parameters for the operation |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster contract |

#### Returns

`Promise`\<`UserOperationResponse`\>

Promise with the response of the operation

___

### setApprovalForAll

▸ **setApprovalForAll**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Enable or disable approval for a third party ("operator") to manage
all of `msg.sender`'s assets

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `ApproveAllErc721Params` | `undefined` | Object with the parameters for the operation |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster contract |

#### Returns

`Promise`\<`UserOperationResponse`\>

Promise with the response of the operation

___

### symbol

▸ **symbol**(`tokenAddress`): `Promise`\<`string`\>

An abbreviated name for NFTs in this contract

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract |

#### Returns

`Promise`\<`string`\>

Promise with the symbol of the token

___

### tokenURI

▸ **tokenURI**(`tokenAddress`, `tokenId`): `Promise`\<`string`\>

A distinct Uniform Resource Identifier (URI) for a given asset.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the ERC-721 NFT token contract |
| `tokenId` | `number` | ID of the NFT |

#### Returns

`Promise`\<`string`\>

Promise with the URI of the token

___

### transferFrom

▸ **transferFrom**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Transfer ownership of an NFT - THE CALLER IS RESPONSIBLE
TO CONFIRM THAT `params.to` IS CAPABLE OF RECEIVING NFTS OR ELSE
THEY MAY BE PERMANENTLY LOST

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `TransferErc721Params` | `undefined` | Object with the parameters for the operation |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster contract |

#### Returns

`Promise`\<`UserOperationResponse`\>

Promise with the response of the operation
