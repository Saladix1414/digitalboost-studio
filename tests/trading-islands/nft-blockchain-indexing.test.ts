import assert from "node:assert/strict";
import test from "node:test";

import {
  indexVerifiedBlockchainEvidence,
} from "../../src/trading/nft/blockchain/indexing";

test(
  "verified evidence can be indexed",
  () => {
    const indexed =
      indexVerifiedBlockchainEvidence(
        {
          requestId:
            "request-001",

          txHash:
            "0xfixture001",

          chainRef:
            "chain:polygon",

          blockRef:
            "block:polygon:001",

          checks:
            [],

          verified:
            true,

          stage:
            "VERIFIED",

          authoritative:
            false,
        },
        "2026-10-14T10:21:00.000Z"
      );

    assert.equal(
      indexed.stage,
      "INDEXED"
    );

    assert.equal(
      indexed.indexRef,
      "index:chain:polygon:0xfixture001"
    );

    assert.equal(
      indexed.authoritative,
      false
    );
  }
);

test(
  "unverified evidence cannot be indexed",
  () => {
    assert.throws(
      () =>
        indexVerifiedBlockchainEvidence(
          {
            requestId:
              "request-001",

            txHash:
              "0xfixture001",

            chainRef:
              "chain:polygon",

            blockRef:
              "block:polygon:001",

            checks:
              [],

            verified:
              false,

            stage:
              "VERIFIED",

            authoritative:
              false,
          },
          "2026-10-14T10:21:00.000Z"
        ),

      /BLOCKCHAIN_GATEWAY_VERIFICATION_REQUIRED/
    );
  }
);
