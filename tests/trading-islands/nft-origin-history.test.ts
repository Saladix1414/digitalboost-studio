import assert from "node:assert/strict";
import test from "node:test";

import {
  appendNftOriginHistory,
  createInitialNftOriginHistory,
} from "../../src/trading/nft/origin/history";

import {
  reviseNftOrigin,
} from "../../src/trading/nft/origin/revision";

import {
  validateNftOriginHistory,
} from "../../src/trading/nft/origin/historyValidation";

import {
  nftOriginHistoryFixture,
  nftOriginHistoryRecordsFixture,
} from "../../src/trading/nft/origin/historyFixtures";

test(
  "origin history begins with initial capture",
  () => {
    const first =
      nftOriginHistoryFixture
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
      "INITIAL_CAPTURE"
    );
  }
);

test(
  "origin history remains sequential and linked",
  () => {
    const entries =
      nftOriginHistoryFixture.entries;

    assert.equal(
      entries.length,
      4
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
  "origin history detects context update",
  () => {
    const second =
      nftOriginHistoryFixture
        .entries[1];

    assert.ok(second);

    assert.equal(
      second.reason,
      "CONTEXT_UPDATE"
    );
  }
);

test(
  "origin history detects source update",
  () => {
    const third =
      nftOriginHistoryFixture
        .entries[2];

    assert.ok(third);

    assert.equal(
      third.reason,
      "SOURCE_UPDATE"
    );
  }
);

test(
  "origin history detects archive",
  () => {
    const fourth =
      nftOriginHistoryFixture
        .entries[3];

    assert.ok(fourth);

    assert.equal(
      fourth.reason,
      "ARCHIVED"
    );
  }
);

test(
  "origin history fixture validates",
  () => {
    const result =
      validateNftOriginHistory(
        nftOriginHistoryFixture
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
  "origin history rejects append when record has no changes",
  () => {
    const {
      initial,
    } =
      nftOriginHistoryRecordsFixture;

    const history =
      createInitialNftOriginHistory(
        initial
      );

    assert.throws(
      () =>
        appendNftOriginHistory(
          history,
          initial,
          initial
        ),
      /ORIGIN_HISTORY_NO_CHANGE/
    );
  }
);

test(
  "archived origin cannot be revised",
  () => {
    const {
      archived,
    } =
      nftOriginHistoryRecordsFixture;

    assert.throws(
      () =>
        reviseNftOrigin(
          archived,
          {
            forgeConfig:
              "forge:should-not-change",

            capturedAt:
              "2026-10-07T13:00:00.000Z",
          }
        ),
      /ORIGIN_ARCHIVED/
    );
  }
);

test(
  "origin history remains non-authoritative",
  () => {
    assert.equal(
      nftOriginHistoryFixture
        .authoritative,
      false
    );

    for (
      const entry of
      nftOriginHistoryFixture.entries
    ) {
      assert.equal(
        entry.authoritative,
        false
      );

      assert.equal(
        entry.snapshot
          .authoritative,
        false
      );
    }
  }
);
