import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidenceCoordinator,
  configureRuntimeEvidencePersistence,
  getRuntimeEvidenceHistory,
  getRuntimeEvidenceLifecycle,
  hydrateRuntimeEvidence,
  recordRuntimeSessionEvidence,
  resetRuntimeEvidenceHistoryForTests,
  waitForRuntimeEvidencePersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import {
  configureRuntimeEvidenceReconciliationHistoryPersistence,
  getRuntimeEvidenceReconciliationHistory,
  resetRuntimeEvidenceReconciliationHistoryForTests,
  waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryStore.ts";

import {
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import {
  createRuntimeEvidenceReconciliationHistorySnapshot,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistence.ts";

import type {
  RuntimeEvidenceReconciliationHistoryPersistence,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistence.ts";

import type {
  BotRuntimeSessionResult,
} from "../../src/trading/runtime/session.ts";


function result(
  sessionId:
    string
):
  BotRuntimeSessionResult {
  return {
    session: {
      id:
        sessionId,

      botId:
        "bot-test",

      strategyId:
        "strategy-test",

      events:
        [],

      completed:
        true,

      authoritative:
        false,
    },

    runtime: {
      botId:
        "bot-test",

      decision:
        "paper-filled",

      account: {
        cash:
          10_000,

        positions:
          [],

        orders:
          [],

        ledger:
          [],
      },

      reason:
        "Paper order filled.",

      approvalReviewId:
        "review-test",

      approvalBotId:
        "bot-test",

      approvalStrategyId:
        "strategy-test",

      approvalBindingFingerprint:
        `fingerprint-${sessionId}`,

      liveExecution:
        false,
    },
  };
}


function coordinator() {
  return {
    crossContextSafe:
      true,

    authoritative:
      false as const,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      return operation();
    },
  };
}


test(
  "coordinated load failure is durably recorded and memory survives",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let historyPersisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    const historyPersistence:
      RuntimeEvidenceReconciliationHistoryPersistence = {
      async load() {
        return {
          snapshot:
            createRuntimeEvidenceReconciliationHistorySnapshot(
              historyPersisted
            ),

          authoritative:
            false,
        };
      },

      async save(
        snapshot
      ) {
        historyPersisted =
          structuredClone(
            snapshot.history
          );
      },

      async clear() {
        historyPersisted =
          createRuntimeEvidenceReconciliationAttemptHistory();
      },
    };

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      historyPersistence
    );

    let failLoad =
      false;

    configureRuntimeEvidencePersistence({
      async load() {
        if (
          failLoad
        ) {
          throw new Error(
            "simulated coordinated load failure"
          );
        }

        return {
          snapshot:
            null,

          authoritative:
            false,
        };
      },

      async save() {},

      async clear() {},
    });

    configureRuntimeEvidenceCoordinator(
      coordinator()
    );

    await hydrateRuntimeEvidence();

    failLoad =
      true;

    recordRuntimeSessionEvidence(
      result(
        "load-failure-session"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "error"
    );

    assert.match(
      getRuntimeEvidenceLifecycle().error ??
        "",
      /simulated coordinated load failure/
    );

    assert.ok(
      getRuntimeEvidenceHistory()
        .entries.some(
          entry =>
            entry.sessionId ===
              "load-failure-session"
        )
    );

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    const failure =
      getRuntimeEvidenceReconciliationHistory()
        .entries
        .find(
          entry =>
            entry.status ===
              "error" &&
            entry.error?.includes(
              "simulated coordinated load failure"
            )
        );

    assert.ok(
      failure
    );

    assert.equal(
      failure?.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);


test(
  "coordinated save failure is durably recorded and memory survives",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let historyPersisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    configureRuntimeEvidenceReconciliationHistoryPersistence({
      async load() {
        return {
          snapshot:
            createRuntimeEvidenceReconciliationHistorySnapshot(
              historyPersisted
            ),

          authoritative:
            false,
        };
      },

      async save(
        snapshot
      ) {
        historyPersisted =
          structuredClone(
            snapshot.history
          );
      },

      async clear() {
        historyPersisted =
          createRuntimeEvidenceReconciliationAttemptHistory();
      },
    });

    let failSave =
      false;

    configureRuntimeEvidencePersistence({
      async load() {
        return {
          snapshot:
            null,

          authoritative:
            false,
        };
      },

      async save() {
        if (
          failSave
        ) {
          throw new Error(
            "simulated coordinated save failure"
          );
        }
      },

      async clear() {},
    });

    configureRuntimeEvidenceCoordinator(
      coordinator()
    );

    await hydrateRuntimeEvidence();

    failSave =
      true;

    recordRuntimeSessionEvidence(
      result(
        "save-failure-session"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "error"
    );

    assert.match(
      getRuntimeEvidenceLifecycle().error ??
        "",
      /simulated coordinated save failure/
    );

    assert.ok(
      getRuntimeEvidenceHistory()
        .entries.some(
          entry =>
            entry.sessionId ===
              "save-failure-session"
        )
    );

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    const failure =
      getRuntimeEvidenceReconciliationHistory()
        .entries
        .find(
          entry =>
            entry.status ===
              "error" &&
            entry.error?.includes(
              "simulated coordinated save failure"
            )
        );

    assert.ok(
      failure
    );

    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
