import assert from "node:assert/strict";
import test from "node:test";

import {
  appendRuntimeEvidenceReconciliationAttempt,
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import {
  mergeRuntimeEvidenceReconciliationHistories,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryMerge.ts";

import {
  createLocalRuntimeEvidenceReconciliationHistoryCoordinator,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryCoordination.ts";


function append(
  history:
    ReturnType<
      typeof createRuntimeEvidenceReconciliationAttemptHistory
    >,

  status:
    "merged" |
    "conflict" |
    "error"
) {
  return appendRuntimeEvidenceReconciliationAttempt(
    history,
    {
      status,
    }
  );
}


test(
  "local coordinator remains explicitly non cross-context safe",
  async () => {
    const coordinator =
      createLocalRuntimeEvidenceReconciliationHistoryCoordinator();

    assert.equal(
      coordinator.crossContextSafe,
      false
    );

    assert.equal(
      coordinator.authoritative,
      false
    );

    const result =
      await coordinator.runExclusive(
        async () =>
          "ok"
      );

    assert.equal(
      result,
      "ok"
    );
  }
);


test(
  "three way merge preserves concurrent append suffixes",
  () => {
    let base =
      createRuntimeEvidenceReconciliationAttemptHistory();

    base =
      append(
        base,
        "merged"
      );

    const remote =
      append(
        base,
        "conflict"
      );

    const local =
      append(
        base,
        "error"
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
      3
    );

    assert.deepEqual(
      result.history.entries.map(
        entry =>
          entry.status
      ),
      [
        "merged",
        "conflict",
        "error",
      ]
    );

    assert.deepEqual(
      result.history.entries.map(
        entry =>
          entry.sequence
      ),
      [
        1,
        2,
        3,
      ]
    );

    assert.equal(
      result.history.authoritative,
      false
    );
  }
);


test(
  "merge rejects histories that diverged before the known base",
  () => {
    let base =
      createRuntimeEvidenceReconciliationAttemptHistory();

    base =
      append(
        base,
        "merged"
      );

    let unrelated =
      createRuntimeEvidenceReconciliationAttemptHistory();

    unrelated =
      append(
        unrelated,
        "error"
      );

    const result =
      mergeRuntimeEvidenceReconciliationHistories(
        base,
        unrelated,
        base
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
