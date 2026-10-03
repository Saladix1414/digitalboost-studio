import type {
  DbxEconomicRewardPurpose,
  DbxRewardDistributionIntent,
} from "./types";

import {
  assertDbxRewardPoolAccounts,
  assertDbxRewardPoolAmount,
  assertDbxRewardPoolReference,
} from "./validation";

export function createDbxRewardDistributionIntent(
  input: {
    readonly id: string;
    readonly idempotencyKey: string;

    readonly rewardPoolAccountId: string;
    readonly recipientAccountId: string;

    readonly amountMinor: number;

    readonly purpose:
      DbxEconomicRewardPurpose;

    readonly reference: string;
    readonly createdAt: string;
  }
): DbxRewardDistributionIntent {
  assertDbxRewardPoolAmount(
    input.amountMinor
  );

  assertDbxRewardPoolAccounts(
    input.rewardPoolAccountId,
    input.recipientAccountId
  );

  assertDbxRewardPoolReference(
    input.reference
  );

  return {
    ...input,
    authoritative: false,
  };
}
