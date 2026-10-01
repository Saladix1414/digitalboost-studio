import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidencePersistence,
  getRuntimeEvidenceHistory,
  getRuntimeEvidenceLifecycle,
  hydrateRuntimeEvidence,
  markRuntimeEvidenceStale,
  reconcileStaleRuntimeEvidence,
  resetRuntimeEvidenceHistoryForTests,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import {
  createRuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  RuntimeEvidencePersistence,
  RuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  RuntimeEvidenceBundle,
  RuntimeEvidenceHistory,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

function bundle(
  sessionId:
    string,

  reviewId =
    "review-1"
):
  RuntimeEvidenceBundle {
  return {
    sessionId,
    botId:
      "bot-1",
    strategyId:
      "strategy-1",

    audit: {
      sessionId,
      botId:
        "bot-1",
      strategyId:
        "strategy-1",

      approval: {
        riskReviewId:
          reviewId,
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
}

function history(
  ...entries:
    RuntimeEvidenceBundle[]
):
  RuntimeEvidenceHistory {
  return {
    entries,
    authoritative:
      false,
  };
}

function persistenceWithSnapshot(
  snapshot:
    RuntimeEvidenceSnapshot | null
) {
  const saves:
    RuntimeEvidenceSnapshot[] =
      [];

  const adapter:
    RuntimeEvidencePersistence = {
      async load() {
        return {
          snapshot,
          authoritative:
            false,
        };
      },

      async save(
        next
      ) {
        saves.push(
          structuredClone(
            next
          )
        );

        snapshot =
          structuredClone(
            next
          );
      },

      async clear() {
        snapshot =
          null;
      },
    };

  return {
    adapter,
    saves,

    get snapshot() {
      return snapshot;
    },
  };
}

test(
  "reconciliation runs only when stale",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const persistence =
      persistenceWithSnapshot(
        null
      );

    configureRuntimeEvidencePersistence(
      persistence.adapter
    );

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "not-stale"
    );

    assert.equal(
      persistence.saves.length,
      0
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);

test(
  "missing persistence does not fabricate success",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    markRuntimeEvidenceStale();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "unavailable"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "stale"
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);

test(
  "controlled reconciliation merges persisted evidence",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const external =
      bundle(
        "runtime-bot-1-origin-external-1"
      );

    const persistence =
      persistenceWithSnapshot(
        createRuntimeEvidenceSnapshot(
          history(
            external
          )
        )
      );

    configureRuntimeEvidencePersistence(
      persistence.adapter
    );

    markRuntimeEvidenceStale();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "merged"
    );

    assert.deepEqual(
      getRuntimeEvidenceHistory()
        .entries
        .map(
          entry =>
            entry.sessionId
        ),
      [
        "runtime-bot-1-origin-external-1",
      ]
    );

    assert.equal(
      persistence.saves.length,
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

    resetRuntimeEvidenceHistoryForTests();
  }
);

test(
  "conflict preserves current memory and performs no save",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const local =
      bundle(
        "runtime-bot-1-origin-shared-1",
        "review-local"
      );

    const localPersistence =
      persistenceWithSnapshot(
        createRuntimeEvidenceSnapshot(
          history(
            local
          )
        )
      );

    configureRuntimeEvidencePersistence(
      localPersistence.adapter
    );

    await hydrateRuntimeEvidence();

    const before =
      getRuntimeEvidenceHistory();

    const external =
      bundle(
        "runtime-bot-1-origin-shared-1",
        "review-external"
      );

    const conflictPersistence =
      persistenceWithSnapshot(
        createRuntimeEvidenceSnapshot(
          history(
            external
          )
        )
      );

    configureRuntimeEvidencePersistence(
      conflictPersistence.adapter
    );

    markRuntimeEvidenceStale();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "conflict"
    );

    assert.equal(
      getRuntimeEvidenceHistory(),
      before
    );

    assert.equal(
      conflictPersistence.saves.length,
      0
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "stale"
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);

test(
  "save failure reports observational error",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const adapter:
      RuntimeEvidencePersistence = {
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
          "simulated save failure"
        );
      },

      async clear() {},
    };

    configureRuntimeEvidencePersistence(
      adapter
    );

    markRuntimeEvidenceStale();

    const result =
      await reconcileStaleRuntimeEvidence();

    assert.equal(
      result.status,
      "error"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "error"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);
