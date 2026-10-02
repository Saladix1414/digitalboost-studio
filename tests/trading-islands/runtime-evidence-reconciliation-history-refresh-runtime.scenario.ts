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
    ):
      Promise<T> {
      return operation();
    },
  };
}


test(
  "refresh merges external suffix and clears stale flag",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let persisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    const adapter:
      RuntimeEvidenceReconciliationHistoryPersistence = {
      async load() {
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
            "merged",
        }
      );

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    const result =
      await refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

    assert.equal(
      result.status,
      "merged"
    );

    assert.equal(
      getRuntimeEvidenceReconciliationHistory()
        .entries.length,
      1
    );

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      false
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "refresh preserves local suffix while merging remote suffix",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let persisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    const adapter:
      RuntimeEvidenceReconciliationHistoryPersistence = {
      async load() {
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

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "error",

      error:
        "local",
    });

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    const known =
      persisted;

    persisted =
      appendRuntimeEvidenceReconciliationAttempt(
        known,
        {
          status:
            "conflict",

          conflictSessionId:
            "remote",
        }
      );

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "merged",
    });

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    const result =
      await refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

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
        "merged"
      )
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "refresh conflict preserves exact in-memory history",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let persisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    const adapter:
      RuntimeEvidenceReconciliationHistoryPersistence = {
      async load() {
        return {
          snapshot:
            createRuntimeEvidenceReconciliationHistorySnapshot(
              persisted
            ),

          authoritative:
            false,
        };
      },

      async save() {},

      async clear() {},
    };

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      adapter
    );

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      coordinator()
    );

    await hydrateRuntimeEvidenceReconciliationHistory();

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "merged",
    });

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    const memoryBefore =
      getRuntimeEvidenceReconciliationHistory();

    let diverged =
      createRuntimeEvidenceReconciliationAttemptHistory();

    diverged =
      appendRuntimeEvidenceReconciliationAttempt(
        diverged,
        {
          status:
            "error",

          error:
            "diverged",
        }
      );

    persisted =
      diverged;

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    const result =
      await refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

    assert.equal(
      result.status,
      "conflict"
    );

    assert.equal(
      getRuntimeEvidenceReconciliationHistory(),
      memoryBefore
    );

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      true
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "refresh load failure preserves memory and external-change state",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    configureRuntimeEvidenceReconciliationHistoryPersistence({
      async load() {
        throw new Error(
          "simulated refresh failure"
        );
      },

      async save() {},

      async clear() {},
    });

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      coordinator()
    );

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "merged",
    });

    const memoryBefore =
      getRuntimeEvidenceReconciliationHistory();

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    const result =
      await refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

    assert.equal(
      result.status,
      "error"
    );

    assert.match(
      result.status ===
        "error"
        ? result.error
        : "",
      /simulated refresh failure/
    );

    assert.equal(
      getRuntimeEvidenceReconciliationHistory(),
      memoryBefore
    );

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      true
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "refresh is a no-op when no external change is pending",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const result =
      await refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

    assert.equal(
      result.status,
      "not-needed"
    );

    assert.equal(
      result.authoritative,
      false
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
