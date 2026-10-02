import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftDnaConsistency,
} from "../../src/trading/nft/dna/consistency";

import {
  validateNftDnaClosure,
} from "../../src/trading/nft/dna/closure";

import {
  nftDnaLineageFixture,
  nftDnaLineageRecordsFixture,
} from "../../src/trading/nft/dna/lineageFixtures";

test(
  "current DNA and latest lineage snapshot are consistent",
  () => {
    const result =
      validateNftDnaConsistency(
        nftDnaLineageRecordsFixture
          .proofAttached,
        nftDnaLineageFixture
      );

    assert.equal(
      result.consistent,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );
  }
);

test(
  "DNA closure passes for valid DNA plus lineage",
  () => {
    const result =
      validateNftDnaClosure(
        nftDnaLineageRecordsFixture
          .proofAttached,
        nftDnaLineageFixture
      );

    assert.equal(
      result.valid,
      true
    );

    assert.equal(
      result.dnaValid,
      true
    );

    assert.equal(
      result.lineageValid,
      true
    );

    assert.equal(
      result.consistencyValid,
      true
    );

    assert.equal(
      result.issueCount,
      0
    );
  }
);

test(
  "tampered DNA identity is rejected against lineage",
  () => {
    const dna = {
      ...nftDnaLineageRecordsFixture
        .proofAttached,

      identity: {
        ...nftDnaLineageRecordsFixture
          .proofAttached
          .identity,

        creator:
          "tampered-creator",
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
          "IDENTITY_HASH_MISMATCH"
      )
    );
  }
);

test(
  "tampered integrity is rejected against lineage",
  () => {
    const dna = {
      ...nftDnaLineageRecordsFixture
        .proofAttached,

      integrity: {
        ...nftDnaLineageRecordsFixture
          .proofAttached
          .integrity,

        metadataHash:
          "dna-ffffffff",
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
          "INTEGRITY_HASH_MISMATCH"
      )
    );
  }
);

test(
  "tampered blockchain proof is rejected against lineage",
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
        owner:
          "unexpected-owner",
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
          "BLOCKCHAIN_PROOF_HASH_MISMATCH"
      )
    );
  }
);

test(
  "metadata proof must match DNA asset identity",
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
        metadataRef:
          "metadata://different-asset",
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
          "PROOF_METADATA_MISMATCH"
      )
    );
  }
);
