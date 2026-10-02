import assert from "node:assert/strict";
import test from "node:test";

import {
  runMarketplaceEngine,
} from "../../src/trading/nft/marketplace/orchestration/engine";

import {
  nftMarketplaceEngineInputFixture,
} from "../../src/trading/nft/marketplace/orchestration/fixtures";

test(
  "marketplace engine rejects ineligible listing",
  () => {
    assert.throws(
      () =>
        runMarketplaceEngine({
          ...nftMarketplaceEngineInputFixture,

          listing: {
            ...nftMarketplaceEngineInputFixture
              .listing,

            seller: {
              ...nftMarketplaceEngineInputFixture
                .listing.seller,

              walletRef:
                null,
            },
          },
        }),

      /MARKETPLACE_ENGINE_NOT_ELIGIBLE/
    );
  }
);

test(
  "marketplace engine rejects provenance identity mismatch",
  () => {
    assert.throws(
      () =>
        runMarketplaceEngine({
          ...nftMarketplaceEngineInputFixture,

          listing: {
            ...nftMarketplaceEngineInputFixture
              .listing,

            asset: {
              ...nftMarketplaceEngineInputFixture
                .listing.asset,

              assetId:
                "asset-unrelated-999",
            },
          },
        }),

      /MARKETPLACE_ENGINE_NOT_ELIGIBLE/
    );
  }
);
