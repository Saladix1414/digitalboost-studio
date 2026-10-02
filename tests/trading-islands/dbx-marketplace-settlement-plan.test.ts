import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxMarketplaceSettlementPlan,
} from "../../src/trading/dbx/settlement/plan";

test(
  "marketplace settlement requires exact allocation total",
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

    assert.equal(
      plan.totalAmountMinor,
      100_000_000
    );

    assert.equal(
      plan.authoritative,
      false
    );
  }
);

test(
  "settlement rejects allocation mismatch",
  () => {
    assert.throws(
      () =>
        createDbxMarketplaceSettlementPlan({
          id:
            "settlement-plan-2",

          idempotencyKey:
            "settlement-key-2",

          marketplaceOrderId:
            "order-2",

          holdId:
            "hold-2",

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
                80_000_000,
            },
          ],

          createdAt:
            "2026-10-02T13:00:00.000Z",
        }),

      /DBX_SETTLEMENT_ALLOCATION_MISMATCH/
    );
  }
);
