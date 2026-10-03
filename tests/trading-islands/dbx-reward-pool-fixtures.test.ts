import assert from "node:assert/strict";
import test from "node:test";

import {
  dbxRewardDistributionIntentFixture,
  dbxRewardPoolFundingIntentFixture,
} from "../../src/trading/dbx/rewardPool/fixtures";

test(
  "economic reward pool fixtures use canonical account references",
  () => {
    assert.equal(
      dbxRewardPoolFundingIntentFixture
        .sourceAccountId,
      "platform-treasury"
    );

    assert.equal(
      dbxRewardPoolFundingIntentFixture
        .rewardPoolAccountId,
      "reward-pool"
    );

    assert.equal(
      dbxRewardDistributionIntentFixture
        .rewardPoolAccountId,
      "reward-pool"
    );

    assert.equal(
      dbxRewardDistributionIntentFixture
        .recipientAccountId,
      "creator-001"
    );
  }
);
