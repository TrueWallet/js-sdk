/// <reference types="cypress" />

import { fromWei, isEthAddress, toWei } from "../../src/utils";

describe('SDK utils', () => {
  it('should convert wei to units', () => {
    const wei = 1_000_000_000_000_000_000n;
    const eth = fromWei(wei);

    expect(eth).to.equal('1.0');

    const wei2 = 1_000_000n;
    const eth2 = fromWei(wei2, 6);

    expect(eth2).to.equal('1.0');

    const wei3 = '1000000000000000000';
    const eth3 = fromWei(wei3);

    expect(eth3).to.equal('1.0');
  });

  it('should convert units to wei', () => {
    const eth = '1.0';
    const wei = toWei(eth);

    expect(wei).to.equal(1_000_000_000_000_000_000n);

    const eth2 = '1.0';
    const wei2 = toWei(eth2, 6);

    expect(wei2).to.equal(1_000_000n);
  });

  it('check if given string is ethereum address', () => {
    const invalid = isEthAddress('sfjdlkfjlkdsf');

    expect(invalid).to.equal(false);

    const valid = isEthAddress('0x8ba1f109551bD432803012645Ac136ddd64DBA72');

    expect(valid).to.equal(true);
  });
});
