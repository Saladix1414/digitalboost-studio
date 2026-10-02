import assert from "node:assert/strict";
import test from "node:test";

import {
  appendNftDnaLineage,
  createInitialNftDnaLineage,
} from "../../src/trading/nft/dna/lineage";

import {
  validateNftDnaLineage,
} from "../../src/trading/nft/dna/lineageValidation";

import {
  nftDnaLineageFixture,
  nftDnaLineageRecordsFixture,
} from "../../src/trading/nft/dna/lineageFixtures";

test(
  "DNA lineage starts at version one",
  () => {
    const first =
      nftDnaLineageFixture
        .entries[0];

    assert.ok(first);

    assert.equal(
      first.version,
      1
    );

    assert.equal(
      first.previousEntryId,
      null
    );

    assert.equal(
      first.reason,
      "INITIAL"
    );
  }
);

test(
  "DNA lineage versions are sequential and linked",
  () => {
    const entries =
      nftDnaLineageFixture.entries;

    assert.equal(
      entries.length,
      3
    );

    entries.forEach(
      (entry, index) => {
        assert.equal(
          entry.version,
          index + 1
        );

        if (index > 0) {
          assert.equal(
            entry.previousEntryId,
            entries[index - 1]
              ?.id
          );
        }
      }
    );
  }
);

test(
  "DNA lineage detects integrity update reason",
  () => {
    const second =
      nftDnaLineageFixture
        .entries[1];

    assert.ok(second);

    assert.equal(
      second.reason,
      "IDENTITY_UPDATE"
    );
  }
);

test(
  "DNA lineage detects blockchain proof attachment",
  () => {
    const third =
      nftDnaLineageFixture
        .entries[2];

    assert.ok(third);

    assert.equal(
      third.reason,
      "BLOCKCHAIN_PROOF_ATTACHED"
    );

    assert.notEqual(
      third.blockchainProofHash,
      null
    );
  }
);

test(
  "DNA lineage fixture validates successfully",
  () => {
    const result =
      validateNftDnaLineage(
        nftDnaLineageFixture
      );

    assert.equal(
      result.valid,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );
  }
);

test(
  "lineage rejects append when no DNA change exists",
  () => {
    const {
      base,
    } =
      nftDnaLineageRecordsFixture;

    const lineage =
      createInitialNftDnaLineage(
        base,
        "2026-10-05T13:00:00.000Z"
      );

    assert.throws(
      () =>
        appendNftDnaLineage(
          lineage,
          base,
          base,
          "2026-10-05T13:01:00.000Z"
        ),
      /DNA_LINEAGE_NO_CHANGE/
    );
  }
);

test(
  "lineage remains non-authoritative",
  () => {
    assert.equal(
      nftDnaLineageFixture
        .authoritative,
      false
    );

    for (
      const entry of
      nftDnaLineageFixture
        .entries
    ) {
      assert.equal(
        entry.authoritative,
        false
      );
    }
  }
);
