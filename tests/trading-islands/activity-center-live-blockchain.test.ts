import assert from "node:assert/strict";
import test from "node:test";

import {
  projectBlockchainIndexActivity,
  projectBlockchainSubmissionActivity,
  projectBlockchainVerificationActivity,
} from "../../src/trading/activity/liveProjection";

import {
  getTradingActivityStore,
  resetTradingActivityStoreForTests,
} from "../../src/trading/activity/sharedActivityStore";

test(
  "blockchain evidence projects sequentially into shared activity",
  () => {
    resetTradingActivityStoreForTests();

    projectBlockchainSubmissionActivity({
      requestId:
        "live-request",

      txHash:
        "0xlive",

      chainRef:
        "polygon",

      submittedAt:
        "2026-10-03T03:20:00.000Z",

      source:
        "FIXTURE",

      stage:
        "SUBMITTED",

      authoritative:
        false,
    });

    projectBlockchainVerificationActivity(
      {
        requestId:
          "live-request",

        txHash:
          "0xlive",

        chainRef:
          "polygon",

        blockRef:
          "block-live",

        checks:
          [],

        verified:
          true,

        stage:
          "VERIFIED",

        authoritative:
          false,
      },
      "2026-10-03T03:21:00.000Z"
    );

    projectBlockchainIndexActivity({
      requestId:
        "live-request",

      txHash:
        "0xlive",

      chainRef:
        "polygon",

      blockRef:
        "block-live",

      indexRef:
        "index-live",

      indexedAt:
        "2026-10-03T03:22:00.000Z",

      stage:
        "INDEXED",

      authoritative:
        false,
    });

    const events =
      getTradingActivityStore()
        .events;

    assert.deepEqual(
      events.map(
        event =>
          event.type
      ),
      [
        "SUBMITTED",
        "VERIFIED",
        "INDEXED",
      ]
    );

    assert.deepEqual(
      events.map(
        event =>
          event.sequence
      ),
      [
        1,
        2,
        3,
      ]
    );
  }
);
