import assert from "node:assert/strict";
import test from "node:test";

import {
  runObservableMarketplaceEngine,
} from "../../src/trading/nft/marketplace/orchestration/observableEngine";

import {
  nftMarketplaceEngineInputFixture,
} from "../../src/trading/nft/marketplace/orchestration/fixtures";

test(
  "observable engine exposes deterministic successful trace",
  () => {
    const result =
      runObservableMarketplaceEngine(
        nftMarketplaceEngineInputFixture
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
      result.lifecycle.status,
      "PRE_SETTLEMENT_READY"
    );

    assert.equal(
      result.observability.trace[0]
        .code,
      "ENGINE_STARTED"
    );

    assert.equal(
      result.observability.trace[
        result.observability.trace.length -
        1
      ].code,
      "EXECUTION_BOUNDARY_PRESERVED"
    );
  }
);

test(
  "successful observable trace mirrors lifecycle ordering",
  () => {
    const result =
      runObservableMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    const lifecycleCodes =
      result.observability.trace
        .filter(
          (entry) =>
            entry.kind ===
            "LIFECYCLE" &&
            entry.code !==
              "ENGINE_STARTED"
        )
        .map(
          (entry) =>
            entry.code
        );

    assert.deepEqual(
      lifecycleCodes,
      result.lifecycle.events.map(
        (event) =>
          event.to
      )
    );
  }
);

test(
  "eligibility failure produces deterministic failure reason",
  () => {
    const result =
      runObservableMarketplaceEngine({
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
      result.observability.failed,
      true
    );

    assert.equal(
      result.observability.failureCode,
      "ELIGIBILITY_REJECTED"
    );

    assert.equal(
      result.lifecycle.status,
      "REJECTED"
    );

    assert.equal(
      result.observability.trace.some(
        (entry) =>
          entry.code ===
          "ELIGIBILITY_REJECTED"
      ),
      true
    );
  }
);

test(
  "observability never becomes authority",
  () => {
    const result =
      runObservableMarketplaceEngine(
        nftMarketplaceEngineInputFixture
      );

    assert.equal(
      result.observability.authoritative,
      false
    );

    assert.equal(
      result.observability.trace.every(
        (entry) =>
          entry.authoritative ===
          false
      ),
      true
    );
  }
);
