[True Wallet SDK](../README.md) / [Modules](../modules.md) / [TrueWalletSDK](../modules/TrueWalletSDK.md) / TrueWalletSDK

# Class: TrueWalletSDK

[TrueWalletSDK](../modules/TrueWalletSDK.md).TrueWalletSDK

Main SDK class

## Table of contents

### Properties

- [ready](TrueWalletSDK.TrueWalletSDK.md#ready)

### Methods

- [contractCall](TrueWalletSDK.TrueWalletSDK.md#contractcall)
- [contractRead](TrueWalletSDK.TrueWalletSDK.md#contractread)
- [getBalance](TrueWalletSDK.TrueWalletSDK.md#getbalance)
- [getERC20Balance](TrueWalletSDK.TrueWalletSDK.md#geterc20balance)
- [getNonce](TrueWalletSDK.TrueWalletSDK.md#getnonce)
- [send](TrueWalletSDK.TrueWalletSDK.md#send)
- [sendErc20](TrueWalletSDK.TrueWalletSDK.md#senderc20)

## Properties

### ready

• **ready**: `boolean` = `false`

## Methods

### contractCall

▸ **contractCall**(`params`): `Promise`\<`UserOperationResponse`\>

Used to call contract methods that change state

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `ContractWriteParams` | contract call params |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation hash

___

### contractRead

▸ **contractRead**(`params`): `Promise`\<`unknown`\>

Used to call contract methods that don't change state

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `ContractCallParams` | contract call params |

#### Returns

`Promise`\<`unknown`\>

- contract method call result

___

### getBalance

▸ **getBalance**(): `Promise`\<`string`\>

Get balance of the wallet in native currency

#### Returns

`Promise`\<`string`\>

- balance of the wallet in ether unit

**`Method`**

getBalance

**`Example`**

```ts
const wallet = new TrueWalletSDK({ ... });
await wallet.getBalance();
```

___

### getERC20Balance

▸ **getERC20Balance**(`tokenAddress`): `Promise`\<`string`\>

Get ERC20 token balance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAddress` | `string` | ERC20 token contract address |

#### Returns

`Promise`\<`string`\>

- token balance in ether unit

**`Method`**

getERC20Balance

**`Example`**

```ts
const wallet = new TrueWalletSDK({ ... });
await wallet.getERC20Balance('0x...');
```

___

### getNonce

▸ **getNonce**(): `Promise`\<`bigint`\>

Get nonce of the wallet

#### Returns

`Promise`\<`bigint`\>

- nonce of the wallet

**`Method`**

getNonce

**`Example`**

```ts
const wallet = new TrueWalletSDK({ ... });
await wallet.getNonce();
```

___

### send

▸ **send**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Send native currency to recipient

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `SendParams` | `undefined` |  |
| `paymaster?` | `string` | `'0x'` | paymaster address (optional) |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

**`Method`**

send

**`Example`**

```ts
const wallet = new TrueWalletSDK({ ... });
await wallet.send({
  to: '0x...',
  amount: '0.1',
});
```

___

### sendErc20

▸ **sendErc20**(`params`, `paymaster?`): `Promise`\<`UserOperationResponse`\>

Send ERC20 token to recipient

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `params` | `SendErc20Params` | `undefined` |  |
| `paymaster?` | `string` | `'0x'` | paymaster contract address (optional) |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

**`Method`**

sendErc20

**`Example`**

```ts
const wallet = new TrueWalletSDK({ ... });
await wallet.sendErc20({
  to: '0x...',
  amount: '0.1',
  tokenAddress: '0x...',
});
```