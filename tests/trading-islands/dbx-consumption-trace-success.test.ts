import assert from "node:assert/strict";
import test from "node:test";

import {
  appendDbxConsumptionOrchestrationResultTrace,
  createDbxConsumptionAttemptTrace,
} from "../../src/trading/dbx/consumption/observability/orchestrationTrace";

test(
  "successful consumption produces canonical trace sequence",
  () => {
    const input = {
      intent: {
        id:
          "trace-success-intent",
      },

      binding: {
        holdId:
          "trace-success-hold",
      },

      recovery: {
        id:
          "trace-success-recovery",

        attempt:
          0,
      },

      now:
        "2026-10-02T21:00:00.000Z",
    } as any;

    const started =
      createDbxConsumptionAttemptTrace(
        input
      );

    const trace =
      appendDbxConsumptionOrchestrationResultTrace(
        started,
        {
          status:
            "COMPLETED",

          ledger:
            {} as any,

          holdStore:
            {} as any,

          registry:
            {} as any,

          recovery: {
            id:
              "trace-success-recovery",

            consumptionIntentId:
              "trace-success-intent",

            holdId:
              "trace-success-hold",

            status:
              "COMPLETED",

            attempt:
              1,

            lastFailureCode:
              null,

            lastFailureClass:
              null,

            transactionId:
              "dbx-consumption:trace-success-intent",

            createdAt:
              "2026-10-02T20:59:00.000Z",

            updatedAt:
              "2026-10-02T21:00:00.000Z",

            authoritative:
              false,
          },

          record:
            {} as any,

          idempotentReplay:
            false,

          authoritative:
            false,
        },
        "2026-10-02T21:00:00.000Z"
      );

    assert.deepEqual(
      trace.events.map(
        event =>
          event.eventType
      ),
      [
        "ATTEMPT_STARTED",
        "LEDGER_POSTED",
        "HOLD_CAPTURED",
        "COMPLETED",
      ]
    );

    assert.equal(
      trace.authoritative,
      false
    );
  }
);
