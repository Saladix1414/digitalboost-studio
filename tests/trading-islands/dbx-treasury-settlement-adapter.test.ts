import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxTreasuryAllocationPlan,
} from "../../src/trading/dbx/treasury/allocation";

import {
  dbxMarketplaceFeePolicyFixture,
} from "../../src/trading/dbx/treasury/fixtures";

import {
  toDbxSettlementAllocations,
} from "../../src/trading/dbx/treasury/settlementAdapter";

test(
  "treasury plan converts into settlement allocations",
  () => {
    const plan =
      createDbxTreasuryAllocationPlan(
        dbxMarketplaceFeePolicyFixture,
        {
          id:
            "treasury-plan-1",

          settlementReference:
            "marketplace-order-1",

          totalAmountMinor:
            100_000_000,

          createdAt:
            "2026-10-02T14:00:00.000Z",
        }
      );

    const allocations =
      toDbxSettlementAllocations(
        plan
      );

    const total =
      allocations.reduce(
        (
          sum,
          allocation
        ) =>
          sum +
          allocation.amountMinor,
        0
      );

    assert.equal(
      total,
      100_000_000
    );

    assert.equal(
      allocations[0].role,
      "CREATOR"
    );

    assert.equal(
      allocations
        .slice(1)
        .every(
          allocation =>
            allocation.role ===
            "PLATFORM"
        ),
      true
    );
  }
);
