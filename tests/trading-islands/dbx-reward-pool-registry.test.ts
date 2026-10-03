import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxRewardPoolRegistry,
  registerDbxRewardPoolPosting,
} from "../../src/trading/dbx/rewardPool/registry";

const record = {
  id:
    "record-1",

  intentId:
    "intent-1",

  idempotencyKey:
    "intent-key-1",

  transactionId:
    "transaction-1",

  status:
    "FUNDED" as const,

  amountMinor:
    10_000_000,

  sourceAccountId:
    "platform-treasury",

  destinationAccountId:
    "reward-pool",

  postedAt:
    "2026-10-02T15:00:00.000Z",

  systemOfRecord:
    "DBX_LEDGER" as const,

  governanceAuthority:
    false as const,
};

test(
  "exact reward posting replay is idempotent",
  () => {
    const registry1 =
      registerDbxRewardPoolPosting(
        createDbxRewardPoolRegistry(),
        record
      );

    const registry2 =
      registerDbxRewardPoolPosting(
        registry1,
        record
      );

    assert.equal(
      registry2.records.length,
      1
    );
  }
);

test(
  "same intent with conflicting transaction is rejected",
  () => {
    const registry =
      registerDbxRewardPoolPosting(
        createDbxRewardPoolRegistry(),
        record
      );

    assert.throws(
      () =>
        registerDbxRewardPoolPosting(
          registry,
          {
            ...record,

            transactionId:
              "transaction-2",
          }
        ),

      /DBX_REWARD_POOL_INTENT_CONFLICT/
    );
  }
);
