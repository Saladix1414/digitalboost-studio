import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDbxRewardPoolDistributionTransaction,
  buildDbxRewardPoolFundingTransaction,
} from "../../src/trading/dbx/rewardPool/ledgerTransactions";

import {
  dbxRewardDistributionIntentFixture,
  dbxRewardPoolFundingIntentFixture,
} from "../../src/trading/dbx/rewardPool/fixtures";

function totals(
  entries: readonly {
    side: "DEBIT" | "CREDIT";
    amountMinor: number;
  }[]
) {
  const debit =
    entries
      .filter(
        entry =>
          entry.side === "DEBIT"
      )
      .reduce(
        (sum, entry) =>
          sum + entry.amountMinor,
        0
      );

  const credit =
    entries
      .filter(
        entry =>
          entry.side === "CREDIT"
      )
      .reduce(
        (sum, entry) =>
          sum + entry.amountMinor,
        0
      );

  return {
    debit,
    credit,
  };
}

test(
  "reward pool funding transaction is balanced",
  () => {
    const tx =
      buildDbxRewardPoolFundingTransaction(
        dbxRewardPoolFundingIntentFixture
      );

    const result =
      totals(tx.entries);

    assert.equal(
      result.debit,
      result.credit
    );

    assert.equal(
      result.debit,
      20_000_000
    );
  }
);

test(
  "reward pool distribution transaction is balanced",
  () => {
    const tx =
      buildDbxRewardPoolDistributionTransaction(
        dbxRewardDistributionIntentFixture
      );

    const result =
      totals(tx.entries);

    assert.equal(
      result.debit,
      result.credit
    );

    assert.equal(
      result.debit,
      5_000_000
    );
  }
);
