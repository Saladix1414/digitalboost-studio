import assert from "node:assert/strict";
import test from "node:test";

import {
  nftAssetDetailFixture,
  nftAssetDetailSecondaryFixture,
} from "../../src/trading/nft/detail/fixtures";

import {
  validateNftAssetDetail,
} from "../../src/trading/nft/detail/validation";

test(
  "NFT detail fixture validates",
  () => {
    const result =
      validateNftAssetDetail(
        nftAssetDetailFixture
      );

    assert.equal(
      result.valid,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "NFT detail composes marketplace context",
  () => {
    assert.equal(
      nftAssetDetailFixture.market.status,
      "LISTED"
    );

    assert.equal(
      nftAssetDetailFixture.market.priceAmount > 0,
      true
    );

    assert.equal(
      nftAssetDetailFixture.market.authoritative,
      false
    );
  }
);

test(
  "NFT detail composes integrity references",
  () => {
    assert.equal(
      nftAssetDetailFixture.integrity.dnaId !== null,
      true
    );

    assert.equal(
      nftAssetDetailFixture.integrity.provenanceId !== null,
      true
    );

    assert.equal(
      nftAssetDetailFixture.integrity.authoritative,
      false
    );
  }
);

test(
  "secondary detail fixture remains LISTED",
  () => {
    assert.equal(
      nftAssetDetailSecondaryFixture.market.status,
      "LISTED"
    );
  }
);

test(
  "invalid price is rejected",
  () => {
    const result =
      validateNftAssetDetail({
        ...nftAssetDetailFixture,

        market: {
          ...nftAssetDetailFixture.market,

          priceAmount:
            0,
        },
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_PRICE"
      )
    );
  }
);

test(
  "non-LISTED detail is rejected",
  () => {
    const result =
      validateNftAssetDetail({
        ...nftAssetDetailFixture,

        market: {
          ...nftAssetDetailFixture.market,

          status:
            "PAUSED",
        },
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "LISTING_NOT_LISTED"
      )
    );
  }
);
