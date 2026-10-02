import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidenceCoordinator,
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
  RuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  BotRuntimeSessionResult,
} from "../../src/trading/runtime/session.ts";


function result(
  sessionId:
    string,

  botId =
    "bot-test"
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
        `fingerprint-${sessionId}`,

      liveExecution:
        false,
    },
  };
}


function coordinator() {
  let active =
    false;

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
      assert.equal(
        active,
        false,
        "coordinated critical sections overlapped"
      );

      active =
        true;

      try {
        return await operation();
      } finally {
        active =
          false;
      }
    },
  };
}


test(
  "ordinary persistence merges remote evidence before save",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    let persisted:
      RuntimeEvidenceSnapshot | null =
        createRuntimeEvidenceSnapshot({
          entries: [
            createRuntimeEvidenceBundle(
              result(
                "remote-session"
              )
            ),
          ],

          authoritative:
            false,
        });

    const adapter:
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

    configureRuntimeEvidencePersistence(
      adapter
    );

    configureRuntimeEvidenceCoordinator(
      coordinator()
    );

    await hydrateRuntimeEvidence();

    recordRuntimeSessionEvidence(
      result(
        "local-session"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.ok(
      persisted
    );

    const ids =
      persisted?.history.entries.map(
        entry =>
          entry.sessionId
      ) ??
      [];

    assert.ok(
      ids.includes(
        "remote-session"
      )
    );

    assert.ok(
      ids.includes(
        "local-session"
      )
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);


test(
  "conflicting remote evidence is never overwritten",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    let persisted:
      RuntimeEvidenceSnapshot | null =
        null;

    const saves:
      RuntimeEvidenceSnapshot[] =
        [];

    const adapter:
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
        saves.push(
          structuredClone(
            snapshot
          )
        );

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

    configureRuntimeEvidencePersistence(
      adapter
    );

    configureRuntimeEvidenceCoordinator(
      coordinator()
    );

    await hydrateRuntimeEvidence();

    const local =
      result(
        "same-session",
        "bot-local"
      );

    recordRuntimeSessionEvidence(
      local
    );

    await waitForRuntimeEvidencePersistenceQueue();

    const savesBeforeConflict =
      saves.length;

    persisted =
      createRuntimeEvidenceSnapshot({
        entries: [
          createRuntimeEvidenceBundle(
            result(
              "same-session",
              "bot-remote"
            )
          ),
        ],

        authoritative:
          false,
      });

    recordRuntimeSessionEvidence(
      result(
        "second-local-session"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.equal(
      saves.length,
      savesBeforeConflict,
      "conflicting persistence must not be overwritten"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "stale"
    );

    const memoryIds =
      getRuntimeEvidenceHistory()
        .entries.map(
          entry =>
            entry.sessionId
        );

    assert.ok(
      memoryIds.includes(
        "same-session"
      )
    );

    assert.ok(
      memoryIds.includes(
        "second-local-session"
      )
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);


test(
  "local fallback coordinator remains usable and false authority",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    configureRuntimeEvidenceCoordinator({
      crossContextSafe:
        false,

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

    let persisted:
      RuntimeEvidenceSnapshot | null =
        null;

    configureRuntimeEvidencePersistence({
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
          snapshot;
      },

      async clear() {
        persisted =
          null;
      },
    });

    await hydrateRuntimeEvidence();

    recordRuntimeSessionEvidence(
      result(
        "fallback-session"
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.ok(
      persisted
    );

    assert.equal(
      getRuntimeEvidenceLifecycle().status,
      "ready"
    );

    resetRuntimeEvidenceHistoryForTests();
  }
);
