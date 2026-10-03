import assert from "node:assert/strict";
import test from "node:test";

import {
  beginDbxConsumptionAttempt,
  completeDbxConsumptionAttempt,
  createDbxConsumptionRecoveryState,
  failDbxConsumptionAttempt,
} from "../../src/trading/dbx/consumption/recovery/stateMachine";

test(
  "retryable failure keeps recovery retryable",
  () => {
    const initial =
      createDbxConsumptionRecoveryState({
        id:
          "recovery-1",

        consumptionIntentId:
          "intent-1",

        holdId:
          "hold-1",

        createdAt:
          "2026-10-02T19:00:00.000Z",
      });

    const processing =
      beginDbxConsumptionAttempt(
        initial,
        "2026-10-02T19:01:00.000Z"
      );

    const failed =
      failDbxConsumptionAttempt(
        processing,
        "LEDGER_TEMPORARY_FAILURE",
        "2026-10-02T19:02:00.000Z"
      );

    assert.equal(
      failed.status,
      "RETRY_PENDING"
    );

    assert.equal(
      failed.lastFailureClass,
      "RETRYABLE"
    );
  }
);

test(
  "terminal failure closes recovery state",
  () => {
    const initial =
      createDbxConsumptionRecoveryState({
        id:
          "recovery-2",

        consumptionIntentId:
          "intent-2",

        holdId:
          "hold-2",

        createdAt:
          "2026-10-02T19:00:00.000Z",
      });

    const processing =
      beginDbxConsumptionAttempt(
        initial,
        "2026-10-02T19:01:00.000Z"
      );

    const failed =
      failDbxConsumptionAttempt(
        processing,
        "POLICY_REJECTED",
        "2026-10-02T19:02:00.000Z"
      );

    assert.equal(
      failed.status,
      "TERMINAL_FAILURE"
    );

    assert.equal(
      failed.lastFailureClass,
      "TERMINAL"
    );
  }
);

test(
  "successful attempt becomes completed",
  () => {
    const initial =
      createDbxConsumptionRecoveryState({
        id:
          "recovery-3",

        consumptionIntentId:
          "intent-3",

        holdId:
          "hold-3",

        createdAt:
          "2026-10-02T19:00:00.000Z",
      });

    const processing =
      beginDbxConsumptionAttempt(
        initial,
        "2026-10-02T19:01:00.000Z"
      );

    const complete =
      completeDbxConsumptionAttempt(
        processing,
        "dbx-consumption:intent-3",
        "2026-10-02T19:02:00.000Z"
      );

    assert.equal(
      complete.status,
      "COMPLETED"
    );

    assert.equal(
      complete.transactionId,
      "dbx-consumption:intent-3"
    );
  }
);
