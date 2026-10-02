import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidencePersistence,
  createRuntimeEvidenceBundle,
  getRuntimeEvidenceHistory,
  getRuntimeEvidenceLifecycle,
  hydrateRuntimeEvidence,
  markRuntimeEvidenceStale,
  resetRuntimeEvidenceHistoryForTests,
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


test(
  "storage event during hydration is remembered and ends stale",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    let releaseLoad:
      (() => void) | null =
        null;

    let saveCount =
      0;

    const persisted =
      createRuntimeEvidenceSnapshot({
        entries: [
          createRuntimeEvidenceBundle(
            result(
              "persisted-session"
            )
          ),
        ],

        authoritative:
          false,
      });

    const adapter:
      RuntimeEvidencePersistence = {
      async load() {
        await new Promise<void>(
          resolve => {
            releaseLoad =
              resolve;
          }
        );

        return {
          snapshot:
            persisted,

          authoritative:
            false,
        };
      },

      async save() {
        saveCount +=
          1;
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
      releaseLoad
    );

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "hydrating"
    );

    markRuntimeEvidenceStale();

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "hydrating"
    );

    releaseLoad?.();

    await hydration;

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "stale"
    );

    assert.match(
      getRuntimeEvidenceLifecycle().error ??
        "",
      /during hydration/i
    );

    assert.equal(
      saveCount,
      0
    );

    assert.deepEqual(
      getRuntimeEvidenceHistory()
        .entries.map(
          entry =>
            entry.sessionId
        ),
      [
        "persisted-session",
      ]
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);


test(
  "normal hydration without external change still catches up and becomes ready",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    let saveCount =
      0;

    configureRuntimeEvidencePersistence({
      async load() {
        return {
          snapshot:
            createRuntimeEvidenceSnapshot({
              entries: [
                createRuntimeEvidenceBundle(
                  result(
                    "normal-session"
                  )
                ),
              ],

              authoritative:
                false,
            }),

          authoritative:
            false,
        };
      },

      async save() {
        saveCount +=
          1;
      },

      async clear() {},
    });

    await hydrateRuntimeEvidence();

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "ready"
    );

    assert.ok(
      saveCount >
        0
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);
