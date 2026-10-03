import assert from "node:assert/strict";
import test from "node:test";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  appendTradingActivityEvent,
  createTradingActivityStore,
} from "../../src/trading/activity/store";

test(
  "activity sequence gaps are rejected",
  () => {
    assert.throws(
      () =>
        appendTradingActivityEvent(
          createTradingActivityStore(),
          createTradingActivityEvent({
            id:
              "sequence-gap",

            domain:
              "SYSTEM",

            type:
              "CREATED",

            severity:
              "INFO",

            title:
              "Gap",

            description:
              "Invalid sequence gap",

            actor: {
              type:
                "SYSTEM",

              ref:
                "digitalboost",
            },

            occurredAt:
              "2026-10-03T00:00:00.000Z",

            sequence:
              2,
          })
        ),

      /TRADING_ACTIVITY_SEQUENCE_CONFLICT/
    );
  }
);
