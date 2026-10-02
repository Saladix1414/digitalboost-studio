import type {
  DbxMarketplaceSettlementPlan,
  DbxSettlementAllocation,
} from "./types";

function assertAmount(
  value:
    number,
  code:
    string
) {
  if (
    !Number.isSafeInteger(
      value
    ) ||
    value <= 0
  ) {
    throw new Error(code);
  }
}

export function createDbxMarketplaceSettlementPlan(
  input: {
    readonly id:
      string;

    readonly idempotencyKey:
      string;

    readonly marketplaceOrderId:
      string;

    readonly holdId:
      string;

    readonly buyerAccountId:
      string;

    readonly totalAmountMinor:
      number;

    readonly allocations:
      readonly DbxSettlementAllocation[];

    readonly createdAt:
      string;
  }
): DbxMarketplaceSettlementPlan {
  assertAmount(
    input.totalAmountMinor,
    "DBX_SETTLEMENT_INVALID_TOTAL"
  );

  if (
    input.allocations.length === 0
  ) {
    throw new Error(
      "DBX_SETTLEMENT_ALLOCATIONS_REQUIRED"
    );
  }

  const ids =
    new Set<string>();

  let allocated =
    0;

  for (
    const allocation
    of input.allocations
  ) {
    assertAmount(
      allocation.amountMinor,
      "DBX_SETTLEMENT_INVALID_ALLOCATION"
    );

    if (
      ids.has(
        allocation.accountId
      )
    ) {
      throw new Error(
        "DBX_SETTLEMENT_DUPLICATE_ACCOUNT"
      );
    }

    ids.add(
      allocation.accountId
    );

    allocated +=
      allocation.amountMinor;
  }

  if (
    allocated !==
      input.totalAmountMinor
  ) {
    throw new Error(
      "DBX_SETTLEMENT_ALLOCATION_MISMATCH"
    );
  }

  return {
    ...input,

    authoritative:
      false,
  };
}
