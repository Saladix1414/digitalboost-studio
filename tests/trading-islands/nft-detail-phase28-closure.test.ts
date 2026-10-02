import assert from "node:assert/strict";
import test from "node:test";

import {
  nftAssetDetailFixture,
} from "../../src/trading/nft/detail/fixtures";

import {
  validateNftAssetDetail,
} from "../../src/trading/nft/detail/validation";

import {
  composeNftDetailEvidence,
} from "../../src/trading/nft/detail/evidence";

import {
  evaluateNftDetailConsistency,
} from "../../src/trading/nft/detail/consistency";

test(
  "Phase 28 closes with valid composed NFT detail",
  () => {
    const validation =
      validateNftAssetDetail(
        nftAssetDetailFixture
      );

    assert.equal(
      validation.valid,
      true
    );

    assert.equal(
      validation.authoritative,
      false
    );
  }
);

test(
  "Phase 28 closes with composed evidence",
  () => {
    const evidence =
      composeNftDetailEvidence(
        nftAssetDetailFixture
      );

    assert.equal(
      evidence.total,
      5
    );

    assert.equal(
      evidence.present > 0,
      true
    );

    assert.equal(
      evidence.authoritative,
      false
    );
  }
);

test(
  "Phase 28 closes with coherent cross-domain consistency",
  () => {
    const consistency =
      evaluateNftDetailConsistency(
        nftAssetDetailFixture
      );

    assert.equal(
      consistency.provenanceReferenceMatch,
      true
    );

    assert.equal(
      consistency.dnaReferenceMatch,
      true
    );

    assert.equal(
      consistency.provenanceClosureValid,
      true
    );

    assert.equal(
      consistency.coherent,
      true
    );

    assert.equal(
      consistency.assetIdDirectMatch,
      false
    );

    assert.equal(
      consistency.collectionIdDirectMatch,
      false
    );

    assert.equal(
      consistency.authoritative,
      false
    );
  }
);
