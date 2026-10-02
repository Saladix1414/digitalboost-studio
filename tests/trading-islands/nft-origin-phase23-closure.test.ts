import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftOrigin,
} from "../../src/trading/nft/origin/validation";

import {
  validateNftOriginHistory,
} from "../../src/trading/nft/origin/historyValidation";

import {
  validateOriginAgainstDna,
} from "../../src/trading/nft/origin/dnaBridge";

import {
  validateOriginDnaClosure,
} from "../../src/trading/nft/origin/dnaBridgeClosure";

import {
  nftOriginDnaBridgeOriginFixture,
  nftOriginDnaBridgeDnaFixture,
  nftOriginDnaBridgeLineageFixture,
} from "../../src/trading/nft/origin/dnaBridgeFixtures";

import {
  nftOriginHistoryFixture,
} from "../../src/trading/nft/origin/historyFixtures";

test(
  "PHASE 23 origin domain closes with all core validations passing",
  () => {
    const origin =
      validateNftOrigin(
        nftOriginDnaBridgeOriginFixture
      );

    const history =
      validateNftOriginHistory(
        nftOriginHistoryFixture
      );

    const bridge =
      validateOriginAgainstDna(
        nftOriginDnaBridgeOriginFixture,
        nftOriginDnaBridgeDnaFixture
      );

    const closure =
      validateOriginDnaClosure(
        nftOriginDnaBridgeOriginFixture,
        nftOriginDnaBridgeDnaFixture,
        nftOriginDnaBridgeLineageFixture
      );

    assert.equal(
      origin.valid,
      true
    );

    assert.equal(
      history.valid,
      true
    );

    assert.equal(
      bridge.consistent,
      true
    );

    assert.equal(
      closure.valid,
      true
    );
  }
);

test(
  "PHASE 23 closure still grants no provenance authority",
  () => {
    assert.equal(
      nftOriginDnaBridgeOriginFixture
        .authoritative,
      false
    );

    assert.equal(
      nftOriginHistoryFixture
        .authoritative,
      false
    );
  }
);
