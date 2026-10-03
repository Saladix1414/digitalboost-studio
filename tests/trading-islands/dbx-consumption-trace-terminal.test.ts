import assert from "node:assert/strict";
import test from "node:test";

import {
  appendDbxConsumptionOrchestrationResultTrace,
  createDbxConsumptionAttemptTrace,
} from "../../src/trading/dbx/consumption/observability/orchestrationTrace";

test(
  "terminal failure records release and terminal closure",
  () => {
    const started =
      createDbxConsumptionAttemptTrace({
        intent: {
          id:
            "trace-terminal-intent",
        },

        binding: {
          holdId:
            "trace-terminal-hold",
        },

        recovery: {
          id:
            "trace-terminal-recovery",

          attempt:
            0,
        },

        now:
          "2026-10-02T21:20:00.000Z",
      } as any);

    const trace =
      appendDbxConsumptionOrchestrationResultTrace(
        started,
        {
          status:
            "TERMINAL_FAILURE",

          ledger:
            {} as any,

          holdStore:
            {} as any,

          registry:
            {} as any,

          recovery: {
            id:
              "trace-terminal-recovery",

            consumptionIntentId:
              "trace-terminal-intent",

            holdId:
              "trace-terminal-hold",

            status:
              "TERMINAL_FAILURE",

            attempt:
              1,

            lastFailureCode:
              "POLICY_REJECTED",

            lastFailureClass:
              "TERMINAL",

            transactionId:
              null,

            createdAt:
              "2026-10-02T21:19:00.000Z",

            updatedAt:
              "2026-10-02T21:20:00.000Z",

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
        "2026-10-02T21:20:00.000Z"
      );

    assert.deepEqual(
      trace.events.map(
        event =>
          event.eventType
      ),
      [
        "ATTEMPT_STARTED",
        "ATTEMPT_FAILED",
        "HOLD_RELEASED",
        "TERMINAL_FAILURE",
      ]
    );
  }
);
