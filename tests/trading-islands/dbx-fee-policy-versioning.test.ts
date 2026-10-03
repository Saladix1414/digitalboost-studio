import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxTreasuryAllocationPlan,
} from "../../src/trading/dbx/treasury/allocation";

import {
  dbxMarketplaceFeePolicyFixture,
} from "../../src/trading/dbx/treasury/fixtures";

test(
  "allocation plan preserves policy version",
  () => {
    const policyV2 = {
      ...dbxMarketplaceFeePolicyFixture,

      id:
        "dbx-marketplace-fee-policy-v2",

      version:
        "2",
    };

    const plan =
      createDbxTreasuryAllocationPlan(
        policyV2,
        {
          id:
            "treasury-plan-v2",

          settlementReference:
            "marketplace-order-v2",

          totalAmountMinor:
            50_000_000,

          createdAt:
            "2026-10-02T14:10:00.000Z",
        }
      );

    assert.equal(
      plan.policyId,
      "dbx-marketplace-fee-policy-v2"
    );

    assert.equal(
      plan.policyVersion,
      "2"
    );
  }
);
