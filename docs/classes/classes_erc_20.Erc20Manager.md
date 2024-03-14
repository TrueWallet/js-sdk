[True Wallet SDK](../README.md) / [Modules](../modules.md) / [classes/erc-20](../modules/classes_erc_20.md) / Erc20Manager

# Class: Erc20Manager

[classes/erc-20](../modules/classes_erc_20.md).Erc20Manager

Helper class to run ERC20 tokens functions

## Table of contents

### Methods

- [allowance](classes_erc_20.Erc20Manager.md#allowance)
- [approve](classes_erc_20.Erc20Manager.md#approve)
- [balanceOf](classes_erc_20.Erc20Manager.md#balanceof)
- [decimals](classes_erc_20.Erc20Manager.md#decimals)
- [getBalance](classes_erc_20.Erc20Manager.md#getbalance)
- [name](classes_erc_20.Erc20Manager.md#name)
- [send](classes_erc_20.Erc20Manager.md#send)
- [symbol](classes_erc_20.Erc20Manager.md#symbol)
- [totalSupply](classes_erc_20.Erc20Manager.md#totalsupply)
- [transfer](classes_erc_20.Erc20Manager.md#transfer)
- [transferFrom](classes_erc_20.Erc20Manager.md#transferfrom)

## Methods

### allowance

▸ **allowance**(`tokenAddress`, `owner`, `spender`): `Promise`\<`bigint`\>

Returns the amount which `spender` is still allowed to withdraw from `owner`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |
| `owner` | `string` | Address of the account that owns the tokens |
| `spender` | `string` | Address of the account that is allowed to spend the tokens |

#### Returns

`Promise`\<`bigint`\>

- Remaining allowance of the spender in wei

___

### approve

▸ **approve**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Allows `params.spender` to withdraw from your account multiple times, up to the `params.amount`.
If this function is called again it overwrites the current allowance with 'params.amount'.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `ApproveErc20Params` | `undefined` | Parameters for the transfer |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

___

### balanceOf

▸ **balanceOf**(`tokenAddress`, `owner`): `Promise`\<`bigint`\>

Returns the account balance of another account with address `owner`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |
| `owner` | `string` | Address of the account for the balance check |

#### Returns

`Promise`\<`bigint`\>

- Balance of the account in wei

___

### decimals

▸ **decimals**(`tokenAddress`): `Promise`\<`bigint`\>

Returns the number of decimals the token uses

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |

#### Returns

`Promise`\<`bigint`\>

- Number of decimals

___

### getBalance

▸ **getBalance**(`tokenAddress`): `Promise`\<`string`\>

Returns the balance of the current wallet in tokens

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |

#### Returns

`Promise`\<`string`\>

- Balance of the wallet in tokens

___

### name

▸ **name**(`tokenAddress`): `Promise`\<`string`\>

Returns the name of the token

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |

#### Returns

`Promise`\<`string`\>

- Name of the token

___

### send

▸ **send**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Send the `params.amount` of tokens from the current wallet to the `params.to` address

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `Omit`\<`SendErc20Params`, ``"from"``\> | `undefined` | Parameters for the transfer |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

___

### symbol

▸ **symbol**(`tokenAddress`): `Promise`\<`string`\>

Returns the symbol of the token

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |

#### Returns

`Promise`\<`string`\>

- Symbol of the token

___

### totalSupply

▸ **totalSupply**(`tokenAddress`): `Promise`\<`bigint`\>

Returns the total token supply.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | Address of the token |

#### Returns

`Promise`\<`bigint`\>

- Total supply of the token in wei

___

### transfer

▸ **transfer**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Transfers `params.amount` of tokens to address 'params.to', and MUST fire the Transfer event.
The function SHOULD throw if the message caller’s account balance does not have enough tokens to spend.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `Omit`\<`SendErc20Params`, ``"from"``\> | `undefined` | Parameters for the transfer |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster |

#### Returns

`Promise`\<`UserOperationResponse`\>

___

### transferFrom

▸ **transferFrom**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Transfers `params.amount` of tokens from address `params.from` to address `params.to`, and MUST fire the Transfer event.
The transferFrom method is used for a withdrawal workflow, allowing contracts to transfer tokens on your behalf.
This can be used for example to allow a contract to transfer tokens on your behalf and/or to charge fees in sub-currencies.
The function SHOULD throw unless the `params.from` account has deliberately authorized the sender of the message via some mechanism.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `SendErc20Params` | `undefined` | Parameters for the transfer |
| `paymaster?` | `string` | `'0x'` | Address of the paymaster |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response
