import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateFixtureMarketplaceEligibility,
} from "../../src/trading/nft/marketplace/eligibilityBridge";

import {
  createMarketplaceSaleIntent,
} from "../../src/trading/nft/marketplace/saleIntent";

import {
  matchMarketplaceOrder,
} from "../../src/trading/nft/marketplace/orderMatch";

import {
  createMarketplacePreSettlement,
} from "../../src/trading/nft/marketplace/preSettlement";

import {
  nftMarketplaceReadyListingFixture,
} from "../../src/trading/nft/marketplace/eligibilityFixtures";

import {
  nftMarketplaceListedFixture,
  nftMarketplaceOrderFixture,
} from "../../src/trading/nft/marketplace/orderFixtures";

test(
  "PHASE 26 closes with coherent marketplace flow",
  () => {
    const eligibility =
      evaluateFixtureMarketplaceEligibility(
        nftMarketplaceReadyListingFixture
      );

    assert.equal(
      eligibility.eligible,
      true
    );

    const saleIntent =
      createMarketplaceSaleIntent(
        nftMarketplaceReadyListingFixture,
        eligibility,
        "2026-10-14T10:06:00.000Z"
      );

    assert.equal(
      saleIntent.authoritative,
      false
    );

    const matched =
      matchMarketplaceOrder(
        nftMarketplaceOrderFixture,
        nftMarketplaceListedFixture,
        "2026-10-14T10:13:00.000Z"
      );

    assert.equal(
      matched.status,
      "MATCHED"
    );

    const preSettlement =
      createMarketplacePreSettlement(
        matched,
        "2026-10-14T10:14:00.000Z"
      );

    assert.equal(
      preSettlement.ready,
      true
    );

    assert.equal(
      preSettlement.authoritative,
      false
    );
  }
);

test(
  "PHASE 26 closure never implies settlement authority",
  () => {
    assert.equal(
      nftMarketplaceReadyListingFixture
        .authoritative,
      false
    );

    assert.equal(
      nftMarketplaceOrderFixture
        .authoritative,
      false
    );
  }
);
