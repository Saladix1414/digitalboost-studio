import assert from "node:assert/strict";
import test from "node:test";

import {
  bootstrapRuntimeEvidenceBrowserPersistence,
  resetRuntimeEvidenceBrowserBootstrapForTests,
} from "../../src/trading/runtime/runtimeEvidenceBrowserBootstrap.ts";

import {
  getRuntimeEvidenceLifecycle,
  resetRuntimeEvidenceHistoryForTests,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";


type TestWindow = {
  localStorage: {
    getItem(
      key:
        string
    ):
      string | null;

    setItem(
      key:
        string,

      value:
        string
    ):
      void;

    removeItem(
      key:
        string
    ):
      void;
  };
};


function installWindow() {
  const values =
    new Map<
      string,
      string
    >();

  let reads =
    0;

  const testWindow:
    TestWindow = {
      localStorage: {
        getItem(
          key
        ) {
          reads +=
            1;

          return (
            values.get(
              key
            ) ??
            null
          );
        },

        setItem(
          key,
          value
        ) {
          values.set(
            key,
            value
          );
        },

        removeItem(
          key
        ) {
          values.delete(
            key
          );
        },
      },
    };

  Object.defineProperty(
    globalThis,
    "window",
    {
      configurable:
        true,

      writable:
        true,

      value:
        testWindow,
    }
  );

  return {
    get reads() {
      return reads;
    },

    values,
  };
}


function removeWindow():
  void {
  Reflect.deleteProperty(
    globalThis,
    "window"
  );
}


test(
  "browser bootstrap configures and hydrates local evidence once",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    const browser =
      installWindow();

    try {
      const first =
        bootstrapRuntimeEvidenceBrowserPersistence();

      const second =
        bootstrapRuntimeEvidenceBrowserPersistence();

      assert.equal(
        first,
        second
      );

      await Promise.all([
        first,
        second,
      ]);

      assert.equal(
        browser.reads,
        1
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .status,
        "ready"
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .authoritative,
        false
      );
    } finally {
      removeWindow();

      resetRuntimeEvidenceBrowserBootstrapForTests();
      resetRuntimeEvidenceHistoryForTests();
    }
  }
);


test(
  "missing browser context remains safe and non authoritative",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    removeWindow();

    await bootstrapRuntimeEvidenceBrowserPersistence();

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "ready"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .authoritative,
      false
    );

    resetRuntimeEvidenceBrowserBootstrapForTests();
    resetRuntimeEvidenceHistoryForTests();
  }
);
