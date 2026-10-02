import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDbxMarketplaceSettlementLedgerTransaction,
} from "../../src/trading/dbx/settlement/ledgerTransaction";

import {
  createDbxMarketplaceSettlementPlan,
} from "../../src/trading/dbx/settlement/plan";

test(
  "settlement ledger transaction is balanced",
  () => {
    const plan =
      createDbxMarketplaceSettlementPlan({
        id:
          "settlement-plan-1",

        idempotencyKey:
          "settlement-key-1",

        marketplaceOrderId:
          "order-1",

        holdId:
          "hold-1",

        buyerAccountId:
          "user-001",

        totalAmountMinor:
          100_000_000,

        allocations: [
          {
            accountId:
              "creator-001",

            role:
              "CREATOR",

            amountMinor:
              85_000_000,
          },

          {
            accountId:
              "platform-revenue",

            role:
              "PLATFORM",

            amountMinor:
              15_000_000,
          },
        ],

        createdAt:
          "2026-10-02T13:00:00.000Z",
      });

    const tx =
      buildDbxMarketplaceSettlementLedgerTransaction(
        plan,
        "2026-10-02T13:01:00.000Z"
      );

    const debit =
      tx.entries
        .filter(
          (entry) =>
            entry.side ===
            "DEBIT"
        )
        .reduce(
          (
            total,
            entry
          ) =>
            total +
            entry.amountMinor,
          0
        );

    const credit =
      tx.entries
        .filter(
          (entry) =>
            entry.side ===
            "CREDIT"
        )
        .reduce(
          (
            total,
            entry
          ) =>
            total +
            entry.amountMinor,
          0
        );

    assert.equal(
      debit,
      100_000_000
    );

    assert.equal(
      credit,
      100_000_000
    );

    assert.equal(
      debit,
      credit
    );
  }
);
