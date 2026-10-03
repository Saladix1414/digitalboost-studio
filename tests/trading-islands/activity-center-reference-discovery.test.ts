import assert from "node:assert/strict";
import test from "node:test";

import {
  collectTradingActivityReferences,
} from "../../src/trading/activity/timeline/references";

test(
  "reference discovery returns unique references",
  () => {
    const references =
      collectTradingActivityReferences(
        [
          {
            id:
              "event-1",

            domain:
              "DBX",

            type:
              "POSTED",

            severity:
              "SUCCESS",

            title:
              "A",

            description:
              "A",

            actor: {
              type:
                "SYSTEM",

              ref:
                "digitalboost",
            },

            references: [
              {
                kind:
                  "transaction",

                ref:
                  "tx-1",
              },
            ],

            occurredAt:
              "2026-10-03T01:20:00.000Z",

            sequence:
              1,

            authoritative:
              false,
          },

          {
            id:
              "event-2",

            domain:
              "BLOCKCHAIN",

            type:
              "VERIFIED",

            severity:
              "SUCCESS",

            title:
              "B",

            description:
              "B",

            actor: {
              type:
                "SYSTEM",

              ref:
                "digitalboost",
            },

            references: [
              {
                kind:
                  "transaction",

                ref:
                  "tx-1",
              },

              {
                kind:
                  "request",

                ref:
                  "request-1",
              },
            ],

            occurredAt:
              "2026-10-03T01:21:00.000Z",

            sequence:
              2,

            authoritative:
              false,
          },
        ]
      );

    assert.equal(
      references.length,
      2
    );
  }
);
