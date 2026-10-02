import type {
  DbxSettlementAllocation,
} from "./types";

export type DbxCreatorEarningsPolicy = {
  readonly creatorBps:
    number;

  readonly platformBps:
    number;

  readonly authoritative:
    false;
};

export function createDbxCreatorEarningsAllocations(
  input: {
    readonly totalAmountMinor:
      number;

    readonly creatorAccountId:
      string;

    readonly platformAccountId:
      string;

    readonly policy:
      DbxCreatorEarningsPolicy;
  }
): readonly DbxSettlementAllocation[] {
  if (
    input.policy.creatorBps +
      input.policy.platformBps !==
    10_000
  ) {
    throw new Error(
      "DBX_SETTLEMENT_POLICY_BPS_INVALID"
    );
  }

  const creatorAmount =
    Math.floor(
      (
        input.totalAmountMinor *
        input.policy.creatorBps
      ) /
      10_000
    );

  const platformAmount =
    input.totalAmountMinor -
    creatorAmount;

  if (
    creatorAmount <= 0 ||
    platformAmount <= 0
  ) {
    throw new Error(
      "DBX_SETTLEMENT_POLICY_ZERO_ALLOCATION"
    );
  }

  return [
    {
      accountId:
        input.creatorAccountId,

      role:
        "CREATOR",

      amountMinor:
        creatorAmount,
    },

    {
      accountId:
        input.platformAccountId,

      role:
        "PLATFORM",

      amountMinor:
        platformAmount,
    },
  ];
}
