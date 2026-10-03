import type {
  DbxRewardPoolFundingIntent,
} from "./types";

import {
  assertDbxRewardPoolAccounts,
  assertDbxRewardPoolAmount,
  assertDbxRewardPoolReference,
} from "./validation";

export function createDbxRewardPoolFundingIntent(
  input: {
    readonly id: string;
    readonly idempotencyKey: string;

    readonly sourceAccountId: string;
    readonly rewardPoolAccountId: string;

    readonly amountMinor: number;

    readonly reference: string;
    readonly createdAt: string;
  }
): DbxRewardPoolFundingIntent {
  assertDbxRewardPoolAmount(
    input.amountMinor
  );

  assertDbxRewardPoolAccounts(
    input.sourceAccountId,
    input.rewardPoolAccountId
  );

  assertDbxRewardPoolReference(
    input.reference
  );

  return {
    ...input,
    authoritative: false,
  };
}
