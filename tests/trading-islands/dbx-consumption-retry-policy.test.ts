import assert from "node:assert/strict";
import test from "node:test";

import {
  assertDbxConsumptionRetryAllowed,
} from "../../src/trading/dbx/consumption/recovery/retryPolicy";

import type {
  DbxConsumptionRecoveryState,
} from "../../src/trading/dbx/consumption/recovery/types";

const retryPending:
  DbxConsumptionRecoveryState = {
  id:
    "retry-state",

  consumptionIntentId:
    "intent",

  holdId:
    "hold",

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
    "2026-10-02T19:00:00.000Z",

  updatedAt:
    "2026-10-02T19:01:00.000Z",

  authoritative:
    false,
};

test(
  "retry policy allows bounded retry",
  () => {
    const result =
      assertDbxConsumptionRetryAllowed(
        retryPending,
        {
          maxAttempts:
            3,

          authoritative:
            false,
        }
      );

    assert.equal(
      result.allowed,
      true
    );

    assert.equal(
      result.nextAttempt,
      2
    );
  }
);

test(
  "retry limit blocks further attempt",
  () => {
    assert.throws(
      () =>
        assertDbxConsumptionRetryAllowed(
          {
            ...retryPending,

            attempt:
              3,
          },
          {
            maxAttempts:
              3,

            authoritative:
              false,
          }
        ),

      /DBX_CONSUMPTION_RETRY_LIMIT_REACHED/
    );
  }
);
