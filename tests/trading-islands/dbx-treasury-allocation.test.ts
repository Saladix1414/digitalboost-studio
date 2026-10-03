import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxTreasuryAllocationPlan,
} from "../../src/trading/dbx/treasury/allocation";

import {
  dbxMarketplaceFeePolicyFixture,
} from "../../src/trading/dbx/treasury/fixtures";

test(
  "treasury allocation preserves total DBX",
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

    const total =
      plan.allocations.reduce(
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
      plan.policyVersion,
      "1"
    );

    assert.equal(
      plan.authoritative,
      false
    );
  }
);

test(
  "fixture distributes expected roles",
  () => {
    const plan =
      createDbxTreasuryAllocationPlan(
        dbxMarketplaceFeePolicyFixture,
        {
          id:
            "treasury-plan-2",

          settlementReference:
            "marketplace-order-2",

          totalAmountMinor:
            100_000_000,

          createdAt:
            "2026-10-02T14:00:00.000Z",
        }
      );

    const roleAmounts =
      Object.fromEntries(
        plan.allocations.map(
          allocation => [
            allocation.role,
            allocation.amountMinor,
          ]
        )
      );

    assert.equal(
      roleAmounts.CREATOR,
      82_000_000
    );

    assert.equal(
      roleAmounts.PLATFORM_REVENUE,
      8_000_000
    );

    assert.equal(
      roleAmounts.TREASURY,
      5_000_000
    );

    assert.equal(
      roleAmounts.INFRASTRUCTURE,
      3_000_000
    );

    assert.equal(
      roleAmounts.REWARD_POOL,
      2_000_000
    );
  }
);
