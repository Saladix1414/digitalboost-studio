import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVAL_STORAGE_KEY,
  APPROVAL_STORAGE_SCHEMA_VERSION,
  StaleApprovalPersistenceError,
  createLocalApprovalPersistence,
} from "../../src/trading/risk/localApprovalPersistence.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import {
  clearApprovalStorePersistence,
  configureApprovalStorePersistence,
  getApprovalPersistenceWriteState,
  getApprovalStoreLifecycle,
  hydrateApprovalStore,
  persistApprovalStore,
  waitForApprovalPersistenceQueue,
} from "../../src/trading/risk/approvalStore.ts";

import type {
  ApprovalKeyValueStorage,
} from "../../src/trading/risk/localApprovalPersistence.ts";

import type {
  ApprovalRepositoryPersistence,
} from "../../src/trading/risk/approvalPersistence.ts";


class MemoryStorage
  implements ApprovalKeyValueStorage {
  private readonly values =
    new Map<
      string,
      string
    >();

  getItem(
    key:
      string
  ):
    string | null {
    return (
      this.values.get(
        key
      ) ??
      null
    );
  }

  setItem(
    key:
      string,
    value:
      string
  ):
    void {
    this.values.set(
      key,
      value
    );
  }

  removeItem(
    key:
      string
  ):
    void {
    this.values.delete(
      key
    );
  }

  readRaw(
    key:
      string
  ):
    string | null {
    return this.getItem(
      key
    );
  }
}


function emptyState() {
  return createEmptyApprovalRepositoryState();
}


test(
  "local adapter round-trips repository state with monotonic revision",
  async () => {
    const storage =
      new MemoryStorage();

    const adapter =
      createLocalApprovalPersistence(
        storage
      );

    const initial =
      await adapter.load();

    assert.equal(
      initial.state,
      null
    );

    assert.equal(
      initial.revision,
      null
    );

    const firstSave =
      await adapter.save(
        emptyState(),
        null
      );

    assert.equal(
      firstSave.revision,
      1
    );

    const loaded =
      await adapter.load();

    assert.deepEqual(
      loaded.state,
      emptyState()
    );

    assert.equal(
      loaded.revision,
      1
    );

    const secondSave =
      await adapter.save(
        emptyState(),
        loaded.revision
      );

    assert.equal(
      secondSave.revision,
      2
    );

    const loadedAgain =
      await adapter.load();

    assert.equal(
      loadedAgain.revision,
      2
    );
  }
);


test(
  "two adapters sharing storage reject stale write instead of overwriting newer revision",
  async () => {
    const storage =
      new MemoryStorage();

    const adapterA =
      createLocalApprovalPersistence(
        storage
      );

    const adapterB =
      createLocalApprovalPersistence(
        storage
      );

    const snapshotA =
      await adapterA.load();

    const snapshotB =
      await adapterB.load();

    assert.equal(
      snapshotA.revision,
      null
    );

    assert.equal(
      snapshotB.revision,
      null
    );

    const writtenA =
      await adapterA.save(
        emptyState(),
        snapshotA.revision
      );

    assert.equal(
      writtenA.revision,
      1
    );

    await assert.rejects(
      () =>
        adapterB.save(
          emptyState(),
          snapshotB.revision
        ),
      (
        error:
          unknown
      ) => {
        assert.ok(
          error instanceof
            StaleApprovalPersistenceError
        );

        assert.equal(
          error.expectedRevision,
          null
        );

        assert.equal(
          error.actualRevision,
          1
        );

        return true;
      }
    );

    const final =
      await adapterA.load();

    assert.equal(
      final.revision,
      1
    );
  }
);


test(
  "revision-aware clear rejects stale revision",
  async () => {
    const storage =
      new MemoryStorage();

    const adapter =
      createLocalApprovalPersistence(
        storage
      );

    const first =
      await adapter.save(
        emptyState(),
        null
      );

    assert.equal(
      first.revision,
      1
    );

    await assert.rejects(
      () =>
        adapter.clear(
          null
        ),
      StaleApprovalPersistenceError
    );

    const stillPresent =
      await adapter.load();

    assert.equal(
      stillPresent.revision,
      1
    );

    await adapter.clear(
      1
    );

    const removed =
      await adapter.load();

    assert.equal(
      removed.state,
      null
    );

    assert.equal(
      removed.revision,
      null
    );
  }
);


test(
  "legacy revisionless schema-v1 payload loads as revision zero",
  async () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      APPROVAL_STORAGE_KEY,
      JSON.stringify({
        schemaVersion:
          APPROVAL_STORAGE_SCHEMA_VERSION,

        state:
          emptyState(),
      })
    );

    const adapter =
      createLocalApprovalPersistence(
        storage
      );

    const loaded =
      await adapter.load();

    assert.equal(
      loaded.revision,
      0
    );

    assert.deepEqual(
      loaded.state,
      emptyState()
    );

    const saved =
      await adapter.save(
        emptyState(),
        0
      );

    assert.equal(
      saved.revision,
      1
    );
  }
);


