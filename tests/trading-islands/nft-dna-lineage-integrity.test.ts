import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftDnaLineage,
} from "../../src/trading/nft/dna/lineageValidation";

import {
  nftDnaLineageFixture,
} from "../../src/trading/nft/dna/lineageFixtures";

test(
  "lineage validation detects broken version sequence",
  () => {
    const entries =
      nftDnaLineageFixture
        .entries.map(
          (entry, index) =>
            index === 1
              ? {
                  ...entry,
                  version: 99,
                }
              : entry
        );

    const result =
      validateNftDnaLineage({
        ...nftDnaLineageFixture,
        entries,
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_LINEAGE_SEQUENCE"
      )
    );
  }
);

test(
  "lineage validation detects broken previous entry reference",
  () => {
    const entries =
      nftDnaLineageFixture
        .entries.map(
          (entry, index) =>
            index === 2
              ? {
                  ...entry,
                  previousEntryId:
                    "tampered-entry",
                }
              : entry
        );

    const result =
      validateNftDnaLineage({
        ...nftDnaLineageFixture,
        entries,
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_PREVIOUS_ENTRY"
      )
    );
  }
);

test(
  "lineage validation detects malformed snapshot hash",
  () => {
    const entries =
      nftDnaLineageFixture
        .entries.map(
          (entry, index) =>
            index === 1
              ? {
                  ...entry,
                  integrityHash:
                    "tampered",
                }
              : entry
        );

    const result =
      validateNftDnaLineage({
        ...nftDnaLineageFixture,
        entries,
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "INVALID_INTEGRITY_HASH"
      )
    );
  }
);
