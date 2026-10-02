import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateBlockchainRecovery,
} from "../../src/trading/nft/blockchain/recovery";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

const policy = {
  maxAttempts:
    2,

  fallbackEnabled:
    true,

  authoritative:
    false as const,
};

test(
  "recovery retries before fallback threshold",
  () => {
    const result =
      evaluateBlockchainRecovery(
        nftBlockchainGatewayRequestFixture,
        policy,
        1
      );

    assert.equal(
      result.retry.decision,
      "RETRY"
    );

    assert.equal(
      result.fallback,
      null
    );
  }
);

test(
  "recovery creates fallback after retry exhaustion",
  () => {
    const result =
      evaluateBlockchainRecovery(
        nftBlockchainGatewayRequestFixture,
        policy,
        2
      );

    assert.equal(
      result.retry.decision,
      "FALLBACK"
    );

    assert.notEqual(
      result.fallback,
      null
    );

    assert.equal(
      result.fallback?.executable,
      false
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);
