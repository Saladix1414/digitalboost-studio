import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidencePersistence,
  createRuntimeEvidenceBundle,
  getRuntimeEvidenceHistory,
  getRuntimeEvidenceLifecycle,
  hydrateRuntimeEvidence,
  recordRuntimeSessionEvidence,
  resetRuntimeEvidenceHistoryForTests,
  waitForRuntimeEvidencePersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import {
  createRuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  RuntimeEvidencePersistence,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  BotRuntimeSessionResult,
} from "../../src/trading/runtime/session.ts";


function result(
  sessionId:
    string,

  botId =
    "bot-test",

  reviewId =
    "review-test"
):
  BotRuntimeSessionResult {
  return {
    session: {
      id:
        sessionId,

      botId,

      strategyId:
        "strategy-test",

      events: [
        {
          id:
            `${sessionId}-event-1`,

          sequence:
            1,

          type:
            "session_started",

          botId,

          strategyId:
            "strategy-test",

          symbol:
            "BTC",

          message:
            "Started.",
        },
      ],

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
          9_900,

        positions:
          [],

        orders:
          [],

        ledger: [
          {
            id:
              `${sessionId}-ledger-1`,

            kind:
              "deposit",

            amount:
              10_000,

            balanceAfter:
              10_000,

            note:
              "Initial paper capital",
          },
        ],
      },

      reason:
        "Paper order filled.",

      approvalReviewId:
        reviewId,

      approvalBotId:
        botId,

      approvalStrategyId:
        "strategy-test",

      approvalBindingFingerprint:
        `fingerprint-${sessionId}`,

      liveExecution:
        false,
    },
  };
}


test(
  "runtime evidence recorded while startup load is pending survives hydration",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const persistedHistory = {
      entries: [
        createRuntimeEvidenceBundle(
          result(
            "persisted-session"
          )
        ),
      ],

      authoritative:
        false as const,
    };

    let persisted =
      createRuntimeEvidenceSnapshot(
        persistedHistory
      );

    let releaseLoad:
      (() => void) | null =
        null;

    let blockLoad =
      true;

    const adapter:
      RuntimeEvidencePersistence = {
      async load() {
        if (
          blockLoad
        ) {
          blockLoad =
            false;

          await new Promise<void>(
            resolve => {
              releaseLoad =
                resolve;
            }
          );
        }

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
          snapshot;
      },

      async clear() {},
    };

    configureRuntimeEvidencePersistence(
      adapter
    );

    const hydration =
      hydrateRuntimeEvidence();

    for (
      let i = 0;
      i < 100 &&
      !releaseLoad;
      i += 1
    ) {
      await new Promise<void>(
        resolve =>
          setImmediate(
            resolve
          )
      );
    }

    assert.ok(
      releaseLoad,
      "startup load did not block"
    );

    recordRuntimeSessionEvidence(
      result(
        "local-during-hydration"
      )
    );

    releaseLoad?.();

    await hydration;

    const sessionIds =
      getRuntimeEvidenceHistory()
        .entries.map(
          entry =>
            entry.sessionId
        );

    assert.ok(
      sessionIds.includes(
        "persisted-session"
      )
    );

    assert.ok(
      sessionIds.includes(
        "local-during-hydration"
      )
    );

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "ready"
    );

    await waitForRuntimeEvidencePersistenceQueue();

    const persistedSessionIds =
      persisted.history.entries.map(
        entry =>
          entry.sessionId
      );

    assert.ok(
      persistedSessionIds.includes(
        "persisted-session"
      )
    );

    assert.ok(
      persistedSessionIds.includes(
        "local-during-hydration"
      )
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);


test(
  "startup hydration conflict preserves exact current memory",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    recordRuntimeSessionEvidence(
      result(
        "same-session",
        "bot-local",
        "review-local"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    const before =
      getRuntimeEvidenceHistory();

    const conflicting =
      createRuntimeEvidenceBundle(
        result(
          "same-session",
          "bot-remote",
          "review-remote"
        )
      );

    configureRuntimeEvidencePersistence({
      async load() {
        return {
          snapshot:
            createRuntimeEvidenceSnapshot({
              entries: [
                conflicting,
              ],

              authoritative:
                false,
            }),

          authoritative:
            false,
        };
      },

      async save() {},

      async clear() {},
    });

    await hydrateRuntimeEvidence();

    assert.equal(
      getRuntimeEvidenceHistory(),
      before
    );

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "error"
    );

    assert.match(
      getRuntimeEvidenceLifecycle().error ??
        "",
      /conflict/i
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);


test(
  "startup load failure preserves current runtime evidence",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    recordRuntimeSessionEvidence(
      result(
        "local-before-failure"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    const before =
      getRuntimeEvidenceHistory();

    configureRuntimeEvidencePersistence({
      async load() {
        throw new Error(
          "simulated startup load failure"
        );
      },

      async save() {},

      async clear() {},
    });

    await hydrateRuntimeEvidence();

    assert.equal(
      getRuntimeEvidenceHistory(),
      before
    );

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "error"
    );

    assert.match(
      getRuntimeEvidenceLifecycle().error ??
        "",
      /simulated startup load failure/
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);
