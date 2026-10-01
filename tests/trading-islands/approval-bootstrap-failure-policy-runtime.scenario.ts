import assert from "node:assert/strict";
import test from "node:test";

import {
  createApprovalBootstrapFailurePolicy,
} from "../../src/trading/risk/approvalBootstrapFailurePolicy.ts";

import {
  selectApprovalPersistence,
} from "../../src/trading/risk/approvalPersistenceMode.ts";

import {
  configureApprovalStorePersistence,
  getApprovalStoreActiveReview,
  getApprovalStoreLifecycle,
  hydrateApprovalStore,
} from "../../src/trading/risk/approvalStore.ts";


test(
  "remote policy forbids local fallback and automatic retry",
  () => {
    const policy =
      createApprovalBootstrapFailurePolicy(
        "remote"
      );

    assert.deepEqual(
      policy,
      {
        mode:
          "remote",

        fallbackMode:
          null,

        automaticRetry:
          false,

        clearOnFailure:
          false,

        recovery:
          "manual-rehydrate",

        authoritative:
          false,
      }
    );
  }
);


test(
  "local policy retains explicit corruption recovery",
  () => {
    const policy =
      createApprovalBootstrapFailurePolicy(
        "local"
      );

    assert.equal(
      policy.mode,
      "local"
    );

    assert.equal(
      policy.clearOnFailure,
      true
    );

    assert.equal(
      policy.recovery,
      "clear-and-rehydrate"
    );

    assert.equal(
      policy.fallbackMode,
      null
    );
  }
);


test(
  "remote hydration failure leaves lifecycle error and never creates authority",
  async () => {
    let requests =
      0;

    const selection =
      selectApprovalPersistence({
        mode:
          "remote",

        baseUrl:
          "https://example.test",

        fetchImpl:
          async () => {
            requests +=
              1;

            throw new Error(
              "synthetic backend unavailable"
            );
          },
      });

    configureApprovalStorePersistence(
      selection.persistence
    );

    await hydrateApprovalStore();

    const lifecycle =
      getApprovalStoreLifecycle();

    assert.equal(
      lifecycle.status,
      "error"
    );

    assert.equal(
      getApprovalStoreActiveReview(),
      null
    );

    assert.equal(
      requests,
      1
    );
  }
);


test(
  "remote hydration failure does not silently touch localStorage",
  async () => {
    let localReads =
      0;

    let localWrites =
      0;

    let localDeletes =
      0;

    const descriptor =
      Object.getOwnPropertyDescriptor(
        globalThis,
        "window"
      );

    try {
      Object.defineProperty(
        globalThis,
        "window",
        {
          configurable:
            true,

          value: {
            localStorage: {
              getItem() {
                localReads +=
                  1;

                return null;
              },

              setItem() {
                localWrites +=
                  1;
              },

              removeItem() {
                localDeletes +=
                  1;
              },
            },
          },
        }
      );

      const selection =
        selectApprovalPersistence({
          mode:
            "remote",

          baseUrl:
            "https://example.test",

          fetchImpl:
            async () => {
              throw new Error(
                "synthetic remote failure"
              );
            },
        });

      configureApprovalStorePersistence(
        selection.persistence
      );

      await hydrateApprovalStore();

      assert.equal(
        getApprovalStoreLifecycle().status,
        "error"
      );

      assert.equal(
        localReads,
        0
      );

      assert.equal(
        localWrites,
        0
      );

      assert.equal(
        localDeletes,
        0
      );
    } finally {
      if (
        descriptor
      ) {
        Object.defineProperty(
          globalThis,
          "window",
          descriptor
        );
      } else {
        delete (
          globalThis as {
            window?:
              unknown;
          }
        ).window;
      }
    }
  }
);


test(
  "remote hydration performs no automatic retry",
  async () => {
    let requests =
      0;

    const selection =
      selectApprovalPersistence({
        mode:
          "remote",

        baseUrl:
          "https://example.test",

        fetchImpl:
          async () => {
            requests +=
              1;

            throw new Error(
              "synthetic backend failure"
            );
          },
      });

    configureApprovalStorePersistence(
      selection.persistence
    );

    await hydrateApprovalStore();

    await new Promise<void>(
      (
        resolve
      ) => {
        setTimeout(
          resolve,
          25
        );
      }
    );

    assert.equal(
      requests,
      1
    );

    assert.equal(
      getApprovalStoreLifecycle().status,
      "error"
    );
  }
);