test(
  "corrupt payload is rejected during runtime load",
  async () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      APPROVAL_STORAGE_KEY,
      "{broken-json"
    );

    const adapter =
      createLocalApprovalPersistence(
        storage
      );

    await assert.rejects(
      () =>
        adapter.load(),
      /not valid JSON/
    );
  }
);


test(
  "explicit corruption recovery can clear unreadable storage when no trusted revision exists",
  async () => {
    const storage =
      new MemoryStorage();

    storage.setItem(
      APPROVAL_STORAGE_KEY,
      "{broken-json"
    );

    const adapter =
      createLocalApprovalPersistence(
        storage
      );

    await adapter.clear(
      null
    );

    assert.equal(
      storage.readRaw(
        APPROVAL_STORAGE_KEY
      ),
      null
    );

    const loaded =
      await adapter.load();

    assert.equal(
      loaded.state,
      null
    );

    assert.equal(
      loaded.revision,
      null
    );
  }
);


test(
  "shared store hydration records adapter revision and reaches ready",
  async () => {
    const storage =
      new MemoryStorage();

    const adapter =
      createLocalApprovalPersistence(
        storage
      );

    await adapter.save(
      emptyState(),
      null
    );

    configureApprovalStorePersistence(
      adapter
    );

    await hydrateApprovalStore();

    const lifecycle =
      getApprovalStoreLifecycle();

    const diagnostics =
      getApprovalPersistenceWriteState();

    assert.equal(
      lifecycle.status,
      "ready"
    );

    assert.equal(
      diagnostics.revision,
      1
    );

    assert.equal(
      diagnostics.authoritative,
      false
    );

    configureApprovalStorePersistence(
      null
    );

    await clearApprovalStorePersistence();
  }
);


test(
  "shared store serializes concurrent persistence calls",
  async () => {
    const events:
      string[] = [];

    let revision:
      number | null =
        null;

    const delayedAdapter:
      ApprovalRepositoryPersistence = {
        async load() {
          return {
            state:
              null,

            revision,

            authoritative:
              false,
          };
        },

        async save(
          _state,
          expectedRevision
        ) {
          events.push(
            `start:${expectedRevision ?? "null"}`
          );

          await new Promise<void>(
            resolve =>
              setTimeout(
                resolve,
                expectedRevision ===
                  null
                  ? 30
                  : 1
              )
          );

          assert.equal(
            expectedRevision,
            revision
          );

          revision =
            (
              revision ??
              0
            ) + 1;

          events.push(
            `end:${revision}`
          );

          return {
            revision,

            authoritative:
              false,
          };
        },

        async clear(
          expectedRevision
        ) {
          assert.equal(
            expectedRevision,
            revision
          );

          revision =
            null;
        },
      };

    configureApprovalStorePersistence(
      delayedAdapter
    );

    await hydrateApprovalStore();

    const first =
      persistApprovalStore();

    const second =
      persistApprovalStore();

    await Promise.all([
      first,
      second,
    ]);

    await waitForApprovalPersistenceQueue();

    assert.deepEqual(
      events,
      [
        "start:null",
        "end:1",
        "start:1",
        "end:2",
      ]
    );

    const diagnostics =
      getApprovalPersistenceWriteState();

    assert.equal(
      diagnostics.revision,
      2
    );

    assert.equal(
      diagnostics.pending,
      0
    );

    assert.equal(
      diagnostics.queued,
      diagnostics.persisted
    );

    configureApprovalStorePersistence(
      null
    );

    await clearApprovalStorePersistence();
  }
);


test(
  "store surfaces stale-write conflict as lifecycle error",
  async () => {
    let actualRevision:
      number | null =
        5;

    const conflictingAdapter:
      ApprovalRepositoryPersistence = {
        async load() {
          return {
            state:
              null,

            revision:
              4,

            authoritative:
              false,
          };
        },

        async save(
          _state,
          expectedRevision
        ) {
          if (
            expectedRevision !==
            actualRevision
          ) {
            throw new StaleApprovalPersistenceError(
              expectedRevision,
              actualRevision
            );
          }

          actualRevision +=
            1;

          return {
            revision:
              actualRevision,

            authoritative:
              false,
          };
        },

        async clear() {
          actualRevision =
            null;
        },
      };

    configureApprovalStorePersistence(
      conflictingAdapter
    );

    await hydrateApprovalStore();

    assert.equal(
      getApprovalStoreLifecycle().status,
      "ready"
    );

    await persistApprovalStore();

    const lifecycle =
      getApprovalStoreLifecycle();

    assert.equal(
      lifecycle.status,
      "error"
    );

    assert.match(
      lifecycle.error ??
        "",
      /revision conflict/
    );

    configureApprovalStorePersistence(
      null
    );

    await clearApprovalStorePersistence();
  }
);
