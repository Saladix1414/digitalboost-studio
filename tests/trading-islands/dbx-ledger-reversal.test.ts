import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDbxAccountBalance,
} from "../../src/trading/dbx/ledger/balance";

import {
  createDbxLedger,
  postDbxLedgerTransaction,
} from "../../src/trading/dbx/ledger/ledger";

import {
  createDbxReversalTransaction,
} from "../../src/trading/dbx/ledger/reversal";

import {
  dbxCreatorRewardFixture,
  dbxLedgerAccountFixtures,
  dbxOpeningIssuanceFixture,
} from "../../src/trading/dbx/ledger/fixtures";

test(
  "posted DBX movement is corrected with compensating reversal",
  () => {
    let ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      ).ledger;

    const reward =
      postDbxLedgerTransaction(
        ledger,
        dbxCreatorRewardFixture
      );

    ledger =
      reward.ledger;

    const reversal =
      createDbxReversalTransaction(
        reward.transaction,
        {
          id:
            "dbx-tx-reversal-001",

          idempotencyKey:
            "idem-dbx-reversal-001",

          reference:
            "correction:reward-001",

          createdAt:
            "2026-10-02T10:03:00.000Z",

          reason:
            "deterministic-test-correction",
        }
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        reversal
      ).ledger;

    const creator =
      calculateDbxAccountBalance(
        ledger,
        "dbx-creator-001"
      );

    assert.equal(
      creator.balanceMinor,
      0
    );

    assert.equal(
      ledger.transactions.length,
      3
    );
  }
);
