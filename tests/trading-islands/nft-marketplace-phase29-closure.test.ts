import assert from "node:assert/strict";
import test from "node:test";

import {
  runMarketplaceEngine,
} from "../../src/trading/nft/marketplace/orchestration/engine";

import {
  runObservableMarketplaceEngine,
} from "../../src/trading/nft/marketplace/orchestration/observableEngine";

import {
  nftMarketplaceEngineInputFixture,
} from "../../src/trading/nft/marketplace/orchestration/fixtures";

test(
  "Phase 29 closes at deterministic pre-settlement",
  () => {
    const result =
      runMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.stage,
      "PRE_SETTLEMENT_READY"
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
      result.execution,
      "NONE"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "Phase 29 closes with observable lifecycle trace",
  () => {
    const result =
      runObservableMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.lifecycle.status,
      "PRE_SETTLEMENT_READY"
    );

    assert.equal(
      result.observability.failed,
      false
    );

    assert.equal(
      result.observability.failureCode,
      "NONE"
    );

    assert.equal(
      result.observability.authoritative,
      false
    );

    assert.equal(
      result.observability.trace.length > 0,
      true
    );
  }
);
