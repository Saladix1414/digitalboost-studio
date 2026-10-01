import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVAL_PERSISTENCE_LOCK_NAME,
  createBrowserApprovalPersistenceCoordinator,
  createLocalApprovalPersistenceCoordinator,
} from "../../src/trading/risk/approvalCoordination.ts";


test(
  "local coordinator executes operation directly",
  async () => {
    const coordinator =
      createLocalApprovalPersistenceCoordinator();

    let executed =
      false;

    const result =
      await coordinator.runExclusive(
        async () => {
          executed =
            true;

          return 42;
        }
      );

    assert.equal(
      executed,
      true
    );

    assert.equal(
      result,
      42
    );

    assert.equal(
      coordinator.authoritative,
      false
    );
  }
);


test(
  "local coordinator propagates operation failure",
  async () => {
    const coordinator =
      createLocalApprovalPersistenceCoordinator();

    await assert.rejects(
      () =>
        coordinator.runExclusive(
          async () => {
            throw new Error(
              "synthetic coordination failure"
            );
          }
        ),
      /synthetic coordination failure/
    );
  }
);


test(
  "browser coordinator falls back when navigator is unavailable",
  async () => {
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

          value:
            undefined,
        }
      );

      const coordinator =
        createBrowserApprovalPersistenceCoordinator();

      const value =
        await coordinator.runExclusive(
          async () =>
            "fallback-ok"
        );

      assert.equal(
        value,
        "fallback-ok"
      );

      assert.equal(
        coordinator.authoritative,
        false
      );
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
);


test(
  "browser coordinator uses canonical approval lock name",
  async () => {
    const descriptor =
      Object.getOwnPropertyDescriptor(
        globalThis,
        "navigator"
      );

    const requestedNames:
      string[] = [];

    try {
      Object.defineProperty(
        globalThis,
        "navigator",
        {
          configurable:
            true,

          value: {
            locks: {
              async request<T>(
                name:
                  string,

                callback:
                  () => Promise<T>
              ):
                Promise<T> {
                requestedNames.push(
                  name
                );

                return callback();
              },
            },
          },
        }
      );

      const coordinator =
        createBrowserApprovalPersistenceCoordinator();

      const result =
        await coordinator.runExclusive(
          async () =>
            "locked"
        );

      assert.equal(
        result,
        "locked"
      );

      assert.deepEqual(
        requestedNames,
        [
          APPROVAL_PERSISTENCE_LOCK_NAME,
        ]
      );
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
);


test(
  "simulated lock manager serializes concurrent operations",
  async () => {
    const descriptor =
      Object.getOwnPropertyDescriptor(
        globalThis,
        "navigator"
      );

    let queue:
      Promise<void> =
        Promise.resolve();

    try {
      Object.defineProperty(
        globalThis,
        "navigator",
        {
          configurable:
            true,

          value: {
            locks: {
              async request<T>(
                _name:
                  string,

                callback:
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
                  return await callback();
                } finally {
                  release();
                }
              },
            },
          },
        }
      );

      const coordinator =
        createBrowserApprovalPersistenceCoordinator();

      const events:
        string[] = [];

      const first =
        coordinator.runExclusive(
          async () => {
            events.push(
              "first:start"
            );

            await new Promise<void>(
              resolve =>
                setTimeout(
                  resolve,
                  30
                )
            );

            events.push(
              "first:end"
            );

            return 1;
          }
        );

      const second =
        coordinator.runExclusive(
          async () => {
            events.push(
              "second:start"
            );

            events.push(
              "second:end"
            );

            return 2;
          }
        );

      const results =
        await Promise.all([
          first,
          second,
        ]);

      assert.deepEqual(
        results,
        [
          1,
          2,
        ]
      );

      assert.deepEqual(
        events,
        [
          "first:start",
          "first:end",
          "second:start",
          "second:end",
        ]
      );
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
);


test(
  "failed operation releases simulated browser lock for next operation",
  async () => {
    const descriptor =
      Object.getOwnPropertyDescriptor(
        globalThis,
        "navigator"
      );

    let queue:
      Promise<void> =
        Promise.resolve();

    try {
      Object.defineProperty(
        globalThis,
        "navigator",
        {
          configurable:
            true,

          value: {
            locks: {
              async request<T>(
                _name:
                  string,

                callback:
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
                  return await callback();
                } finally {
                  release();
                }
              },
            },
          },
        }
      );

      const coordinator =
        createBrowserApprovalPersistenceCoordinator();

      const events:
        string[] = [];

      const first =
        coordinator.runExclusive(
          async () => {
            events.push(
              "first:start"
            );

            throw new Error(
              "first failed"
            );
          }
        );

      const second =
        coordinator.runExclusive(
          async () => {
            events.push(
              "second:start"
            );

            return "second-ok";
          }
        );

      await assert.rejects(
        () =>
          first,
        /first failed/
      );

      const secondResult =
        await second;

      assert.equal(
        secondResult,
        "second-ok"
      );

      assert.deepEqual(
        events,
        [
          "first:start",
          "second:start",
        ]
      );
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
);


test(
  "coordination runtime remains non authoritative",
  async () => {
    const local =
      createLocalApprovalPersistenceCoordinator();

    assert.equal(
      local.authoritative,
      false
    );

    const value =
      await local.runExclusive(
        async () =>
          "evidence-only"
      );

    assert.equal(
      value,
      "evidence-only"
    );
  }
);
