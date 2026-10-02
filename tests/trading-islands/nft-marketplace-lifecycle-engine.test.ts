import assert from "node:assert/strict";
import test from "node:test";

import {
  runMarketplaceLifecycleEngine,
} from "../../src/trading/nft/marketplace/orchestration/lifecycleEngine";

import {
  nftMarketplaceEngineInputFixture,
} from "../../src/trading/nft/marketplace/orchestration/fixtures";

test(
  "lifecycle engine reaches pre-settlement in canonical order",
  () => {
    const result =
      runMarketplaceLifecycleEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.lifecycle.status,
      "PRE_SETTLEMENT_READY"
    );

    assert.deepEqual(
      result.lifecycle.events.map(
        (event) =>
          event.to
      ),
      [
        "ELIGIBILITY_VERIFIED",
        "SALE_INTENT_CREATED",
        "LISTING_PUBLISHED",
        "DETAIL_COMPOSED",
        "ORDER_CREATED",
        "ORDER_MATCHED",
        "PRE_SETTLEMENT_READY",
      ]
    );
  }
);

test(
  "lifecycle event sequence is monotonic",
  () => {
    const result =
      runMarketplaceLifecycleEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.deepEqual(
      result.lifecycle.events.map(
        (event) =>
          event.sequence
      ),
      [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
      ]
    );
  }
);

test(
  "ineligible lifecycle terminates rejected",
  () => {
    const result =
      runMarketplaceLifecycleEngine({
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
      });

    assert.equal(
      result.lifecycle.status,
      "REJECTED"
    );

    assert.equal(
      result.eligibility.eligible,
      false
    );

    assert.equal(
      result.lifecycle.events.length,
      1
    );
  }
);

test(
  "lifecycle remains non-authoritative",
  () => {
    const result =
      runMarketplaceLifecycleEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.lifecycle.authoritative,
      false
    );

    assert.equal(
      result.lifecycle.events.every(
        (event) =>
          event.authoritative ===
          false
      ),
      true
    );
  }
);
