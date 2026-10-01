import assert from "node:assert/strict";
import test from "node:test";

import {
  configureRuntimeEvidencePersistence,
  getRuntimeEvidenceHistory,
  getRuntimeEvidenceLifecycle,
  hydrateRuntimeEvidence,
  recordRuntimeSessionEvidence,
  resetRuntimeEvidenceHistoryForTests,
  waitForRuntimeEvidencePersistenceQueue,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import type {
  RuntimeEvidencePersistence,
  RuntimeEvidenceSnapshot,
} from "../../src/trading/runtime/runtimeEvidencePersistence.ts";

import type {
  BotRuntimeSessionResult,
} from "../../src/trading/runtime/session.ts";


function result(
  index:
    number
):
  BotRuntimeSessionResult {
  const sessionId =
    `runtime-bot-1-origin-${index}`;

  return {
    session: {
      id:
        sessionId,

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      events:
        [],

      completed:
        true,

      authoritative:
        false,
    },

    runtime: {
      botId:
        "bot-1",

      decision:
        "paper-filled",

      account: {
        cash:
          9_900,

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
        `review-${index}`,

      approvalBotId:
        "bot-1",

      approvalStrategyId:
        "strategy-1",

      approvalBindingFingerprint:
        `fingerprint-${index}`,

      liveExecution:
        false,
    },
  };
}


function persistence(
  options: {
    loadSnapshot?:
      RuntimeEvidenceSnapshot | null;

    loadError?:
      Error;

    saveError?:
      Error;

    saveDelayMs?:
      number;
  } = {}
):
  RuntimeEvidencePersistence & {
    saves:
      RuntimeEvidenceSnapshot[];
  } {
  const saves:
    RuntimeEvidenceSnapshot[] =
      [];

  return {
    saves,

    async load() {
      if (
        options.loadError
      ) {
        throw options.loadError;
      }

      return {
        snapshot:
          options.loadSnapshot ??
          null,

        authoritative:
          false,
      };
    },

    async save(
      snapshot
    ) {
      if (
        options.saveDelayMs
      ) {
        await new Promise<void>(
          resolve =>
            setTimeout(
              resolve,
              options.saveDelayMs
            )
        );
      }

      if (
        options.saveError
      ) {
        throw options.saveError;
      }

      saves.push(
        snapshot
      );
    },

    async clear() {
      return;
    },
  };
}


test(
  "no persistence adapter still hydrates safely",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

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
  }
);


test(
  "hydration restores persisted observational history",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const source =
      persistence();

    configureRuntimeEvidencePersistence(
      source
    );

    recordRuntimeSessionEvidence(
      result(
        1
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    const snapshot =
      source.saves[0];

    assert.ok(
      snapshot
    );

    resetRuntimeEvidenceHistoryForTests();

    const restored =
      persistence({
        loadSnapshot:
          snapshot,
      });

    configureRuntimeEvidencePersistence(
      restored
    );

    await hydrateRuntimeEvidence();

    assert.equal(
      getRuntimeEvidenceHistory()
        .entries.length,
      1
    );

    assert.equal(
      getRuntimeEvidenceHistory()
        .entries[0]?.sessionId,
      "runtime-bot-1-origin-1"
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "ready"
    );
  }
);


test(
  "hydration failure degrades evidence without erasing memory",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    recordRuntimeSessionEvidence(
      result(
        1
      )
    );

    const adapter =
      persistence({
        loadError:
          new Error(
            "corrupt evidence"
          ),
      });

    configureRuntimeEvidencePersistence(
      adapter
    );

    await hydrateRuntimeEvidence();

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "error"
    );

    assert.match(
      getRuntimeEvidenceLifecycle()
        .error ??
        "",
      /corrupt evidence/
    );

    assert.equal(
      getRuntimeEvidenceHistory()
        .entries.length,
      1
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .authoritative,
      false
    );
  }
);


test(
  "persistence failure does not reject runtime evidence recording",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const adapter =
      persistence({
        saveError:
          new Error(
            "storage unavailable"
          ),
      });

    configureRuntimeEvidencePersistence(
      adapter
    );

    const recorded =
      recordRuntimeSessionEvidence(
        result(
          1
        )
      );

    assert.equal(
      recorded.entries.length,
      1
    );

    await waitForRuntimeEvidencePersistenceQueue();

    /*
     * Allow the best-effort persistence continuation to publish
     * lifecycle degradation after the queue settles.
     */
    await Promise.resolve();

    assert.equal(
      getRuntimeEvidenceHistory()
        .entries.length,
      1
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
  }
);


test(
  "rapid evidence writes persist in recording order",
  async () => {
    resetRuntimeEvidenceHistoryForTests();

    const adapter =
      persistence({
        saveDelayMs:
          5,
      });

    configureRuntimeEvidencePersistence(
      adapter
    );

    recordRuntimeSessionEvidence(
      result(
        1
      )
    );

    recordRuntimeSessionEvidence(
      result(
        2
      )
    );

    recordRuntimeSessionEvidence(
      result(
        3
      )
    );

    await waitForRuntimeEvidencePersistenceQueue();

    assert.equal(
      adapter.saves.length,
      3
    );

    assert.deepEqual(
      adapter.saves.map(
        snapshot =>
          snapshot.history.entries
            .at(
              -1
            )
            ?.sessionId
      ),
      [
        "runtime-bot-1-origin-1",
        "runtime-bot-1-origin-2",
        "runtime-bot-1-origin-3",
      ]
    );

    assert.equal(
      getRuntimeEvidenceLifecycle()
        .status,
      "ready"
    );
  }
);
