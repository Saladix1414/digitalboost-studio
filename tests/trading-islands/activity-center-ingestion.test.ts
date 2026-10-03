import assert from "node:assert/strict";
import test from "node:test";

import {
  createTradingActivityEvent,
} from "../../src/trading/activity/factory";

import {
  createTradingActivityStore,
} from "../../src/trading/activity/store";

import {
  ingestTradingActivityEvents,
} from "../../src/trading/activity/ingest";

test(
  "multiple cross-domain events ingest in deterministic order",
  () => {
    const events = [
      createTradingActivityEvent({
        id:
          "ingest-1",

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
            "SYSTEM",

          ref:
            "digitalboost",
        },

        occurredAt:
          "2026-10-03T00:40:00.000Z",

        sequence:
          1,
      }),

      createTradingActivityEvent({
        id:
          "ingest-2",

        domain:
          "BLOCKCHAIN",

        type:
          "VERIFIED",

        severity:
          "SUCCESS",

        title:
          "Blockchain",

        description:
          "Blockchain event",

        actor: {
          type:
            "SYSTEM",

          ref:
            "digitalboost",
        },

        occurredAt:
          "2026-10-03T00:41:00.000Z",

        sequence:
          2,
      }),
    ];

    const store =
      ingestTradingActivityEvents(
        createTradingActivityStore(),
        events
      );

    assert.equal(
      store.events.length,
      2
    );

    assert.equal(
      store.events[0].id,
      "ingest-1"
    );

    assert.equal(
      store.events[1].id,
      "ingest-2"
    );
  }
);
