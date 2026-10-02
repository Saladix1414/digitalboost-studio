import assert from "node:assert/strict";
import test from "node:test";

import {
  appendNftProvenanceHistory,
  createInitialNftProvenanceHistory,
} from "../../src/trading/nft/provenance/history";

import {
  validateNftProvenanceHistory,
} from "../../src/trading/nft/provenance/historyValidation";

import {
  nftProvenanceHistoryFixture,
  nftProvenanceHistoryRecordsFixture,
} from "../../src/trading/nft/provenance/historyFixtures";

test(
  "provenance history validates",
  () => {
    const result =
      validateNftProvenanceHistory(
        nftProvenanceHistoryFixture
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
  "provenance history is sequential and linked",
  () => {
    const entries =
      nftProvenanceHistoryFixture.entries;

    assert.equal(
      entries.length,
      4
    );

    entries.forEach(
      (
        entry,
        index
      ) => {
        assert.equal(
          entry.version,
          index + 1
        );

        assert.equal(
          entry.previousEntryId,
          index === 0
            ? null
            : entries[
                index - 1
              ].id
        );
      }
    );
  }
);

test(
  "history captures expected revision reasons",
  () => {
    const reasons =
      nftProvenanceHistoryFixture.entries.map(
        (entry) =>
          entry.reason
      );

    assert.deepEqual(
      reasons,
      [
        "INITIAL_ASSEMBLY",
        "EVIDENCE_ADDED",
        "LINK_ADDED",
        "ARCHIVED",
      ]
    );
  }
);

test(
  "history rejects no-op revision",
  () => {
    const record =
      nftProvenanceHistoryRecordsFixture.initial;

    const history =
      createInitialNftProvenanceHistory(
        record,
        "2026-10-12T12:05:00.000Z"
      );

    assert.throws(
      () =>
        appendNftProvenanceHistory(
          history,
          record,
          record,
          "2026-10-12T12:06:00.000Z"
        ),
      /PROVENANCE_HISTORY_NO_CHANGE/
    );
  }
);
