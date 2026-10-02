import assert from "node:assert/strict";
import test from "node:test";

import {
  RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT,
  appendRuntimeEvidenceReconciliationAttempt,
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import {
  mergeRuntimeEvidenceReconciliationHistories,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryMerge.ts";


function buildFullHistory() {
  let history =
    createRuntimeEvidenceReconciliationAttemptHistory();

  for (
    let i = 0;
    i <
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT;
    i += 1
  ) {
    history =
      appendRuntimeEvidenceReconciliationAttempt(
        history,
        {
          status:
            i % 2 === 0
              ? "merged"
              : "error",

          error:
            i % 2 === 0
              ? undefined
              : `base-${i}`,
        }
      );
  }

  return history;
}


test(
  "one-entry rollover from same base merges successfully",
  () => {
    const base =
      buildFullHistory();

    const local =
      appendRuntimeEvidenceReconciliationAttempt(
        base,
        {
          status:
            "conflict",

          conflictSessionId:
            "local-rollover",
        }
      );

    const remote =
      appendRuntimeEvidenceReconciliationAttempt(
        base,
        {
          status:
            "unavailable",
        }
      );

    assert.equal(
      base.entries[0]?.sequence,
      1
    );

    assert.equal(
      local.entries[0]?.sequence,
      2
    );

    assert.equal(
      remote.entries[0]?.sequence,
      2
    );

    const result =
      mergeRuntimeEvidenceReconciliationHistories(
        base,
        local,
        remote
      );

    assert.equal(
      result.status,
      "merged"
    );

    if (
      result.status !==
      "merged"
    ) {
      return;
    }

    assert.equal(
      result.history.entries.length,
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
    );

    const statuses =
      result.history.entries
        .slice(-2)
        .map(
          entry =>
            entry.status
        );

    assert.deepEqual(
      statuses,
      [
        "unavailable",
        "conflict",
      ]
    );

    assert.equal(
      result.history.authoritative,
      false
    );
  }
);


test(
  "rollover output maintains strictly increasing sequences",
  () => {
    const base =
      buildFullHistory();

    const local =
      appendRuntimeEvidenceReconciliationAttempt(
        base,
        {
          status:
            "conflict",

          conflictSessionId:
            "local",
        }
      );

    const remote =
      appendRuntimeEvidenceReconciliationAttempt(
        base,
        {
          status:
            "unavailable",
        }
      );

    const result =
      mergeRuntimeEvidenceReconciliationHistories(
        base,
        local,
        remote
      );

    assert.equal(
      result.status,
      "merged"
    );

    if (
      result.status !==
      "merged"
    ) {
      return;
    }

    const sequences =
      result.history.entries.map(
        entry =>
          entry.sequence
      );

    for (
      let i = 1;
      i <
        sequences.length;
      i += 1
    ) {
      assert.ok(
        sequences[i] >
          sequences[i - 1]
      );
    }

    assert.equal(
      new Set(
        sequences
      ).size,
      sequences.length
    );
  }
);


test(
  "true divergence inside retained overlap still conflicts",
  () => {
    const base =
      buildFullHistory();

    const local =
      appendRuntimeEvidenceReconciliationAttempt(
        base,
        {
          status:
            "merged",
        }
      );

    const remoteEntries = [
      ...local.entries,
    ];

    const target =
      remoteEntries.findIndex(
        entry =>
          entry.sequence ===
          12
      );

    assert.ok(
      target >=
        0
    );

    remoteEntries[target] = {
      ...remoteEntries[target],

      status:
        "error",

      error:
        "tampered-overlap",

      authoritative:
        false,
    };

    const remote = {
      entries:
        remoteEntries,

      authoritative:
        false as const,
    };

    const result =
      mergeRuntimeEvidenceReconciliationHistories(
        base,
        local,
        remote
      );

    assert.deepEqual(
      result,
      {
        status:
          "conflict",

        reason:
          "base-diverged",

        authoritative:
          false,
      }
    );
  }
);


test(
  "no retained overlap remains conservative and conflicts",
  () => {
    const base =
      buildFullHistory();

    let advanced =
      base;

    for (
      let i = 0;
      i <
        RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT;
      i += 1
    ) {
      advanced =
        appendRuntimeEvidenceReconciliationAttempt(
          advanced,
          {
            status:
              "merged",
          }
        );
    }

    assert.ok(
      (
        advanced.entries[0]?.sequence ??
        0
      ) >
        (
          base.entries.at(-1)?.sequence ??
          0
        )
    );

    const result =
      mergeRuntimeEvidenceReconciliationHistories(
        base,
        advanced,
        base
      );

    assert.equal(
      result.status,
      "conflict"
    );

    if (
      result.status ===
      "conflict"
    ) {
      assert.equal(
        result.reason,
        "base-diverged"
      );
    }
  }
);


test(
  "multi-entry rollover preserves concurrent suffixes",
  () => {
    const base =
      buildFullHistory();

    let local =
      base;

    local =
      appendRuntimeEvidenceReconciliationAttempt(
        local,
        {
          status:
            "error",

          error:
            "local-1",
        }
      );

    local =
      appendRuntimeEvidenceReconciliationAttempt(
        local,
        {
          status:
            "conflict",

          conflictSessionId:
            "local-2",
        }
      );

    let remote =
      base;

    remote =
      appendRuntimeEvidenceReconciliationAttempt(
        remote,
        {
          status:
            "unavailable",
        }
      );

    remote =
      appendRuntimeEvidenceReconciliationAttempt(
        remote,
        {
          status:
            "not-stale",
        }
      );

    const result =
      mergeRuntimeEvidenceReconciliationHistories(
        base,
        local,
        remote
      );

    assert.equal(
      result.status,
      "merged"
    );

    if (
      result.status !==
      "merged"
    ) {
      return;
    }

    assert.equal(
      result.history.entries.length,
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
    );

    assert.deepEqual(
      result.history.entries
        .slice(-4)
        .map(
          entry =>
            entry.status
        ),
      [
        "unavailable",
        "not-stale",
        "error",
        "conflict",
      ]
    );
  }
);
