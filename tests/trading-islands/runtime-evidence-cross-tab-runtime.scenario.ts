import assert from "node:assert/strict";
import test from "node:test";

import {
  bootstrapRuntimeEvidenceBrowserPersistence,
  resetRuntimeEvidenceBrowserBootstrapForTests,
} from "../../src/trading/runtime/runtimeEvidenceBrowserBootstrap.ts";

import {
  getRuntimeEvidenceHistory,
  getRuntimeEvidenceLifecycle,
  hydrateRuntimeEvidence,
  resetRuntimeEvidenceHistoryForTests,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import {
  LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY,
} from "../../src/trading/runtime/localRuntimeEvidencePersistence.ts";


type StorageListener = (
  event:
    StorageEvent
) => void;


function installTestWindow() {
  const values =
    new Map<
      string,
      string
    >();

  const listeners =
    new Set<
      StorageListener
    >();

  const testWindow = {
    localStorage: {
      getItem(
        key:
          string
      ) {
        return (
          values.get(
            key
          ) ??
          null
        );
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

    addEventListener(
      type:
        string,

      listener:
        StorageListener
    ) {
      if (
        type ===
        "storage"
      ) {
        listeners.add(
          listener
        );
      }
    },

    removeEventListener(
      type:
        string,

      listener:
        StorageListener
    ) {
      if (
        type ===
        "storage"
      ) {
        listeners.delete(
          listener
        );
      }
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
    dispatchStorage(
      key:
        string | null
    ) {
      const event = {
        key,
      } as StorageEvent;

      for (
        const listener of
        listeners
      ) {
        listener(
          event
        );
      }
    },

    listenerCount() {
      return listeners.size;
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
  "matching external runtime evidence change marks lifecycle stale",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    const browser =
      installTestWindow();

    try {
      await bootstrapRuntimeEvidenceBrowserPersistence();

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .status,
        "ready"
      );

      browser.dispatchStorage(
        LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .status,
        "stale"
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .authoritative,
        false
      );
    } finally {
      resetRuntimeEvidenceBrowserBootstrapForTests();
      resetRuntimeEvidenceHistoryForTests();
      removeWindow();
    }
  }
);


test(
  "unrelated storage changes do not stale runtime evidence",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    const browser =
      installTestWindow();

    try {
      await bootstrapRuntimeEvidenceBrowserPersistence();

      browser.dispatchStorage(
        "some.other.storage.key"
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .status,
        "ready"
      );
    } finally {
      resetRuntimeEvidenceBrowserBootstrapForTests();
      resetRuntimeEvidenceHistoryForTests();
      removeWindow();
    }
  }
);


test(
  "stale detection preserves current in-memory history",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    const browser =
      installTestWindow();

    try {
      await bootstrapRuntimeEvidenceBrowserPersistence();

      const before =
        getRuntimeEvidenceHistory();

      browser.dispatchStorage(
        LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY
      );

      const after =
        getRuntimeEvidenceHistory();

      assert.equal(
        after,
        before
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .status,
        "stale"
      );
    } finally {
      resetRuntimeEvidenceBrowserBootstrapForTests();
      resetRuntimeEvidenceHistoryForTests();
      removeWindow();
    }
  }
);


test(
  "explicit hydration clears stale state through validated persistence",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    const browser =
      installTestWindow();

    try {
      await bootstrapRuntimeEvidenceBrowserPersistence();

      browser.dispatchStorage(
        LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY
      );

      assert.equal(
        getRuntimeEvidenceLifecycle()
          .status,
        "stale"
      );

      await hydrateRuntimeEvidence();

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
      resetRuntimeEvidenceBrowserBootstrapForTests();
      resetRuntimeEvidenceHistoryForTests();
      removeWindow();
    }
  }
);


test(
  "browser bootstrap installs only one storage listener",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceBrowserBootstrapForTests();

    const browser =
      installTestWindow();

    try {
      await Promise.all([
        bootstrapRuntimeEvidenceBrowserPersistence(),
        bootstrapRuntimeEvidenceBrowserPersistence(),
        bootstrapRuntimeEvidenceBrowserPersistence(),
      ]);

      assert.equal(
        browser.listenerCount(),
        1
      );
    } finally {
      resetRuntimeEvidenceBrowserBootstrapForTests();

      assert.equal(
        browser.listenerCount(),
        0
      );

      resetRuntimeEvidenceHistoryForTests();
      removeWindow();
    }
  }
);
