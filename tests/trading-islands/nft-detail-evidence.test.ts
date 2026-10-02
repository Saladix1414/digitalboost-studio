import assert from "node:assert/strict";
import test from "node:test";

import {
  composeNftDetailEvidence,
} from "../../src/trading/nft/detail/evidence";

import {
  nftAssetDetailFixture,
} from "../../src/trading/nft/detail/fixtures";

test(
  "detail evidence composes five evidence classes",
  () => {
    const result =
      composeNftDetailEvidence(
        nftAssetDetailFixture
      );

    assert.equal(
      result.total,
      5
    );

    assert.equal(
      result.items.length,
      5
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "linked detail composes complete evidence",
  () => {
    const result =
      composeNftDetailEvidence(
        nftAssetDetailFixture
      );

    assert.equal(
      result.present,
      5
    );

    assert.equal(
      result.complete,
      true
    );
  }
);

test(
  "detail evidence includes Origin DNA and provenance history",
  () => {
    const result =
      composeNftDetailEvidence(
        nftAssetDetailFixture
      );

    const kinds =
      result.items.map(
        (item) =>
          item.kind
      );

    assert.ok(
      kinds.includes(
        "ORIGIN"
      )
    );

    assert.ok(
      kinds.includes(
        "DNA_IDENTITY"
      )
    );

    assert.ok(
      kinds.includes(
        "DNA_INTEGRITY"
      )
    );

    assert.ok(
      kinds.includes(
        "BLOCKCHAIN_PROOF"
      )
    );

    assert.ok(
      kinds.includes(
        "PROVENANCE_HISTORY"
      )
    );
  }
);

test(
  "all composed evidence remains non-authoritative",
  () => {
    const result =
      composeNftDetailEvidence(
        nftAssetDetailFixture
      );

    assert.equal(
      result.items.every(
        (item) =>
          item.authoritative ===
          false
      ),
      true
    );
  }
);

test(
  "unrelated provenance reference cannot inherit provenance evidence",
  () => {
    const result =
      composeNftDetailEvidence({
        ...nftAssetDetailFixture,

        integrity: {
          ...nftAssetDetailFixture
            .integrity,

          provenanceId:
            "provenance-unrelated",
        },
      });

    const provenanceHistory =
      result.items.find(
        (item) =>
          item.kind ===
          "PROVENANCE_HISTORY"
      );

    assert.equal(
      provenanceHistory?.status,
      "ABSENT"
    );
  }
);

test(
  "unrelated DNA reference cannot inherit DNA proof evidence",
  () => {
    const result =
      composeNftDetailEvidence({
        ...nftAssetDetailFixture,

        integrity: {
          ...nftAssetDetailFixture
            .integrity,

          dnaId:
            "dna-unrelated",
        },
      });

    const dnaIdentity =
      result.items.find(
        (item) =>
          item.kind ===
          "DNA_IDENTITY"
      );

    const blockchainProof =
      result.items.find(
        (item) =>
          item.kind ===
          "BLOCKCHAIN_PROOF"
      );

    assert.equal(
      dnaIdentity?.status,
      "ABSENT"
    );

    assert.equal(
      blockchainProof?.status,
      "ABSENT"
    );
  }
);
