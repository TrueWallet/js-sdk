[True Wallet SDK](../README.md) / [Modules](../modules.md) / index

# Module: index

## Table of contents

### Functions

- [fromWei](index.md#fromwei)
- [getChecksumAddress](index.md#getchecksumaddress)
- [isEthAddress](index.md#isethaddress)
- [toWei](index.md#towei)

## Functions

### fromWei

▸ **fromWei**(`wei`, `decimals?`): `string`

Utility function to convert wei value to the given unit value

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `wei` | `string` \| `number` \| `bigint` | `undefined` | Wei value to convert to ETH |
| `decimals?` | `number` | `18` | Number of decimals to use on conversion |

#### Returns

`string`

- ETH value of given Wei

___

### getChecksumAddress

▸ **getChecksumAddress**(`address`): `string`

Utility function to get the checksum address of given address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | Address to get the checksum address |

#### Returns

`string`

- Checksum address of given address

___

### isEthAddress

▸ **isEthAddress**(`address`): `boolean`

Utility function to check if given address is a valid Ethereum address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | Address to check if it is a valid Ethereum address |

#### Returns

`boolean`

- true if given address is a valid Ethereum address, false otherwise

___

### toWei

▸ **toWei**(`eth`, `decimals?`): `bigint`

Utility function to convert given unit value to the wei value

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `eth` | `string` | `undefined` | ETH value to convert to Wei |
| `decimals?` | `number` \| `bigint` | `18` | Number of decimals to use on conversion |

#### Returns

`bigint`

- Wei value of given ETH
