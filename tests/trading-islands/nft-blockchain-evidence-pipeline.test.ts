import assert from "node:assert/strict";
import test from "node:test";

import {
  runFixtureBlockchainEvidencePipeline,
} from "../../src/trading/nft/blockchain/evidencePipeline";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

import {
  nftBlockchainSubmissionFixture,
} from "../../src/trading/nft/blockchain/evidenceFixtures";

test(
  "fixture evidence pipeline reaches INDEXED",
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
      result.submission.stage,
      "SUBMITTED"
    );

    assert.equal(
      result.verification.verified,
      true
    );

    assert.notEqual(
      result.index,
      null
    );

    assert.equal(
      result.index?.stage,
      "INDEXED"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);
