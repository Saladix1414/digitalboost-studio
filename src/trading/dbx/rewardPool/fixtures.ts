import {
  createDbxRewardDistributionIntent,
} from "./distributionIntent";

import {
  createDbxRewardPoolFundingIntent,
} from "./fundingIntent";

export const dbxRewardPoolFundingIntentFixture =
  createDbxRewardPoolFundingIntent({
    id:
      "reward-pool-funding-001",

    idempotencyKey:
      "reward-pool-funding-key-001",

    sourceAccountId:
      "platform-treasury",

    rewardPoolAccountId:
      "reward-pool",

    amountMinor:
      20_000_000,

    reference:
      "fixture-economic-reward-funding",

    createdAt:
      "2026-10-02T15:00:00.000Z",
  });

export const dbxRewardDistributionIntentFixture =
  createDbxRewardDistributionIntent({
    id:
      "reward-distribution-001",

    idempotencyKey:
      "reward-distribution-key-001",

    rewardPoolAccountId:
      "reward-pool",

    recipientAccountId:
      "creator-001",

    amountMinor:
      5_000_000,

    purpose:
      "CREATOR_INCENTIVE",

    reference:
      "fixture-creator-incentive",

    createdAt:
      "2026-10-02T15:05:00.000Z",
  });
