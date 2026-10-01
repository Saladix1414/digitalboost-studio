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
  deserializeRuntimeEvidenceReconciliationHistorySnapshot,
  validateRuntimeEvidenceReconciliationHistorySnapshot,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistenceValidation.ts";

import {
  createLocalRuntimeEvidenceReconciliationHistoryPersistence,
} from "../../src/trading/runtime/localRuntimeEvidenceReconciliationHistoryPersistence.ts";

import {
  configureRuntimeEvidenceReconciliationHistoryPersistence,
  getRuntimeEvidenceReconciliationHistory,
  hydrateRuntimeEvidenceReconciliationHistory,
  recordRuntimeEvidenceReconciliationAttempt,
  resetRuntimeEvidenceReconciliationHistoryForTests,
  waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryStore.ts";


function createStorage() {
  const values =
    new Map<
      string,
      string
    >();

  return {
    values,

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


test(
  "valid reconciliation history round trips through persistence",
  async () => {
    const backing =
      createStorage();

    const adapter =
      createLocalRuntimeEvidenceReconciliationHistoryPersistence(
        backing.storage
      );

    let history =
      createRuntimeEvidenceReconciliationAttemptHistory();

    history =
      appendRuntimeEvidenceReconciliationAttempt(
        history,
        {
          status:
            "merged",

          duplicateSessionIds: [
            "session-1",
          ],
        }
      );

    await adapter.save(
      createRuntimeEvidenceReconciliationHistorySnapshot(
        history
      )
    );

    const loaded =
      await adapter.load();

    assert.deepEqual(
      loaded.snapshot?.history,
      history
    );

    assert.equal(
      loaded.authoritative,
      false
    );
  }
);


test(
  "malformed persisted history is rejected",
  () => {
    const malformed = {
      version:
        1,

      history: {
        entries: [
          {
            sequence:
              2,

            status:
              "merged",

            duplicateSessionIds:
              [],

            conflictSessionId:
              null,

            error:
              null,

            authoritative:
              false,
          },
          {
            sequence:
              1,

            status:
              "merged",

            duplicateSessionIds:
              [],

            conflictSessionId:
              null,

            error:
              null,

            authoritative:
              false,
          },
        ],

        authoritative:
          false,
      },

      authoritative:
        false,
    };

    assert.equal(
      validateRuntimeEvidenceReconciliationHistorySnapshot(
        malformed
      ),
      false
    );

    assert.throws(
      () =>
        deserializeRuntimeEvidenceReconciliationHistorySnapshot(
          JSON.stringify(
            malformed
          )
        )
    );
  }
);


test(
  "hydration restores history without fabricating entries",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    const backing =
      createStorage();

    const adapter =
      createLocalRuntimeEvidenceReconciliationHistoryPersistence(
        backing.storage
      );

    let persisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    persisted =
      appendRuntimeEvidenceReconciliationAttempt(
        persisted,
        {
          status:
            "conflict",

          conflictSessionId:
            "session-conflict",
        }
      );

    await adapter.save(
      createRuntimeEvidenceReconciliationHistorySnapshot(
        persisted
      )
    );

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      adapter
    );

    await hydrateRuntimeEvidenceReconciliationHistory();

    const hydrated =
      getRuntimeEvidenceReconciliationHistory();

    assert.deepEqual(
      hydrated,
      persisted
    );

    assert.equal(
      hydrated.entries.length,
      1
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "recorded history persists and sequence continues after reload",
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

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "merged",
    });

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    resetRuntimeEvidenceReconciliationHistoryForTests();

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      adapter
    );

    await hydrateRuntimeEvidenceReconciliationHistory();

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "error",

      error:
        "example",
    });

    assert.equal(
      getRuntimeEvidenceReconciliationHistory()
        .entries.at(
          -1
        )?.sequence,
      2
    );

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "persistence failure does not block in-memory history",
  async () => {
    resetRuntimeEvidenceReconciliationHistoryForTests();

    configureRuntimeEvidenceReconciliationHistoryPersistence({
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
          "simulated durability failure"
        );
      },

      async clear() {},
    });

    const history =
      recordRuntimeEvidenceReconciliationAttempt({
        status:
          "merged",
      });

    assert.equal(
      history.entries.length,
      1
    );

    assert.equal(
      history.entries[0]?.authoritative,
      false
    );

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    assert.equal(
      getRuntimeEvidenceReconciliationHistory()
        .entries.length,
      1
    );

    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
