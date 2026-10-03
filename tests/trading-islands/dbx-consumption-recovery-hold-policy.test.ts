import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveDbxConsumptionHoldRecoveryAction,
} from "../../src/trading/dbx/consumption/recovery/holdPolicy";

import type {
  DbxConsumptionRecoveryState,
} from "../../src/trading/dbx/consumption/recovery/types";

function state(
  status:
    DbxConsumptionRecoveryState["status"]
): DbxConsumptionRecoveryState {
  return {
    id:
      "recovery",

    consumptionIntentId:
      "intent",

    holdId:
      "hold",

    status,

    attempt:
      1,

    lastFailureCode:
      null,

    lastFailureClass:
      null,

    transactionId:
      status === "COMPLETED"
        ? "tx-1"
        : null,

    createdAt:
      "2026-10-02T19:00:00.000Z",

    updatedAt:
      "2026-10-02T19:01:00.000Z",

    authoritative:
      false,
  };
}

test(
  "retry pending keeps reservation active",
  () => {
    assert.equal(
      resolveDbxConsumptionHoldRecoveryAction(
        state(
          "RETRY_PENDING"
        )
      ),
      "KEEP_ACTIVE"
    );
  }
);

test(
  "terminal failure releases reservation",
  () => {
    assert.equal(
      resolveDbxConsumptionHoldRecoveryAction(
        state(
          "TERMINAL_FAILURE"
        )
      ),
      "RELEASE"
    );
  }
);

test(
  "completed consumption expects captured hold",
  () => {
    assert.equal(
      resolveDbxConsumptionHoldRecoveryAction(
        state(
          "COMPLETED"
        )
      ),
      "CAPTURED"
    );
  }
);
