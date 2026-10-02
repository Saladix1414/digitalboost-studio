import assert from "node:assert/strict";
import test from "node:test";

import {
  validateMarketplaceOrderIntent,
} from "../../src/trading/nft/marketplace/orderValidation";

import {
  matchMarketplaceOrder,
} from "../../src/trading/nft/marketplace/orderMatch";

import {
  createMarketplacePreSettlement,
} from "../../src/trading/nft/marketplace/preSettlement";

import {
  nftMarketplaceAssetMismatchOrderFixture,
  nftMarketplaceBuyerEqualsSellerFixture,
  nftMarketplaceListedFixture,
  nftMarketplaceOrderFixture,
  nftMarketplacePriceMismatchFixture,
  nftMarketplaceSellerMismatchFixture,
} from "../../src/trading/nft/marketplace/orderFixtures";

test(
  "valid order intent matches LISTED listing",
  () => {
    const validation =
      validateMarketplaceOrderIntent(
        nftMarketplaceOrderFixture,
        nftMarketplaceListedFixture
      );

    assert.equal(
      validation.valid,
      true
    );

    assert.deepEqual(
      validation.issues,
      []
    );
  }
);

test(
  "valid order can transition to MATCHED",
  () => {
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

    assert.equal(
      matched.authoritative,
      false
    );
  }
);

test(
  "matched order can create pre-settlement model",
  () => {
    const matched =
      matchMarketplaceOrder(
        nftMarketplaceOrderFixture,
        nftMarketplaceListedFixture,
        "2026-10-14T10:13:00.000Z"
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
      preSettlement.orderId,
      matched.id
    );

    assert.equal(
      preSettlement.authoritative,
      false
    );
  }
);

test(
  "buyer cannot equal seller",
  () => {
    const result =
      validateMarketplaceOrderIntent(
        nftMarketplaceBuyerEqualsSellerFixture,
        nftMarketplaceListedFixture
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "BUYER_EQUALS_SELLER"
      )
    );
  }
);

test(
  "price mismatch is rejected",
  () => {
    const result =
      validateMarketplaceOrderIntent(
        nftMarketplacePriceMismatchFixture,
        nftMarketplaceListedFixture
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "PRICE_MISMATCH"
      )
    );
  }
);

test(
  "seller mismatch is rejected",
  () => {
    const result =
      validateMarketplaceOrderIntent(
        nftMarketplaceSellerMismatchFixture,
        nftMarketplaceListedFixture
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "SELLER_MISMATCH"
      )
    );
  }
);

test(
  "asset mismatch is rejected",
  () => {
    const result =
      validateMarketplaceOrderIntent(
        nftMarketplaceAssetMismatchOrderFixture,
        nftMarketplaceListedFixture
      );

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "ASSET_MISMATCH"
      )
    );
  }
);

test(
  "CREATED order cannot create pre-settlement",
  () => {
    assert.throws(
      () =>
        createMarketplacePreSettlement(
          nftMarketplaceOrderFixture,
          "2026-10-14T10:14:00.000Z"
        ),
      /MARKETPLACE_PRE_SETTLEMENT_REQUIRES_MATCHED_ORDER/
    );
  }
);
