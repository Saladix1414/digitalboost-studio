import assert from "node:assert/strict";
import test from "node:test";

import {
  summarizeTradingActivityTimeline,
} from "../../src/trading/activity/timeline/summary";

test(
  "timeline summary remains non-authoritative",
  () => {
    const summary =
      summarizeTradingActivityTimeline({
        id:
          "timeline:test",

        correlation: {
          kind:
            "transaction",

          ref:
            "tx-test",
        },

        events:
          [],

        firstOccurredAt:
          null,

        lastOccurredAt:
          null,

        domains:
          [],

        authoritative:
          false,
      });

    assert.equal(
      summary.eventCount,
      0
    );

    assert.equal(
      summary.authoritative,
      false
    );
  }
);
