import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxRewardDistributionIntent,
} from "../../src/trading/dbx/rewardPool/distributionIntent";

import {
  createDbxRewardPoolFundingIntent,
} from "../../src/trading/dbx/rewardPool/fundingIntent";

test(
  "reward pool funding uses positive existing DBX",
  () => {
    const intent =
      createDbxRewardPoolFundingIntent({
        id: "fund-1",
        idempotencyKey: "fund-key-1",

        sourceAccountId:
          "platform-treasury",

        rewardPoolAccountId:
          "reward-pool",

        amountMinor:
          10_000_000,

        reference:
          "funding-test",

        createdAt:
          "2026-10-02T15:00:00.000Z",
      });

    assert.equal(
      intent.amountMinor,
      10_000_000
    );

    assert.equal(
      intent.authoritative,
      false
    );
  }
);

test(
  "reward distribution requires positive amount",
  () => {
    assert.throws(
      () =>
        createDbxRewardDistributionIntent({
          id: "dist-1",
          idempotencyKey:
            "dist-key-1",

          rewardPoolAccountId:
            "reward-pool",

          recipientAccountId:
            "creator-001",

          amountMinor: 0,

          purpose:
            "CREATOR_INCENTIVE",

          reference:
            "distribution-test",

          createdAt:
            "2026-10-02T15:00:00.000Z",
        }),

      /DBX_REWARD_POOL_INVALID_AMOUNT/
    );
  }
);
