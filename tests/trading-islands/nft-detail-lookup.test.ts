import assert from "node:assert/strict";
import test from "node:test";

import {
  findNftAssetDetailByAssetId,
  findNftAssetDetailByListingId,
} from "../../src/trading/nft/detail/lookup";

import {
  nftMarketplaceCatalogFixture,
} from "../../src/trading/nft/marketplace/catalog/fixtures";

test(
  "detail lookup finds asset by listing id",
  () => {
    const listing =
      nftMarketplaceCatalogFixture[0];

    const detail =
      findNftAssetDetailByListingId(
        nftMarketplaceCatalogFixture,
        listing.listing.id
      );

    assert.notEqual(
      detail,
      null
    );

    assert.equal(
      detail?.market.listingId,
      listing.listing.id
    );
  }
);

test(
  "detail lookup finds asset by asset id",
  () => {
    const item =
      nftMarketplaceCatalogFixture[1];

    const detail =
      findNftAssetDetailByAssetId(
        nftMarketplaceCatalogFixture,
        item.listing.asset.assetId
      );

    assert.notEqual(
      detail,
      null
    );

    assert.equal(
      detail?.identity.assetId,
      item.listing.asset.assetId
    );
  }
);

test(
  "unknown listing returns null",
  () => {
    const detail =
      findNftAssetDetailByListingId(
        nftMarketplaceCatalogFixture,
        "listing-does-not-exist"
      );

    assert.equal(
      detail,
      null
    );
  }
);

test(
  "unknown asset returns null",
  () => {
    const detail =
      findNftAssetDetailByAssetId(
        nftMarketplaceCatalogFixture,
        "asset-does-not-exist"
      );

    assert.equal(
      detail,
      null
    );
  }
);
