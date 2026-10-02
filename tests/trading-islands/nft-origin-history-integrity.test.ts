import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftOriginHistory,
} from "../../src/trading/nft/origin/historyValidation";

import {
  nftOriginHistoryFixture,
} from "../../src/trading/nft/origin/historyFixtures";

test(
  "origin history detects broken sequence",
  () => {
    const entries =
      nftOriginHistoryFixture
        .entries.map(
          (entry, index) =>
            index === 1
              ? {
                  ...entry,
                  version:
                    99,
                }
              : entry
        );

    const result =
      validateNftOriginHistory({
        ...nftOriginHistoryFixture,
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
          "INVALID_HISTORY_SEQUENCE"
      )
    );
  }
);

test(
  "origin history detects broken previous link",
  () => {
    const entries =
      nftOriginHistoryFixture
        .entries.map(
          (entry, index) =>
            index === 2
              ? {
                  ...entry,
                  previousEntryId:
                    "tampered-link",
                }
              : entry
        );

    const result =
      validateNftOriginHistory({
        ...nftOriginHistoryFixture,
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
          "INVALID_HISTORY_LINK"
      )
    );
  }
);

test(
  "origin history detects malformed record hash",
  () => {
    const entries =
      nftOriginHistoryFixture
        .entries.map(
          (entry, index) =>
            index === 1
              ? {
                  ...entry,

                  snapshot: {
                    ...entry.snapshot,

                    recordHash:
                      "tampered",
                  },
                }
              : entry
        );

    const result =
      validateNftOriginHistory({
        ...nftOriginHistoryFixture,
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
