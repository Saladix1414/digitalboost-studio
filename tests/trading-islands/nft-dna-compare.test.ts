import assert from "node:assert/strict";
import test from "node:test";

import {
  compareNftDna,
} from "../../src/trading/nft/dna/compare";

import {
  nftDnaUnmintedFixture,
  nftDnaVerifiedFixture,
} from "../../src/trading/nft/dna/fixtures";

test(
  "DNA comparison detects blockchain proof attachment",
  () => {
    const comparison =
      compareNftDna(
        nftDnaUnmintedFixture,
        nftDnaVerifiedFixture
      );

    assert.equal(
      comparison.changed,
      true
    );

    assert.ok(
      comparison.changes.some(
        (change) =>
          change.layer ===
            "BLOCKCHAIN_PROOF" &&
          change.field ===
            "tokenId"
      )
    );
  }
);

test(
  "DNA comparison keeps changes attributed to explicit layers",
  () => {
    const comparison =
      compareNftDna(
        nftDnaUnmintedFixture,
        nftDnaVerifiedFixture
      );

    for (
      const change of
      comparison.changes
    ) {
      assert.ok(
        [
          "IDENTITY",
          "INTEGRITY",
          "BLOCKCHAIN_PROOF",
        ].includes(
          change.layer
        )
      );
    }
  }
);

test(
  "identical DNA produces no changes",
  () => {
    const comparison =
      compareNftDna(
        nftDnaVerifiedFixture,
        nftDnaVerifiedFixture
      );

    assert.equal(
      comparison.changed,
      false
    );

    assert.equal(
      comparison.changes.length,
      0
    );
  }
);
