import assert from "node:assert/strict";
import test from "node:test";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  createTradingActivityStore,
  appendTradingActivityEvent,
} from "../../src/trading/activity/store";

import {
  buildTradingActivityTimeline,
} from "../../src/trading/activity/timeline/build";

test(
  "cross-domain timeline correlates shared transaction reference",
  () => {
    let store =
      createTradingActivityStore();

    store =
      appendTradingActivityEvent(
        store,
        createTradingActivityEvent({
          id:
            "timeline-dbx",

          domain:
            "DBX",

          type:
            "POSTED",

          severity:
            "SUCCESS",

          title:
            "DBX posted",

          description:
            "DBX posting",

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
                "tx-shared",
            },
          ],

          occurredAt:
            "2026-10-03T01:00:00.000Z",

          sequence:
            1,
        })
      );

    store =
      appendTradingActivityEvent(
        store,
        createTradingActivityEvent({
          id:
            "timeline-chain",

          domain:
            "BLOCKCHAIN",

          type:
            "VERIFIED",

          severity:
            "SUCCESS",

          title:
            "Blockchain verified",

          description:
            "Blockchain verification",

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
                "tx-shared",
            },
          ],

          occurredAt:
            "2026-10-03T01:01:00.000Z",

          sequence:
            2,
        })
      );

    const timeline =
      buildTradingActivityTimeline(
        store,
        {
          kind:
            "transaction",

          ref:
            "tx-shared",
        }
      );

    assert.equal(
      timeline.events.length,
      2
    );

    assert.deepEqual(
      timeline.domains,
      [
        "DBX",
        "BLOCKCHAIN",
      ]
    );

    assert.equal(
      timeline.authoritative,
      false
    );
  }
);
