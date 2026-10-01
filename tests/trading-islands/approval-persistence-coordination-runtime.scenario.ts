import assert from "node:assert/strict";
import test from "node:test";

import {
  createBrowserApprovalPersistenceCoordinator,
} from "../../src/trading/risk/approvalCoordination.ts";

import {
  StaleApprovalPersistenceError,
  createLocalApprovalPersistence,
} from "../../src/trading/risk/localApprovalPersistence.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import type {
  ApprovalKeyValueStorage,
} from "../../src/trading/risk/localApprovalPersistence.ts";


class SharedMemoryStorage
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
}


function createSerializedLockManager() {
  let queue:
    Promise<void> =
      Promise.resolve();

  return {
    async request<T>(
      _name:
        string,

      operation:
        () => Promise<T>
    ):
      Promise<T> {
      let release:
        () => void =
          () => undefined;

      const previous =
        queue;

      queue =
        new Promise<void>(
          resolve => {
            release =
              resolve;
          }
        );

      await previous;

      try {
        return await operation();
      } finally {
        release();
      }
    },
  };
}


async function withMockNavigatorLocks<T>(
  operation:
    () => Promise<T>
):
  Promise<T> {
  const descriptor =
    Object.getOwnPropertyDescriptor(
      globalThis,
      "navigator"
    );

  try {
    Object.defineProperty(
      globalThis,
      "navigator",
      {
        configurable:
          true,

        value: {
          locks:
            createSerializedLockManager(),
        },
      }
    );

    return await operation();
  } finally {
    if (
      descriptor
    ) {
      Object.defineProperty(
        globalThis,
        "navigator",
        descriptor
      );
    } else {
      delete (
        globalThis as {
          navigator?:
            unknown;
        }
      ).navigator;
    }
  }
}


test(
  "without coordination two contexts can observe the same revision and stale CAS rejects the loser",
  async () => {
    const storage =
      new SharedMemoryStorage();

    const contextA =
      createLocalApprovalPersistence(
        storage
      );

    const contextB =
      createLocalApprovalPersistence(
        storage
      );

    const snapshotA =
      await contextA.load();

    const snapshotB =
      await contextB.load();

    assert.equal(
      snapshotA.revision,
      null
    );

    assert.equal(
      snapshotB.revision,
      null
    );

    const first =
      await contextA.save(
        createEmptyApprovalRepositoryState(),
        snapshotA.revision
      );

    assert.equal(
      first.revision,
      1
    );

    await assert.rejects(
      () =>
        contextB.save(
          createEmptyApprovalRepositoryState(),
          snapshotB.revision
        ),
      StaleApprovalPersistenceError
    );

    const final =
      await contextA.load();

    assert.equal(
      final.revision,
      1
    );
  }
);


test(
  "coordinator plus CAS serializes complete read-write critical sections",
  async () => {
    await withMockNavigatorLocks(
      async () => {
        const storage =
          new SharedMemoryStorage();

        const contextA =
          createLocalApprovalPersistence(
            storage
          );

        const contextB =
          createLocalApprovalPersistence(
            storage
          );

        const coordinatorA =
          createBrowserApprovalPersistenceCoordinator();

        const coordinatorB =
          createBrowserApprovalPersistenceCoordinator();

        const events:
          string[] = [];

        const writeFromA =
          coordinatorA.runExclusive(
            async () => {
              events.push(
                "A:lock"
              );

              const current =
                await contextA.load();

              events.push(
                `A:read:${current.revision ?? "null"}`
              );

              await new Promise<void>(
                resolve =>
                  setTimeout(
                    resolve,
                    25
                  )
              );

              const result =
                await contextA.save(
                  createEmptyApprovalRepositoryState(),
                  current.revision
                );

              events.push(
                `A:write:${result.revision}`
              );

              return result.revision;
            }
          );

        const writeFromB =
          coordinatorB.runExclusive(
            async () => {
              events.push(
                "B:lock"
              );

              const current =
                await contextB.load();

              events.push(
                `B:read:${current.revision ?? "null"}`
              );

              const result =
                await contextB.save(
                  createEmptyApprovalRepositoryState(),
                  current.revision
                );

              events.push(
                `B:write:${result.revision}`
              );

              return result.revision;
            }
          );

        const revisions =
          await Promise.all([
            writeFromA,
            writeFromB,
          ]);

        assert.deepEqual(
          revisions,
          [
            1,
            2,
          ]
        );

        assert.deepEqual(
          events,
          [
            "A:lock",
            "A:read:null",
            "A:write:1",
            "B:lock",
            "B:read:1",
            "B:write:2",
          ]
        );

        const final =
          await contextA.load();

        assert.equal(
          final.revision,
          2
        );

        assert.equal(
          final.authoritative,
          false
        );
      }
    );
  }
);


