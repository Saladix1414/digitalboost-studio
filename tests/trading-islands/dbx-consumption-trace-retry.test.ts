import assert from "node:assert/strict";
import test from "node:test";

import {
  appendDbxConsumptionOrchestrationResultTrace,
  createDbxConsumptionAttemptTrace,
} from "../../src/trading/dbx/consumption/observability/orchestrationTrace";

test(
  "retryable failure produces retry trace without release",
  () => {
    const started =
      createDbxConsumptionAttemptTrace({
        intent: {
          id:
            "trace-retry-intent",
        },

        binding: {
          holdId:
            "trace-retry-hold",
        },

        recovery: {
          id:
            "trace-retry-recovery",

          attempt:
            0,
        },

        now:
          "2026-10-02T21:10:00.000Z",
      } as any);

    const trace =
      appendDbxConsumptionOrchestrationResultTrace(
        started,
        {
          status:
            "RETRY_PENDING",

          ledger:
            {} as any,

          holdStore:
            {} as any,

          registry:
            {} as any,

          recovery: {
            id:
              "trace-retry-recovery",

            consumptionIntentId:
              "trace-retry-intent",

            holdId:
              "trace-retry-hold",

            status:
              "RETRY_PENDING",

            attempt:
              1,

            lastFailureCode:
              "LEDGER_TEMPORARY_FAILURE",

            lastFailureClass:
              "RETRYABLE",

            transactionId:
              null,

            createdAt:
              "2026-10-02T21:09:00.000Z",

            updatedAt:
              "2026-10-02T21:10:00.000Z",

            authoritative:
              false,
          },

          record:
            null,

          idempotentReplay:
            false,

          authoritative:
            false,
        },
        "2026-10-02T21:10:00.000Z"
      );

    assert.deepEqual(
      trace.events.map(
        event =>
          event.eventType
      ),
      [
        "ATTEMPT_STARTED",
        "ATTEMPT_FAILED",
        "RETRY_PENDING",
      ]
    );

    assert.equal(
      trace.events.some(
        event =>
          event.eventType ===
          "HOLD_RELEASED"
      ),
      false
    );
  }
);
