import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftDnaConsistency,
} from "../../src/trading/nft/dna/consistency";

import {
  nftDnaLineageFixture,
  nftDnaLineageRecordsFixture,
} from "../../src/trading/nft/dna/lineageFixtures";

test(
  "empty lineage is invalid",
  () => {
    const result =
      validateNftDnaConsistency(
        nftDnaLineageRecordsFixture
          .proofAttached,
        {
          dnaId:
            nftDnaLineageRecordsFixture
              .proofAttached
              .id,

          entries: [],

          authoritative:
            false,
        }
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "LINEAGE_EMPTY"
      )
    );
  }
);

test(
  "lineage for different DNA id is invalid",
  () => {
    const result =
      validateNftDnaConsistency(
        nftDnaLineageRecordsFixture
          .proofAttached,
        {
          ...nftDnaLineageFixture,

          dnaId:
            "different-dna-id",
        }
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "LINEAGE_DNA_ID_MISMATCH"
      )
    );
  }
);

test(
  "missing mint event in proof is invalid",
  () => {
    const proof =
      nftDnaLineageRecordsFixture
        .proofAttached
        .blockchainProof;

    assert.ok(proof);

    const dna = {
      ...nftDnaLineageRecordsFixture
        .proofAttached,

      blockchainProof: {
        ...proof!,
        mintEventFound:
          false,
      },
    };

    const result =
      validateNftDnaConsistency(
        dna,
        nftDnaLineageFixture
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "PROOF_EVENT_MISSING"
      )
    );
  }
);

test(
  "missing proof token is invalid",
  () => {
    const proof =
      nftDnaLineageRecordsFixture
        .proofAttached
        .blockchainProof;

    assert.ok(proof);

    const dna = {
      ...nftDnaLineageRecordsFixture
        .proofAttached,

      blockchainProof: {
        ...proof!,
        tokenId: "",
      },
    };

    const result =
      validateNftDnaConsistency(
        dna,
        nftDnaLineageFixture
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "PROOF_TOKEN_MISSING"
      )
    );
  }
);
