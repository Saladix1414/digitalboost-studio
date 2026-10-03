import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTradingActivityTimeline,
} from "../../src/trading/activity/timeline/build";

test(
  "timeline order is stable by occurredAt then sequence",
  () => {
    const store = {
      events: [
        {
          id:
            "late-sequence",

          domain:
            "SYSTEM",

          type:
            "UPDATED",

          severity:
            "INFO",

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
                "custom",

              ref:
                "same",
            },
          ],

          occurredAt:
            "2026-10-03T04:20:00.000Z",

          sequence:
            2,

          authoritative:
            false,
        },

        {
          id:
            "early-sequence",

          domain:
            "SYSTEM",

          type:
            "UPDATED",

          severity:
            "INFO",

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
                "custom",

              ref:
                "same",
            },
          ],

          occurredAt:
            "2026-10-03T04:20:00.000Z",

          sequence:
            1,

          authoritative:
            false,
        },
      ],
    } as const;

    const timeline =
      buildTradingActivityTimeline(
        store,
        {
          kind:
            "custom",

          ref:
            "same",
        }
      );

    assert.deepEqual(
      timeline.events.map(
        event =>
          event.id
      ),
      [
        "early-sequence",
        "late-sequence",
      ]
    );
  }
);
