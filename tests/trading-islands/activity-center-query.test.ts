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
  queryTradingActivity,
} from "../../src/trading/activity/query";

test(
  "activity can be filtered by domain and actor",
  () => {
    let store =
      createTradingActivityStore();

    store =
      appendTradingActivityEvent(
        store,
        createTradingActivityEvent({
          id:
            "activity-1",

          domain:
            "DBX",

          type:
            "POSTED",

          severity:
            "SUCCESS",

          title:
            "DBX",

          description:
            "DBX event",

          actor: {
            type:
              "USER",

            ref:
              "user-001",
          },

          occurredAt:
            "2026-10-03T00:00:00.000Z",

          sequence:
            1,
        })
      );

    store =
      appendTradingActivityEvent(
        store,
        createTradingActivityEvent({
          id:
            "activity-2",

          domain:
            "NFT",

          type:
            "VERIFIED",

          severity:
            "INFO",

          title:
            "NFT",

          description:
            "NFT event",

          actor: {
            type:
              "USER",

            ref:
              "user-002",
          },

          occurredAt:
            "2026-10-03T00:01:00.000Z",

          sequence:
            2,
        })
      );

    const result =
      queryTradingActivity(
        store,
        {
          domains:
            ["DBX"],

          actorRef:
            "user-001",
        }
      );

    assert.equal(
      result.length,
      1
    );

    assert.equal(
      result[0].id,
      "activity-1"
    );
  }
);
