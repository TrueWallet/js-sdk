# TrueWallet SDK
A JavaScript SDK for ERC-4337 implementation.

Check the [documentation](https://docs.true-wallet.io/) for more information.

## Integration
Before starting you need to create an account in the TrueWallet [dashboard](https://dashboard.true-wallet.io). Create a project inside and copy the API Endpoint.

## Installation
Install the required packages for initializing the TrueWallet SDK.

*Tested with Angular, React, and Node.js v18 and higher*
```shell
npm install @truewallet/sdk
```

## Integration Example
Before initialisation your first wallet, create endpoint url in the [dashboard](https://dashboard.true-wallet.io).

To check all available methods, please refer to the [authentication](/sdk/authentication).


### Initialisation with salt:
```javascript
  import {init} from '@truewallet/sdk';

  /** Initialisation with salt */
  const trueWallet = await init({
    signer: {
      type: 'salt',
      data: ['{{YOUR_UNIQUE_STRING_FOR_PRIVATE_KEY_GENERATION}}']
    },
    rpcProviderUrl: '{{ENDPOINT_URL_FROM_DASHBOARD}}',
    bundlerUrl: '{{ENDPOINT_URL_FROM_DASHBOARD}}',
  });
```
