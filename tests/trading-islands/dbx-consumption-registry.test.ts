import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionRegistry,
  registerDbxConsumptionPosting,
} from "../../src/trading/dbx/consumption/registry";

const record = {
  id:
    "consumption-record-1",

  intentId:
    "consumption-1",

  idempotencyKey:
    "consumption-key-1",

  userAccountId:
    "user-001",

  destinationAccountId:
    "platform-revenue",

  amountMinor:
    2_000_000,

  purpose:
    "AI_RUNTIME" as const,

  transactionId:
    "dbx-consumption:consumption-1",

  status:
    "POSTED" as const,

  postedAt:
    "2026-10-02T16:00:00.000Z",

  systemOfRecord:
    "DBX_LEDGER" as const,

  governanceAuthority:
    false as const,
};

test(
  "exact consumption replay is idempotent",
  () => {
    const first =
      registerDbxConsumptionPosting(
        createDbxConsumptionRegistry(),
        record
      );

    const second =
      registerDbxConsumptionPosting(
        first,
        record
      );

    assert.equal(
      second.records.length,
      1
    );
  }
);

test(
  "same intent with different transaction is rejected",
  () => {
    const registry =
      registerDbxConsumptionPosting(
        createDbxConsumptionRegistry(),
        record
      );

    assert.throws(
      () =>
        registerDbxConsumptionPosting(
          registry,
          {
            ...record,

            transactionId:
              "dbx-consumption:conflict",
          }
        ),

      /DBX_CONSUMPTION_INTENT_CONFLICT/
    );
  }
);
