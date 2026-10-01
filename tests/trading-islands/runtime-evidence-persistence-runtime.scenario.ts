import assert from "node:assert/strict";
import test from "node:test";

import {
  createRuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import {
  createLocalRuntimeEvidencePersistence,
} from "../../src/trading/runtime/localRuntimeEvidencePersistence.ts";

import {
  deserializeRuntimeEvidenceSnapshot,
  serializeRuntimeEvidenceSnapshot,
  validateRuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistenceValidation.ts";

import type {
  RuntimeEvidenceHistory,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";


function history():
  RuntimeEvidenceHistory {
  return {
    entries:
      [],

    authoritative:
      false,
  };
}


function memoryStorage() {
  const values =
    new Map<
      string,
      string
    >();

  return {
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

    values,
  };
}


test(
  "runtime evidence snapshot round trips through validation",
  () => {
    const snapshot =
      createRuntimeEvidenceSnapshot(
        history()
      );

    assert.equal(
      validateRuntimeEvidenceSnapshot(
        snapshot
      ),
      true
    );

    const serialized =
      serializeRuntimeEvidenceSnapshot(
        snapshot
      );

    const restored =
      deserializeRuntimeEvidenceSnapshot(
        serialized
      );

    assert.deepEqual(
      restored,
      snapshot
    );

    assert.equal(
      restored.authoritative,
      false
    );
  }
);


test(
  "local runtime evidence persistence saves loads and clears",
  async () => {
    const storage =
      memoryStorage();

    const persistence =
      createLocalRuntimeEvidencePersistence(
        storage
      );

    const empty =
      await persistence.load();

    assert.equal(
      empty.snapshot,
      null
    );

    assert.equal(
      empty.authoritative,
      false
    );

    const snapshot =
      createRuntimeEvidenceSnapshot(
        history()
      );

    await persistence.save(
      snapshot
    );

    const loaded =
      await persistence.load();

    assert.deepEqual(
      loaded.snapshot,
      snapshot
    );

    await persistence.clear();

    const cleared =
      await persistence.load();

    assert.equal(
      cleared.snapshot,
      null
    );
  }
);


test(
  "corrupt JSON is rejected",
  async () => {
    const storage =
      memoryStorage();

    storage.setItem(
      "digitalboost.trading.runtime-evidence.v1",
      "{broken"
    );

    const persistence =
      createLocalRuntimeEvidencePersistence(
        storage
      );

    await assert.rejects(
      () =>
        persistence.load(),
      /invalid JSON/
    );
  }
);


test(
  "authoritative runtime evidence snapshot is rejected",
  () => {
    const value = {
      version:
        1,

      history: {
        entries:
          [],

        authoritative:
          false,
      },

      authoritative:
        true,
    };

    assert.equal(
      validateRuntimeEvidenceSnapshot(
        value
      ),
      false
    );
  }
);


test(
  "duplicate session ids are rejected by persisted history validation",
  () => {
    const bundle = {
      sessionId:
        "session-1",

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      audit: {
        sessionId:
          "session-1",

        botId:
          "bot-1",

        strategyId:
          "strategy-1",

        approval: {
          riskReviewId:
            "review-1",

          botId:
            "bot-1",

          strategyId:
            "strategy-1",

          approvalScope:
            "paper-only",

          approvalVerified:
            true,

          bindingFingerprint:
            "fingerprint-1",
        },

        decision:
          "paper-filled",

        events:
          [],

        authoritative:
          false,
      },

      ledger:
        [],

      authoritative:
        false,
    };

    const value = {
      version:
        1,

      history: {
        entries: [
          bundle,
          bundle,
        ],

        authoritative:
          false,
      },

      authoritative:
        false,
    };

    assert.equal(
      validateRuntimeEvidenceSnapshot(
        value
      ),
      false
    );
  }
);
