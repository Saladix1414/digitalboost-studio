import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateNftDetailConsistency,
} from "../../src/trading/nft/detail/consistency";

import {
  nftAssetDetailFixture,
} from "../../src/trading/nft/detail/fixtures";

test(
  "detail fixture closes through provenance and DNA references",
  () => {
    const result =
      evaluateNftDetailConsistency(
        nftAssetDetailFixture
      );

    assert.equal(
      result.provenanceReferenceMatch,
      true
    );

    assert.equal(
      result.dnaReferenceMatch,
      true
    );

    assert.equal(
      result.provenanceClosureValid,
      true
    );

    assert.equal(
      result.coherent,
      true
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "catalog and provenance asset namespaces remain explicit",
  () => {
    const result =
      evaluateNftDetailConsistency(
        nftAssetDetailFixture
      );

    assert.equal(
      result.assetIdDirectMatch,
      false
    );

    assert.equal(
      result.collectionIdDirectMatch,
      false
    );

    assert.equal(
      result.coherent,
      true
    );
  }
);

test(
  "provenance reference mismatch breaks coherence",
  () => {
    const result =
      evaluateNftDetailConsistency({
        ...nftAssetDetailFixture,

        integrity: {
          ...nftAssetDetailFixture
            .integrity,

          provenanceId:
            "provenance-mismatch-999",
        },
      });

    assert.equal(
      result.provenanceReferenceMatch,
      false
    );

    assert.equal(
      result.coherent,
      false
    );
  }
);

test(
  "DNA reference mismatch breaks coherence",
  () => {
    const result =
      evaluateNftDetailConsistency({
        ...nftAssetDetailFixture,

        integrity: {
          ...nftAssetDetailFixture
            .integrity,

          dnaId:
            "dna-mismatch-999",
        },
      });

    assert.equal(
      result.dnaReferenceMatch,
      false
    );

    assert.equal(
      result.coherent,
      false
    );
  }
);
