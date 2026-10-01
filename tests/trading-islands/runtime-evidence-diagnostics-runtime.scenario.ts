import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidencePersistence,
  getRuntimeEvidenceLifecycle,
  markRuntimeEvidenceStale,
  reconcileStaleRuntimeEvidence,
  resetRuntimeEvidenceHistoryForTests,
  subscribeRuntimeEvidenceHistory,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import type {
  RuntimeEvidencePersistence,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

test(
  "lifecycle-only stale change notifies subscribers",
  () => {
    resetRuntimeEvidenceHistoryForTests();

    let notifications =
      0;

    const unsubscribe =
      subscribeRuntimeEvidenceHistory(
        () => {
          notifications +=
            1;
        }
      );

    const before =
      notifications;

    markRuntimeEvidenceStale();

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "stale"
    );

    assert.ok(
      notifications >
        before
    );

    unsubscribe();

    resetRuntimeEvidenceHistoryForTests();
  }
);

test(
  "reconciliation transitions stale through reconciling to ready",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const observed:
      string[] =
      [];

    let resolveSave:
      (() => void) |
      null =
      null;

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
        await new Promise<void>(
          resolve => {
            resolveSave =
              resolve;
          }
        );
      },

      async clear() {},
    };

    configureRuntimeEvidencePersistence(
      adapter
    );

    const unsubscribe =
      subscribeRuntimeEvidenceHistory(
        () => {
          observed.push(
            getRuntimeEvidenceLifecycle()
              .status
          );
        }
      );

    markRuntimeEvidenceStale();

    const promise =
      reconcileStaleRuntimeEvidence();

    for (
      let attempt =
        0;
      attempt <
        50 &&
      !resolveSave;
      attempt +=
        1
    ) {
      await new Promise<void>(
        resolve => {
          setImmediate(
            resolve
          );
        }
      );
    }

    assert.ok(
      observed.includes(
        "reconciling"
      )
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "reconciling"
    );

    assert.ok(
      resolveSave,
      "reconciliation never reached persistence save"
    );

    resolveSave();

    const result =
      await promise;

    assert.equal(
      result.status,
      "merged"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "ready"
    );

    assert.ok(
      observed.includes(
        "ready"
      )
    );

    unsubscribe();

    resetRuntimeEvidenceHistoryForTests();
  }
);

test(
  "runtime evidence lifecycle remains non authoritative",
  () => {
    resetRuntimeEvidenceHistoryForTests();

    markRuntimeEvidenceStale();

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);
