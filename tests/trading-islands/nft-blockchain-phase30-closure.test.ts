import assert from "node:assert/strict";
import test from "node:test";

import {
  prepareNftBlockchainGatewayRequest,
} from "../../src/trading/nft/blockchain/pipeline";

import {
  runFixtureBlockchainEvidencePipeline,
} from "../../src/trading/nft/blockchain/evidencePipeline";

import {
  evaluateBlockchainRecovery,
} from "../../src/trading/nft/blockchain/recovery";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

import {
  nftBlockchainSubmissionFixture,
} from "../../src/trading/nft/blockchain/evidenceFixtures";

test(
  "Phase 30 preserves send preparation boundary",
  () => {
    const result =
      prepareNftBlockchainGatewayRequest(
        nftBlockchainGatewayRequestFixture
      );

    assert.equal(
      result.state.stage,
      "SEND_PREPARED"
    );

    assert.equal(
      result.preparation?.transactionSubmitted,
      false
    );

    assert.equal(
      result.preparation?.executable,
      false
    );
  }
);

test(
  "Phase 30 deterministic evidence pipeline reaches indexed",
  () => {
    const result =
      runFixtureBlockchainEvidencePipeline(
        nftBlockchainGatewayRequestFixture,
        nftBlockchainSubmissionFixture
      );

    assert.equal(
      result.state.stage,
      "INDEXED"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "Phase 30 recovery remains non-executable",
  () => {
    const result =
      evaluateBlockchainRecovery(
        nftBlockchainGatewayRequestFixture,
        {
          maxAttempts:
            1,

          fallbackEnabled:
            true,

          authoritative:
            false,
        },
        1
      );

    assert.equal(
      result.retry.decision,
      "FALLBACK"
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
