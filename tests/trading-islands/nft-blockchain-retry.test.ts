import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateBlockchainRetry,
} from "../../src/trading/nft/blockchain/retry";

const policy = {
  maxAttempts:
    3,

  fallbackEnabled:
    true,

  authoritative:
    false as const,
};

test(
  "retry continues while budget remains",
  () => {
    const result =
      evaluateBlockchainRetry(
        policy,
        1
      );

    assert.equal(
      result.decision,
      "RETRY"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "fallback is selected when retry budget is exhausted",
  () => {
    const result =
      evaluateBlockchainRetry(
        policy,
        3
      );

    assert.equal(
      result.decision,
      "FALLBACK"
    );
  }
);

test(
  "stop is selected when fallback is disabled",
  () => {
    const result =
      evaluateBlockchainRetry(
        {
          ...policy,

          fallbackEnabled:
            false,
        },
        3
      );

    assert.equal(
      result.decision,
      "STOP"
    );
  }
);
