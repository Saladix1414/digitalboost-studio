import assert from "node:assert/strict";
import test from "node:test";

import {
  appendRuntimeEvidenceReconciliationAttempt,
  createRuntimeEvidenceReconciliationAttemptHistory,
  RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import {
  configureRuntimeEvidencePersistence,
  markRuntimeEvidenceStale,
  reconcileStaleRuntimeEvidence,
  resetRuntimeEvidenceHistoryForTests,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import {
  getRuntimeEvidenceReconciliationHistory,
  resetRuntimeEvidenceReconciliationHistoryForTests,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryStore.ts";

import type {
  RuntimeEvidencePersistence,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";


test(
  "history assigns monotonic sequence and remains bounded",
  () => {
    let history =
      createRuntimeEvidenceReconciliationAttemptHistory();

    for (
      let index =
        0;
      index <
        RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT +
        5;
      index +=
        1
    ) {
      history =
        appendRuntimeEvidenceReconciliationAttempt(
          history,
          {
            status:
              "merged",
          }
        );
    }

    assert.equal(
      history.entries.length,
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
    );

    assert.equal(
      history.entries.at(
        -1
      )?.sequence,
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT +
        5
    );

    assert.equal(
      history.authoritative,
      false
    );
  }
);


test(
  "successful controlled reconciliation records merged outcome",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const adapter:
      RuntimeEvidencePersistence = {
      async load() {
        return {
          snapshot:
            null,

          authoritative:
            false,
        };
      },

      async save() {},

      async clear() {},
    };

    configureRuntimeEvidencePersistence(
      adapter
    );

    markRuntimeEvidenceStale();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "merged"
    );

    const history =
      getRuntimeEvidenceReconciliationHistory();

    assert.equal(
      history.entries.length,
      1
    );

    assert.equal(
      history.entries[0]?.status,
      "merged"
    );

    assert.equal(
      history.entries[0]?.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "reconciliation error records observational error outcome",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const adapter:
      RuntimeEvidencePersistence = {
      async load() {
        return {
          snapshot:
            null,

          authoritative:
            false,
        };
      },

      async save() {
        throw new Error(
          "simulated reconciliation failure"
        );
      },

      async clear() {},
    };

    configureRuntimeEvidencePersistence(
      adapter
    );

    markRuntimeEvidenceStale();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "error"
    );

    const entry =
      getRuntimeEvidenceReconciliationHistory()
        .entries.at(
          -1
        );

    assert.equal(
      entry?.status,
      "error"
    );

    assert.match(
      entry?.error ??
        "",
      /simulated reconciliation failure/
    );

    assert.equal(
      entry?.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "not stale invocation is recorded without changing authority",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "not-stale"
    );

    const entry =
      getRuntimeEvidenceReconciliationHistory()
        .entries.at(
          -1
        );

    assert.equal(
      entry?.status,
      "not-stale"
    );

    assert.equal(
      entry?.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
