import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxCreatorEarningsAllocations,
} from "../../src/trading/dbx/settlement/creatorEarnings";

import {
  dbxCreatorEarningsPolicyFixture,
} from "../../src/trading/dbx/settlement/fixtures";

test(
  "creator and platform allocations sum to total settlement",
  () => {
    const allocations =
      createDbxCreatorEarningsAllocations({
        totalAmountMinor:
          100_000_000,

        creatorAccountId:
          "creator-001",

        platformAccountId:
          "platform-revenue",

        policy:
          dbxCreatorEarningsPolicyFixture,
      });

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
      allocations[0]
        .amountMinor,
      85_000_000
    );

    assert.equal(
      allocations[1]
        .amountMinor,
      15_000_000
    );
  }
);

test(
  "creator earnings policy must equal 100 percent",
  () => {
    assert.throws(
      () =>
        createDbxCreatorEarningsAllocations({
          totalAmountMinor:
            100_000_000,

          creatorAccountId:
            "creator-001",

          platformAccountId:
            "platform-revenue",

          policy: {
            creatorBps:
              8000,

            platformBps:
              1000,

            authoritative:
              false,
          },
        }),

      /DBX_SETTLEMENT_POLICY_BPS_INVALID/
    );
  }
);
