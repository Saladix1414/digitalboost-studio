import assert from "node:assert/strict";
import test from "node:test";

import {
  activityFromNftMarketplaceLifecycleEvent,
} from "../../src/trading/activity/adapters/nftMarketplace";

test(
  "NFT marketplace lifecycle is projected without execution",
  () => {
    const lifecycle = {
      id:
        "marketplace-lifecycle-1",

      status:
        "LISTING_PUBLISHED" as const,

      version:
        2,

      events:
        [],

      authoritative:
        false as const,
    };

    const event =
      activityFromNftMarketplaceLifecycleEvent(
        lifecycle,
        {
          sequence:
            2,

          from:
            "SALE_INTENT_CREATED",

          to:
            "LISTING_PUBLISHED",

          occurredAt:
            "2026-10-03T00:30:00.000Z",

          reason:
            "Listing published.",

          authoritative:
            false,
        },
        1
      );

    assert.equal(
      event.domain,
      "MARKETPLACE"
    );

    assert.equal(
      event.type,
      "LISTED"
    );

    assert.equal(
      event.authoritative,
      false
    );
  }
);