test(
  "read outside the lock remains stale and CAS still protects storage",
  async () => {
    await withMockNavigatorLocks(
      async () => {
        const storage =
          new SharedMemoryStorage();

        const contextA =
          createLocalApprovalPersistence(
            storage
          );

        const contextB =
          createLocalApprovalPersistence(
            storage
          );

        const coordinatorA =
          createBrowserApprovalPersistenceCoordinator();

        const coordinatorB =
          createBrowserApprovalPersistenceCoordinator();

        const staleSnapshot =
          await contextB.load();

        const first =
          await coordinatorA.runExclusive(
            async () => {
              const current =
                await contextA.load();

              return contextA.save(
                createEmptyApprovalRepositoryState(),
                current.revision
              );
            }
          );

        assert.equal(
          first.revision,
          1
        );

        await assert.rejects(
          () =>
            coordinatorB.runExclusive(
              () =>
                contextB.save(
                  createEmptyApprovalRepositoryState(),
                  staleSnapshot.revision
                )
            ),
          StaleApprovalPersistenceError
        );

        const final =
          await contextA.load();

        assert.equal(
          final.revision,
          1
        );
      }
    );
  }
);


test(
  "coordinated clear uses latest revision and does not bypass CAS",
  async () => {
    await withMockNavigatorLocks(
      async () => {
        const storage =
          new SharedMemoryStorage();

        const contextA =
          createLocalApprovalPersistence(
            storage
          );

        const contextB =
          createLocalApprovalPersistence(
            storage
          );

        const coordinatorA =
          createBrowserApprovalPersistenceCoordinator();

        const coordinatorB =
          createBrowserApprovalPersistenceCoordinator();

        await coordinatorA.runExclusive(
          async () => {
            const current =
              await contextA.load();

            const result =
              await contextA.save(
                createEmptyApprovalRepositoryState(),
                current.revision
              );

            assert.equal(
              result.revision,
              1
            );
          }
        );

        await coordinatorB.runExclusive(
          async () => {
            const current =
              await contextB.load();

            assert.equal(
              current.revision,
              1
            );

            await contextB.clear(
              current.revision
            );
          }
        );

        const final =
          await contextA.load();

        assert.equal(
          final.state,
          null
        );

        assert.equal(
          final.revision,
          null
        );
      }
    );
  }
);


test(
  "failed coordinated write releases lock and preserves latest valid revision",
  async () => {
    await withMockNavigatorLocks(
      async () => {
        const storage =
          new SharedMemoryStorage();

        const contextA =
          createLocalApprovalPersistence(
            storage
          );

        const contextB =
          createLocalApprovalPersistence(
            storage
          );

        const coordinatorA =
          createBrowserApprovalPersistenceCoordinator();

        const coordinatorB =
          createBrowserApprovalPersistenceCoordinator();

        const first =
          await coordinatorA.runExclusive(
            async () => {
              const current =
                await contextA.load();

              return contextA.save(
                createEmptyApprovalRepositoryState(),
                current.revision
              );
            }
          );

        assert.equal(
          first.revision,
          1
        );

        await assert.rejects(
          () =>
            coordinatorA.runExclusive(
              async () => {
                throw new Error(
                  "synthetic locked failure"
                );
              }
            ),
          /synthetic locked failure/
        );

        const second =
          await coordinatorB.runExclusive(
            async () => {
              const current =
                await contextB.load();

              return contextB.save(
                createEmptyApprovalRepositoryState(),
                current.revision
              );
            }
          );

        assert.equal(
          second.revision,
          2
        );

        const final =
          await contextA.load();

        assert.equal(
          final.revision,
          2
        );
      }
    );
  }
);


test(
  "coordination metadata never becomes approval authority",
  async () => {
    await withMockNavigatorLocks(
      async () => {
        const coordinator =
          createBrowserApprovalPersistenceCoordinator();

        assert.equal(
          coordinator.authoritative,
          false
        );

        const result =
          await coordinator.runExclusive(
            async () =>
              "coordination-only"
          );

        assert.equal(
          result,
          "coordination-only"
        );
      }
    );
  }
);
