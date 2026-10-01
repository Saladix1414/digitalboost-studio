import assert from "node:assert/strict";
import test from "node:test";

import {
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import {
  createLocalRuntimeEvidenceReconciliationHistoryPersistence,
} from "../../src/trading/runtime/localRuntimeEvidenceReconciliationHistoryPersistence.ts";

import {
  configureRuntimeEvidenceReconciliationHistoryCoordinator,
  configureRuntimeEvidenceReconciliationHistoryPersistence,
  getRuntimeEvidenceReconciliationHistory,
  hasRuntimeEvidenceReconciliationHistoryExternalChange,
  hydrateRuntimeEvidenceReconciliationHistory,
  markRuntimeEvidenceReconciliationHistoryExternalChange,
  recordRuntimeEvidenceReconciliationAttempt,
  resetRuntimeEvidenceReconciliationHistoryForTests,
  waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryStore.ts";

import type {
  RuntimeEvidenceReconciliationHistoryCoordinator,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryCoordination.ts";


function createStorage() {
  const values =
    new Map<
      string,
      string
    >();

  return {
    storage: {
      getItem(
        key:
          string
      ) {
        return values.get(
          key
        ) ??
        null;
      },

      setItem(
        key:
          string,

        value:
          string
      ) {
        values.set(
          key,
          value
        );
      },

      removeItem(
        key:
          string
      ) {
        values.delete(
          key
        );
      },
    },
  };
}


function createCoordinator():
  RuntimeEvidenceReconciliationHistoryCoordinator {
  let active =
    false;

  return {
    crossContextSafe:
      true,

    authoritative:
      false,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      assert.equal(
        active,
        false,
        "coordinated persistence overlapped"
      );

      active =
        true;

      try {
        return await operation();
      } finally {
        active =
          false;
      }
    },
  };
}


test(
  "record uses coordinated load merge save",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const backing =
      createStorage();

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      createLocalRuntimeEvidenceReconciliationHistoryPersistence(
        backing.storage
      )
    );

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      createCoordinator()
    );

    await hydrateRuntimeEvidenceReconciliationHistory();

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "merged",
    });

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

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
  "external change detection does not fabricate history entries",
  () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const before =
      getRuntimeEvidenceReconciliationHistory();

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    const after =
      getRuntimeEvidenceReconciliationHistory();

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      true
    );

    assert.deepEqual(
      after,
      before
    );

    assert.equal(
      after.entries.length,
      0
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "hydration establishes a clean persistence baseline",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const backing =
      createStorage();

    const adapter =
      createLocalRuntimeEvidenceReconciliationHistoryPersistence(
        backing.storage
      );

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      adapter
    );

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      createCoordinator()
    );

    markRuntimeEvidenceReconciliationHistoryExternalChange();

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      true
    );

    await hydrateRuntimeEvidenceReconciliationHistory();

    assert.equal(
      hasRuntimeEvidenceReconciliationHistoryExternalChange(),
      false
    );

    assert.deepEqual(
      getRuntimeEvidenceReconciliationHistory(),
      createRuntimeEvidenceReconciliationAttemptHistory()
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "persistence remains non authoritative",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const backing =
      createStorage();

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      createLocalRuntimeEvidenceReconciliationHistoryPersistence(
        backing.storage
      )
    );

    const coordinator =
      createCoordinator();

    configureRuntimeEvidenceReconciliationHistoryCoordinator(
      coordinator
    );

    assert.equal(
      coordinator.authoritative,
      false
    );

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "error",

      error:
        "observational",
    });

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    const entry =
      getRuntimeEvidenceReconciliationHistory()
        .entries.at(
          -1
        );

    assert.equal(
      entry?.authoritative,
      false
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
