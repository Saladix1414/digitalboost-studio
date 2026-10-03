import assert from "node:assert/strict";
import test from "node:test";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  appendTradingActivityEvent,
  createTradingActivityStore,
} from "../../src/trading/activity/store";

import {
  correlateTradingActivityAcrossKeys,
} from "../../src/trading/activity/timeline/multiCorrelation";

test(
  "multi-key correlation deduplicates matching events",
  () => {
    let store =
      createTradingActivityStore();

    store =
      appendTradingActivityEvent(
        store,
        createTradingActivityEvent({
          id:
            "multi-event",

          domain:
            "MARKETPLACE",

          type:
            "MATCHED",

          severity:
            "INFO",

          title:
            "Order matched",

          description:
            "Fixture",

          actor: {
            type:
              "SYSTEM",

            ref:
              "digitalboost",
          },

          references: [
            {
              kind:
                "marketplaceOrder",

              ref:
                "order-1",
            },

            {
              kind:
                "transaction",

              ref:
                "tx-1",
            },
          ],

          occurredAt:
            "2026-10-03T01:10:00.000Z",

          sequence:
            1,
        })
      );

    const events =
      correlateTradingActivityAcrossKeys(
        store,
        [
          {
            kind:
              "marketplaceOrder",

            ref:
              "order-1",
          },

          {
            kind:
              "transaction",

            ref:
              "tx-1",
          },
        ]
      );

    assert.equal(
      events.length,
      1
    );
  }
);
