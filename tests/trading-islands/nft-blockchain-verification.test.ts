import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyFixtureBlockchainSubmission,
} from "../../src/trading/nft/blockchain/verification";

test(
  "matching fixture submission verifies deterministically",
  () => {
    const result =
      verifyFixtureBlockchainSubmission(
        {
          requestId:
            "request-001",

          txHash:
            "0xfixture001",

          chainRef:
            "chain:polygon",

          submittedAt:
            "2026-10-14T10:20:00.000Z",

          source:
            "FIXTURE",

          stage:
            "SUBMITTED",

          authoritative:
            false,
        },
        {
          requestId:
            "request-001",

          chainRef:
            "chain:polygon",

          blockRef:
            "block:polygon:001",
        }
      );

    assert.equal(
      result.verified,
      true
    );

    assert.equal(
      result.checks.every(
        (check) =>
          check.passed
      ),
      true
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "request mismatch fails verification",
  () => {
    const result =
      verifyFixtureBlockchainSubmission(
        {
          requestId:
            "request-001",

          txHash:
            "0xfixture001",

          chainRef:
            "chain:polygon",

          submittedAt:
            "2026-10-14T10:20:00.000Z",

          source:
            "FIXTURE",

          stage:
            "SUBMITTED",

          authoritative:
            false,
        },
        {
          requestId:
            "request-999",

          chainRef:
            "chain:polygon",

          blockRef:
            "block:polygon:001",
        }
      );

    assert.equal(
      result.verified,
      false
    );
  }
);
