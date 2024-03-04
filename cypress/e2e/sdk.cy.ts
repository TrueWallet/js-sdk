/// <reference types="cypress" />

import { ethToWei, isEthAddress, weiToEth } from "../../src/utils";

describe('SDK utils', () => {
  it('should convert wei to eth', () => {
    const wei = 1_000_000_000_000_000_000n;
    const eth = weiToEth(wei);

    expect(eth).to.equal('1.0');

    const wei2 = 1_000_000n;
    const eth2 = weiToEth(wei2, 6);

    expect(eth2).to.equal('1.0');
  });

  it('should convert eth to wei', () => {
    const eth = '1.0';
    const wei = ethToWei(eth);

    expect(wei).to.equal(1_000_000_000_000_000_000n);

    const eth2 = '1.0';
    const wei2 = ethToWei(eth2, 6);

    expect(wei2).to.equal(1_000_000n);
  });

  it('check if given string is ethereum address', () => {
    const invalid = isEthAddress('sfjdlkfjlkdsf');

    expect(invalid).to.equal(false);

    const valid = isEthAddress('0x8ba1f109551bD432803012645Ac136ddd64DBA72');

    expect(valid).to.equal(true);
  });
});
