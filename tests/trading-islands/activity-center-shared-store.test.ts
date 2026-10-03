import assert from "node:assert/strict";
import test from "node:test";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  getNextTradingActivitySequence,
  getTradingActivityStore,
  recordTradingActivityEvent,
  resetTradingActivityStoreForTests,
  subscribeTradingActivityStore,
} from "../../src/trading/activity/sharedActivityStore";

test(
  "shared Activity Center store publishes deterministic event changes",
  () => {
    resetTradingActivityStoreForTests();

    let notifications =
      0;

    const unsubscribe =
      subscribeTradingActivityStore(
        () => {
          notifications +=
            1;
        }
      );

    const event =
      createTradingActivityEvent({
        id:
          "shared-event-1",

        domain:
          "DBX",

        type:
          "POSTED",

        severity:
          "SUCCESS",

        title:
          "Shared event",

        description:
          "Fixture",

        actor: {
          type:
            "SYSTEM",

          ref:
            "digitalboost",
        },

        occurredAt:
          "2026-10-03T03:00:00.000Z",

        sequence:
          getNextTradingActivitySequence(),
      });

    recordTradingActivityEvent(
      event
    );

    assert.equal(
      getTradingActivityStore()
        .events.length,
      1
    );

    assert.equal(
      notifications,
      1
    );

    /*
     * Exact replay is idempotent and does not manufacture
     * a second change notification.
     */
    recordTradingActivityEvent(
      event
    );

    assert.equal(
      getTradingActivityStore()
        .events.length,
      1
    );

    assert.equal(
      notifications,
      1
    );

    unsubscribe();
  }
);
