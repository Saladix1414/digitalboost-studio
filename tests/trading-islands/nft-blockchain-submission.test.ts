import assert from "node:assert/strict";
import test from "node:test";

import {
  prepareNftBlockchainGatewayRequest,
} from "../../src/trading/nft/blockchain/pipeline";

import {
  createFixtureBlockchainSubmission,
} from "../../src/trading/nft/blockchain/submission";

import {
  nftBlockchainGatewayRequestFixture,
} from "../../src/trading/nft/blockchain/fixtures";

test(
  "prepared request can create deterministic submission evidence",
  () => {
    const prepared =
      prepareNftBlockchainGatewayRequest(
        nftBlockchainGatewayRequestFixture
      );

    assert.ok(
      prepared.preparation
    );

    const submission =
      createFixtureBlockchainSubmission(
        prepared.preparation!,
        {
          txHash:
            "0xfixture001",

          submittedAt:
            "2026-10-14T10:20:00.000Z",
        }
      );

    assert.equal(
      submission.stage,
      "SUBMITTED"
    );

    assert.equal(
      submission.source,
      "FIXTURE"
    );

    assert.equal(
      submission.authoritative,
      false
    );
  }
);
