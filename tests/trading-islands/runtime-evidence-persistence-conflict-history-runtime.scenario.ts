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
  createRuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import {
  createRuntimeEvidenceReconciliationHistorySnapshot,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistence.ts";

import {
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistory.ts";

import type {
  RuntimeEvidencePersistence,
  RuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  RuntimeEvidenceReconciliationHistoryPersistence,
} from "../../src/trading/runtime/runtimeEvidenceReconciliationHistoryPersistence.ts";

import type {
  BotRuntimeSessionResult,
} from "../../src/trading/runtime/session.ts";


function result(
  sessionId:
    string,

  botId:
    string
):
  BotRuntimeSessionResult {
  return {
    session: {
      id:
        sessionId,

      botId,

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
      botId,

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
        `review-${sessionId}`,

      approvalBotId:
        botId,

      approvalStrategyId:
        "strategy-test",

      approvalBindingFingerprint:
        `fingerprint-${sessionId}-${botId}`,

      liveExecution:
        false,
    },
  };
}


test(
  "coordinated persistence conflict is durably recorded without overwrite",
  async () => {
    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();

    let persisted:
      RuntimeEvidenceSnapshot | null =
        null;

    let historyPersisted =
      createRuntimeEvidenceReconciliationAttemptHistory();

    const evidencePersistence:
      RuntimeEvidencePersistence = {
      async load() {
        return {
          snapshot:
            persisted,

          authoritative:
            false,
        };
      },

      async save(
        snapshot
      ) {
        persisted =
          structuredClone(
            snapshot
          );
      },

      async clear() {
        persisted =
          null;
      },
    };

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

    configureRuntimeEvidencePersistence(
      evidencePersistence
    );

    configureRuntimeEvidenceCoordinator({
      crossContextSafe:
        true,

      authoritative:
        false,

      async runExclusive<T>(
        operation:
          () => Promise<T>
      ):
        Promise<T> {
        return operation();
      },
    });

    configureRuntimeEvidenceReconciliationHistoryPersistence(
      historyPersistence
    );

    await hydrateRuntimeEvidence();

    recordRuntimeSessionEvidence(
      result(
        "same-session",
        "bot-local"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    /*
     * Simulate another tab replacing the same session with
     * conflicting evidence after the first local persistence.
     */
    persisted =
      createRuntimeEvidenceSnapshot({
        entries: [
          {
            ...getRuntimeEvidenceHistory().entries[0],

            botId:
              "bot-remote",

            audit: {
              ...getRuntimeEvidenceHistory().entries[0].audit,

              botId:
                "bot-remote",
            },
          },
        ],

        authoritative:
          false,
      });

    const remoteBefore =
      structuredClone(
        persisted
      );

    recordRuntimeSessionEvidence(
      result(
        "second-local-session",
        "bot-local"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "stale"
    );

    assert.deepEqual(
      persisted,
      remoteBefore,
      "conflicting persisted evidence must not be overwritten"
    );

    await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

    const attempts =
      getRuntimeEvidenceReconciliationHistory()
        .entries;

    const conflict =
      attempts.find(
        entry =>
          entry.status ===
            "conflict" &&
          entry.conflictSessionId ===
            "same-session"
      );

    assert.ok(
      conflict,
      "durable conflict attempt was not recorded"
    );

    assert.equal(
      conflict?.authoritative,
      false
    );

    resetRuntimeEvidenceHistoryForTests();
    resetRuntimeEvidenceReconciliationHistoryForTests();
  }
);
