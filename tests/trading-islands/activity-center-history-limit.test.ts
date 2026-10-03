import assert from "node:assert/strict";
import test from "node:test";

import {
  TRADING_ACTIVITY_HISTORY_LIMIT,
} from "../../src/trading/activity/constants";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  getNextTradingActivitySequence,
  getTradingActivityStore,
  recordTradingActivityEvent,
  resetTradingActivityStoreForTests,
} from "../../src/trading/activity/sharedActivityStore";

test(
  "shared Activity Center store keeps bounded history",
  () => {
    resetTradingActivityStoreForTests();

    for (
      let index = 0;
      index <
        TRADING_ACTIVITY_HISTORY_LIMIT +
          25;
      index += 1
    ) {
      recordTradingActivityEvent(
        createTradingActivityEvent({
          id:
            `bounded-${index}`,

          domain:
            "SYSTEM",

          type:
            "UPDATED",

          severity:
            "INFO",

          title:
            "Bounded event",

          description:
            "Fixture",

          actor: {
            type:
              "SYSTEM",

            ref:
              "digitalboost",
          },

          occurredAt:
            `2026-10-03T04:${String(
              index % 60
            ).padStart(
              2,
              "0"
            )}:00.000Z`,

          sequence:
            getNextTradingActivitySequence(),
        })
      );
    }

    const events =
      getTradingActivityStore()
        .events;

    assert.equal(
      events.length,
      TRADING_ACTIVITY_HISTORY_LIMIT
    );

    assert.equal(
      events[0].id,
      "bounded-25"
    );

    assert.equal(
      events[
        events.length - 1
      ].id,
      `bounded-${
        TRADING_ACTIVITY_HISTORY_LIMIT +
        24
      }`
    );
  }
);
