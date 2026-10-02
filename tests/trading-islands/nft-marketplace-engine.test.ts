import assert from "node:assert/strict";
import test from "node:test";

import {
  runMarketplaceEngine,
} from "../../src/trading/nft/marketplace/orchestration/engine";

import {
  nftMarketplaceEngineInputFixture,
} from "../../src/trading/nft/marketplace/orchestration/fixtures";

test(
  "marketplace engine orchestrates canonical pre-settlement flow",
  () => {
    const result =
      runMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.eligibility.eligible,
      true
    );

    assert.equal(
      result.listing.status,
      "LISTED"
    );

    assert.equal(
      result.order.status,
      "MATCHED"
    );

    assert.equal(
      result.preSettlement.ready,
      true
    );

    assert.equal(
      result.stage,
      "PRE_SETTLEMENT_READY"
    );
  }
);

test(
  "marketplace engine preserves listing identity",
  () => {
    const result =
      runMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.saleIntent.listingId,
      result.listing.id
    );

    assert.equal(
      result.detail.market.listingId,
      result.listing.id
    );

    assert.equal(
      result.order.listingId,
      result.listing.id
    );

    assert.equal(
      result.preSettlement.listingId,
      result.listing.id
    );
  }
);

test(
  "marketplace engine preserves asset identity",
  () => {
    const result =
      runMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    const assetId =
      result.listing.asset.assetId;

    assert.equal(
      result.saleIntent.assetId,
      assetId
    );

    assert.equal(
      result.detail.identity.assetId,
      assetId
    );

    assert.equal(
      result.order.assetId,
      assetId
    );

    assert.equal(
      result.preSettlement.assetId,
      assetId
    );
  }
);

test(
  "marketplace engine remains non-authoritative",
  () => {
    const result =
      runMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.execution,
      "NONE"
    );

    assert.equal(
      result.eligibility.authoritative,
      false
    );

    assert.equal(
      result.saleIntent.authoritative,
      false
    );

    assert.equal(
      result.detail.authoritative,
      false
    );

    assert.equal(
      result.order.authoritative,
      false
    );

    assert.equal(
      result.preSettlement.authoritative,
      false
    );
  }
);
