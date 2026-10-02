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
