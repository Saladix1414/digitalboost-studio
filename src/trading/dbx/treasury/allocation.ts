import type {
  DbxEconomicAllocation,
  DbxFeePolicy,
  DbxTreasuryAllocationPlan,
} from "./types";

import {
  validateDbxFeePolicy,
} from "./feePolicy";

export function createDbxTreasuryAllocationPlan(
  policy:
    DbxFeePolicy,
  input: {
    readonly id:
      string;

    readonly settlementReference:
      string;

    readonly totalAmountMinor:
      number;

    readonly createdAt:
      string;
  }
): DbxTreasuryAllocationPlan {
  validateDbxFeePolicy(
    policy
  );

  if (
    !Number.isSafeInteger(
      input.totalAmountMinor
    ) ||
    input.totalAmountMinor <= 0
  ) {
    throw new Error(
      "DBX_TREASURY_INVALID_TOTAL"
    );
  }

  const allocations:
    DbxEconomicAllocation[] =
      [];

  let allocated =
    0;

  policy.allocations
    .forEach(
      (
        rule,
        index
      ) => {
        const isLast =
          index ===
          policy.allocations.length - 1;

        const amount =
          isLast
            ? input.totalAmountMinor -
              allocated
            : Math.floor(
                (
                  input.totalAmountMinor *
                  rule.basisPoints
                ) /
                10_000
              );

        if (
          amount <= 0
        ) {
          throw new Error(
            "DBX_TREASURY_ZERO_ALLOCATION"
          );
        }

        allocations.push({
          accountId:
            rule.accountId,

          role:
            rule.role,

          amountMinor:
            amount,
        });

        allocated +=
          amount;
      }
    );

  if (
    allocated !==
      input.totalAmountMinor
  ) {
    throw new Error(
      "DBX_TREASURY_ALLOCATION_MISMATCH"
    );
  }

  return {
    id:
      input.id,

    policyId:
      policy.id,

    policyVersion:
      policy.version,

    settlementReference:
      input.settlementReference,

    totalAmountMinor:
      input.totalAmountMinor,

    allocations,

    createdAt:
      input.createdAt,

    authoritative:
      false,
  };
}
