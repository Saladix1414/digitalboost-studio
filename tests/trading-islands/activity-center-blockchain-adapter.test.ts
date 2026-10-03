import assert from "node:assert/strict";
import test from "node:test";

import {
  activityFromBlockchainIndex,
  activityFromBlockchainSubmission,
  activityFromBlockchainVerification,
} from "../../src/trading/activity/adapters/blockchain";

test(
  "blockchain submission remains observational",
  () => {
    const event =
      activityFromBlockchainSubmission(
        {
          requestId:
            "request-1",

          txHash:
            "0xfixture",

          chainRef:
            "polygon",

          submittedAt:
            "2026-10-03T00:20:00.000Z",

          source:
            "FIXTURE",

          stage:
            "SUBMITTED",

          authoritative:
            false,
        },
        1
      );

    assert.equal(
      event.type,
      "SUBMITTED"
    );

    assert.equal(
      event.domain,
      "BLOCKCHAIN"
    );

    assert.equal(
      event.authoritative,
      false
    );
  }
);

test(
  "verification maps success and failure explicitly",
  () => {
    const verified =
      activityFromBlockchainVerification(
        {
          requestId:
            "request-2",

          txHash:
            "0xverified",

          chainRef:
            "polygon",

          blockRef:
            "block-1",

          checks:
            [],

          verified:
            true,

          stage:
            "VERIFIED",

          authoritative:
            false,
        },
        "2026-10-03T00:21:00.000Z",
        1
      );

    assert.equal(
      verified.type,
      "VERIFIED"
    );

    assert.equal(
      verified.severity,
      "SUCCESS"
    );
  }
);

test(
  "index evidence maps to indexed activity",
  () => {
    const event =
      activityFromBlockchainIndex(
        {
          requestId:
            "request-3",

          txHash:
            "0xindexed",

          chainRef:
            "polygon",

          blockRef:
            "block-2",

          indexRef:
            "index-1",

          indexedAt:
            "2026-10-03T00:22:00.000Z",

          stage:
            "INDEXED",

          authoritative:
            false,
        },
        1
      );

    assert.equal(
      event.type,
      "INDEXED"
    );
  }
);
