/// <reference types="cypress" />


import { TrueWalletSDK } from "../../src";
import { TrueWalletConfig } from "../../src";

describe('SDK', () => {
  it('should init', () => {
    // @ts-ignore
    const config: TrueWalletConfig = {salt: `test-${Date.now()}`};
    const sdk = new TrueWalletSDK(config);

    expect(sdk).to.be.instanceOf(TrueWalletSDK);
  });
});
