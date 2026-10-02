import assert from "node:assert/strict";
import test from "node:test";

import {
  canTransitionMarketplaceEngineLifecycle,
  createMarketplaceEngineLifecycle,
  transitionMarketplaceEngineLifecycle,
} from "../../src/trading/nft/marketplace/orchestration/lifecycle";

test(
  "marketplace lifecycle begins CREATED",
  () => {
    const lifecycle =
      createMarketplaceEngineLifecycle(
        "lifecycle-test"
      );

    assert.equal(
      lifecycle.status,
      "CREATED"
    );

    assert.equal(
      lifecycle.version,
      1
    );

    assert.equal(
      lifecycle.events.length,
      0
    );

    assert.equal(
      lifecycle.authoritative,
      false
    );
  }
);

test(
  "valid marketplace lifecycle transitions are explicit",
  () => {
    assert.equal(
      canTransitionMarketplaceEngineLifecycle(
        "CREATED",
        "ELIGIBILITY_VERIFIED"
      ),
      true
    );

    assert.equal(
      canTransitionMarketplaceEngineLifecycle(
        "ORDER_MATCHED",
        "PRE_SETTLEMENT_READY"
      ),
      true
    );
  }
);

test(
  "invalid lifecycle transition is rejected",
  () => {
    const lifecycle =
      createMarketplaceEngineLifecycle(
        "lifecycle-invalid"
      );

    assert.throws(
      () =>
        transitionMarketplaceEngineLifecycle(
          lifecycle,
          "ORDER_MATCHED",
          "2026-10-14T10:00:00.000Z",
          "invalid jump"
        ),

      /MARKETPLACE_ENGINE_INVALID_LIFECYCLE_TRANSITION/
    );
  }
);

test(
  "terminal pre-settlement state cannot advance",
  () => {
    assert.equal(
      canTransitionMarketplaceEngineLifecycle(
        "PRE_SETTLEMENT_READY",
        "ORDER_MATCHED"
      ),
      false
    );
  }
);
