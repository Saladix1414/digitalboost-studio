import assert from "node:assert/strict";
import test from "node:test";

import {
  dbxAiRuntimeConsumptionFixture,
} from "../../src/trading/dbx/consumption/fixtures";

import {
  buildDbxConsumptionLedgerTransaction,
} from "../../src/trading/dbx/consumption/ledgerTransaction";

test(
  "consumption ledger transaction is balanced",
  () => {
    const tx =
      buildDbxConsumptionLedgerTransaction(
        dbxAiRuntimeConsumptionFixture
      );

    const debit =
      tx.entries
        .filter(
          entry =>
            entry.side ===
            "DEBIT"
        )
        .reduce(
          (sum, entry) =>
            sum +
            entry.amountMinor,
          0
        );

    const credit =
      tx.entries
        .filter(
          entry =>
            entry.side ===
            "CREDIT"
        )
        .reduce(
          (sum, entry) =>
            sum +
            entry.amountMinor,
          0
        );

    assert.equal(
      debit,
      2_500_000
    );

    assert.equal(
      credit,
      2_500_000
    );

    assert.equal(
      debit,
      credit
    );

    assert.equal(
      tx.kind,
      "FEE"
    );
  }
);
