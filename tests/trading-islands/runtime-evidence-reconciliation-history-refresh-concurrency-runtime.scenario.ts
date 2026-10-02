import assert from "node:assert/strict";
import test from "node:test";

import {
  appendRuntimeEvidenceReconciliationAttempt,
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import {
  createRuntimeEvidenceReconciliationHistorySnapshot,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistence.ts";

import {
  configureRuntimeEvidenceReconciliationHistoryCoordinator,
  configureRuntimeEvidenceReconciliationHistoryPersistence,
  getRuntimeEvidenceReconciliationHistory,
  hasRuntimeEvidenceReconciliationHistoryExternalChange,
  hydrateRuntimeEvidenceReconciliationHistory,
  markRuntimeEvidenceReconciliationHistoryExternalChange,
  recordRuntimeEvidenceReconciliationAttempt,
  refreshRuntimeEvidenceReconciliationHistoryFromPersistence,
  resetRuntimeEvidenceReconciliationHistoryForTests,
  waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryStore.ts";

import type {
  RuntimeEvidenceReconciliationHistoryPersistence,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistence.ts";


function coordinator() {
  return {
    crossContextSafe:
      true,

    authoritative:
      false as const,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ): Promise<T> {
      return operation();
    },
  };
}


test(
  "local attempt created while refresh load is pending survives",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let persisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    let releaseLoad:
      (() => void) | null =
        null;

    let blockNextLoad =
      false;

    const adapter:
      RuntimeEvidenceReconciliationHistoryPersistence = {
      async load() {
        if (
          blockNextLoad
        ) {
          blockNextLoad =
            false;

          await new Promise<void>(
            resolve => {
              releaseLoad =
                resolve;
            }
          );
        }

        return {
          snapshot:
            createRuntimeEvidenceReconciliationHistorySnapshot(
              persisted
            ),

          authoritative:
            false,
        };
      },

      async save(
        snapshot
      ) {
        persisted =
          snapshot.history;
      },

      async clear() {},
    };

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      adapter
    );

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      coordinator()
    );

    await hydrateRuntimeEvidenceReconciliationHistory();

    persisted =
      appendRuntimeEvidenceReconciliationAttempt(
        persisted,
        {
          status:
            "conflict",

          conflictSessionId:
            "remote",
        }
      );

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    blockNextLoad =
      true;

    const refreshPromise =
      refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

    for (
      let i = 0;
      i < 100 &&
      !releaseLoad;
      i += 1
    ) {
      await new Promise<void>(
        resolve =>
          setImmediate(
            resolve
          )
      );
    }

    assert.ok(
      releaseLoad,
      "refresh load did not block"
    );

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "error",

      error:
        "local-during-refresh",
    });

    releaseLoad?.();

    const result =
      await refreshPromise;

    assert.equal(
      result.status,
      "merged"
    );

    const statuses =
      getRuntimeEvidenceReconciliationHistory()
        .entries.map(
          entry =>
            entry.status
        );

    assert.ok(
      statuses.includes(
        "conflict"
      )
    );

    assert.ok(
      statuses.includes(
        "error"
      )
    );

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      false
    );

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
