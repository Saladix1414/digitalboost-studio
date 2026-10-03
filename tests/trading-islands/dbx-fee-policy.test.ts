import assert from "node:assert/strict";
import test from "node:test";

import {
  validateDbxFeePolicy,
} from "../../src/trading/dbx/treasury/feePolicy";

import {
  dbxMarketplaceFeePolicyFixture,
} from "../../src/trading/dbx/treasury/fixtures";

test(
  "fee policy must total exactly 10000 basis points",
  () => {
    const result =
      validateDbxFeePolicy(
        dbxMarketplaceFeePolicyFixture
      );

    assert.equal(
      result.valid,
      true
    );
  }
);

test(
  "invalid fee percentage total is rejected",
  () => {
    assert.throws(
      () =>
        validateDbxFeePolicy({
          ...dbxMarketplaceFeePolicyFixture,

          allocations:
            dbxMarketplaceFeePolicyFixture
              .allocations
              .map(
                (
                  allocation,
                  index
                ) =>
                  index === 0
                    ? {
                        ...allocation,
                        basisPoints:
                          8100,
                      }
                    : allocation
              ),
        }),

      /DBX_FEE_POLICY_BPS_INVALID/
    );
  }
);

test(
  "disabled fee policy is rejected",
  () => {
    assert.throws(
      () =>
        validateDbxFeePolicy({
          ...dbxMarketplaceFeePolicyFixture,

          enabled:
            false,
        }),

      /DBX_FEE_POLICY_DISABLED/
    );
  }
);
