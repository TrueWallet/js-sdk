[True Wallet SDK](../README.md) / [Modules](../modules.md) / [index](../modules/index.md) / TrueWalletRecoveryModule

# Class: TrueWalletRecoveryModule

[index](../modules/index.md).TrueWalletRecoveryModule

Social Recovery Module
 TrueWalletRecoveryModule

## Table of contents

### Methods

- [approveRecovery](index.TrueWalletRecoveryModule.md#approverecovery)
- [cancelRecovery](index.TrueWalletRecoveryModule.md#cancelrecovery)
- [encodeSocialRecoveryData](index.TrueWalletRecoveryModule.md#encodesocialrecoverydata)
- [executeRecovery](index.TrueWalletRecoveryModule.md#executerecovery)
- [getGuardians](index.TrueWalletRecoveryModule.md#getguardians)
- [getGuardiansCount](index.TrueWalletRecoveryModule.md#getguardianscount)
- [getRecoveryApprovals](index.TrueWalletRecoveryModule.md#getrecoveryapprovals)
- [getRecoveryEntry](index.TrueWalletRecoveryModule.md#getrecoveryentry)
- [getThreshold](index.TrueWalletRecoveryModule.md#getthreshold)
- [hasGuardianApproved](index.TrueWalletRecoveryModule.md#hasguardianapproved)
- [isGuardian](index.TrueWalletRecoveryModule.md#isguardian)
- [nonce](index.TrueWalletRecoveryModule.md#nonce)

## Methods

### approveRecovery

▸ **approveRecovery**(`restoringWallet`, `newOwners`, `pendingUntil`): `Promise`\<`UserOperationResponse`\>

Method should be called by guardian to start recovery process

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `restoringWallet` | `string` | address of the wallet that is being restored. |
| `newOwners` | `string`[] | the list of addresses that will be the new owners of the wallet after recovery. |
| `pendingUntil` | `number` | the time in seconds until which the recovery will be pending. |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

**`Method`**

approveRecovery

___

### cancelRecovery

▸ **cancelRecovery**(): `Promise`\<`UserOperationResponse`\>

Method called by wallet owner to cancel recovery process

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

**`Method`**

cancelRecovery

___

### encodeSocialRecoveryData

▸ **encodeSocialRecoveryData**(`newOwners`): `Promise`\<`string`\>

Returns the bytes that are hashed to be signed by guardians.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `newOwners` | `string`[] | the list of addresses that will be the new owners of the wallet after recovery. |

#### Returns

`Promise`\<`string`\>

- The bytes that are hashed to be signed by guardians

**`Method`**

encodeSocialRecoveryData

___

### executeRecovery

▸ **executeRecovery**(`wallet`): `Promise`\<`UserOperationResponse`\>

Should be called by guardian to approve and set new owner of the wallet.
Before executing this function, guardian should call `approveRecovery` function `threshold` times.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wallet` | `string` | address of the wallet that is being restored |

#### Returns

`Promise`\<`UserOperationResponse`\>

- User Operation Response

___

### getGuardians

▸ **getGuardians**(): `Promise`\<`string`[]\>

Get the active guardians for a wallet.

#### Returns

`Promise`\<`string`[]\>

- The list of active guardians for a wallet

**`Method`**

getGuardians

___

### getGuardiansCount

▸ **getGuardiansCount**(): `Promise`\<`bigint`\>

Counts the number of active guardians for a wallet.

#### Returns

`Promise`\<`bigint`\>

- The number of active guardians for a wallet

**`Method`**

getGuardiansCount

___

### getRecoveryApprovals

▸ **getRecoveryApprovals**(`walletAddress`, `newOwners`): `Promise`\<`bigint`\>

Retrieves the guardian approval count for this particular recovery request at current nonce.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress` | `string` | The address of the wallet |
| `newOwners` | `string`[] | The list of addresses that will be the new owners of the wallet after recovery |

#### Returns

`Promise`\<`bigint`\>

- The number of guardians that have approved the recovery request

**`Method`**

getRecoveryApprovals

___

### getRecoveryEntry

▸ **getRecoveryEntry**(`walletAddress`): `Promise`\<[`string`[], `bigint`, `bigint`]\>

Retrieves the wallet's current ongoing recovery request.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `walletAddress` | `string` | The address of the wallet |

#### Returns

`Promise`\<[`string`[], `bigint`, `bigint`]\>

- The list of new owners, the time until which the recovery will be pending, and the nonce - unique nonce to ensure each recovery process is unique

**`Method`**

getRecoveryEntry

___

### getThreshold

▸ **getThreshold**(): `Promise`\<`bigint`\>

Retrieves the wallet threshold count.

#### Returns

`Promise`\<`bigint`\>

- The wallet threshold count

**`Method`**

getThreshold

___

### hasGuardianApproved

▸ **hasGuardianApproved**(`guardianAddress`, `owners`): `Promise`\<`bigint`\>

Retrieves specific guardian approval status a particular recovery request at current nonce.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guardianAddress` | `string` | The address of the guardian |
| `owners` | `string`[] | The list of addresses that will be the new owners of the wallet after recovery |

#### Returns

`Promise`\<`bigint`\>

- True if the guardian has approved the recovery request, false if not

**`Method`**

hasGuardianApproved

___

### isGuardian

▸ **isGuardian**(`guardianAddress`): `Promise`\<`boolean`\>

Checks if an address is a guardian for a wallet.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `guardianAddress` | `string` | The address to check |

#### Returns

`Promise`\<`boolean`\>

- True if the address is a guardian for the wallet, false if not

**`Method`**

isGuardian

___

### nonce

▸ **nonce**(): `Promise`\<`bigint`\>

Get the module nonce for a wallet.

#### Returns

`Promise`\<`bigint`\>

- The module nonce for a wallet

**`Method`**

nonce
