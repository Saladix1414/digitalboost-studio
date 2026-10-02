import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftProvenanceHistory,
} from "../../src/trading/nft/provenance/historyValidation";

import {
  nftProvenanceHistoryFixture,
} from "../../src/trading/nft/provenance/historyFixtures";

test(
  "broken previous-entry link is rejected",
  () => {
    const entries =
      nftProvenanceHistoryFixture.entries.map(
        (
          entry,
          index
        ) =>
          index === 2
            ? {
                ...entry,

                previousEntryId:
                  "tampered-history-entry",
              }
            : entry
      );

    const result =
      validateNftProvenanceHistory({
        ...nftProvenanceHistoryFixture,

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
          "BROKEN_PREVIOUS_ENTRY"
      )
    );
  }
);

test(
  "invalid history version is rejected",
  () => {
    const entries =
      nftProvenanceHistoryFixture.entries.map(
        (
          entry,
          index
        ) =>
          index === 1
            ? {
                ...entry,

                version:
                  99,
              }
            : entry
      );

    const result =
      validateNftProvenanceHistory({
        ...nftProvenanceHistoryFixture,

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
          "INVALID_HISTORY_VERSION"
      )
    );
  }
);

test(
  "missing record hash is rejected",
  () => {
    const entries =
      nftProvenanceHistoryFixture.entries.map(
        (
          entry,
          index
        ) =>
          index === 1
            ? {
                ...entry,

                snapshot: {
                  ...entry.snapshot,

                  recordHash:
                    "",
                },
              }
            : entry
      );

    const result =
      validateNftProvenanceHistory({
        ...nftProvenanceHistoryFixture,

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
          "INVALID_RECORD_HASH"
      )
    );
  }
);
