import assert from "node:assert/strict";
import test from "node:test";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  getTradingActivityStore,
  recordTradingActivityEvent,
  resetTradingActivityStoreForTests,
} from "../../src/trading/activity/sharedActivityStore";

test(
  "exact activity replay never duplicates shared evidence",
  () => {
    resetTradingActivityStoreForTests();

    const event =
      createTradingActivityEvent({
        id:
          "idempotent-event",

        domain:
          "SYSTEM",

        type:
          "UPDATED",

        severity:
          "INFO",

        title:
          "Idempotent",

        description:
          "Fixture",

        actor: {
          type:
            "SYSTEM",

          ref:
            "digitalboost",
        },

        occurredAt:
          "2026-10-03T04:10:00.000Z",

        sequence:
          1,
      });

    recordTradingActivityEvent(
      event
    );

    recordTradingActivityEvent(
      event
    );

    assert.equal(
      getTradingActivityStore()
        .events.length,
      1
    );
  }
);
