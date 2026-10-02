import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateNftDetailConsistency,
} from "../../src/trading/nft/detail/consistency";

import {
  nftAssetDetailFixture,
} from "../../src/trading/nft/detail/fixtures";

test(
  "detail fixture matches provenance asset and collection",
  () => {
    const result =
      evaluateNftDetailConsistency(
        nftAssetDetailFixture
      );

    assert.equal(
      result.assetMatch,
      true
    );

    assert.equal(
      result.collectionMatch,
      true
    );

    assert.equal(
      result.provenanceClosureValid,
      true
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "asset mismatch is detected",
  () => {
    const result =
      evaluateNftDetailConsistency({
        ...nftAssetDetailFixture,

        identity: {
          ...nftAssetDetailFixture.identity,

          assetId:
            "asset-mismatch-999",
        },
      });

    assert.equal(
      result.assetMatch,
      false
    );
  }
);

test(
  "collection mismatch is detected",
  () => {
    const result =
      evaluateNftDetailConsistency({
        ...nftAssetDetailFixture,

        identity: {
          ...nftAssetDetailFixture.identity,

          collectionId:
            "collection-mismatch-999",
        },
      });

    assert.equal(
      result.collectionMatch,
      false
    );
  }
);
