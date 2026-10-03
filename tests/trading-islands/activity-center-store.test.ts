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
  "activity store appends deterministic event",
  () => {
    const event =
      createTradingActivityEvent({
        id:
          "event-1",

        domain:
          "DBX",

        type:
          "POSTED",

        severity:
          "SUCCESS",

        title:
          "Ledger posting",

        description:
          "DBX transaction posted.",

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
      });

    const store =
      appendTradingActivityEvent(
        createTradingActivityStore(),
        event
      );

    assert.equal(
      store.events.length,
      1
    );

    assert.equal(
      store.events[0]
        .authoritative,
      false
    );
  }
);

test(
  "exact event replay is idempotent",
  () => {
    const event =
      createTradingActivityEvent({
        id:
          "event-replay",

        domain:
          "SYSTEM",

        type:
          "CREATED",

        severity:
          "INFO",

        title:
          "Fixture",

        description:
          "Fixture event.",

        actor: {
          type:
            "SYSTEM",

          ref:
            "digitalboost",
        },

        occurredAt:
          "2026-10-03T00:00:00.000Z",

        sequence:
          1,
      });

    const first =
      appendTradingActivityEvent(
        createTradingActivityStore(),
        event
      );

    const replay =
      appendTradingActivityEvent(
        first,
        event
      );

    assert.equal(
      replay.events.length,
      1
    );
  }
);
