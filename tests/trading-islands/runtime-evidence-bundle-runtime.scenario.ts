import assert from "node:assert/strict";
import test from "node:test";

import {
  RUNTIME_EVIDENCE_HISTORY_LIMIT,
  createRuntimeEvidenceBundle,
  getRuntimeEvidenceHistory,
  recordRuntimeSessionEvidence,
  resetRuntimeEvidenceHistoryForTests,
  subscribeRuntimeEvidenceHistory,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import type {
  BotRuntimeSessionResult,
} from "../../src/trading/runtime/session.ts";


function result(
  index:
    number
):
  BotRuntimeSessionResult {
  const sessionId =
    `runtime-bot-1-${index}`;

  return {
    session: {
      id:
        sessionId,

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      events: [
        {
          id:
            `${sessionId}-event-1`,

          sequence:
            1,

          type:
            "session_started",

          botId:
            "bot-1",

          strategyId:
            "strategy-1",

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

        ledger: [
          {
            id:
              "paper-ledger-1",

            kind:
              "deposit",

            amount:
              10_000,

            balanceAfter:
              10_000,

            note:
              "Initial paper capital",
          },
          {
            id:
              "paper-ledger-2",

            kind:
              "trade",

            amount:
              -100,

            balanceAfter:
              9_900,

            note:
              "BUY 0.01 BTC",
          },
        ],
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


test(
  "bundle derives audit and ledger from the same session",
  () => {
    const bundle =
      createRuntimeEvidenceBundle(
        result(
          1
        )
      );

    assert.equal(
      bundle.sessionId,
      "runtime-bot-1-1"
    );

    assert.equal(
      bundle.audit.sessionId,
      bundle.sessionId
    );

    assert.equal(
      bundle.ledger.length,
      2
    );

    for (
      const evidence of
      bundle.ledger
    ) {
      assert.equal(
        evidence.sessionId,
        bundle.sessionId
      );

      assert.equal(
        evidence.botId,
        bundle.botId
      );

      assert.equal(
        evidence.strategyId,
        bundle.strategyId
      );

      assert.equal(
        evidence.authoritative,
        false
      );
    }

    assert.equal(
      bundle.authoritative,
      false
    );
  }
);


test(
  "one session recording emits one subscriber notification",
  () => {
    resetRuntimeEvidenceHistoryForTests();

    let notifications =
      0;

    const unsubscribe =
      subscribeRuntimeEvidenceHistory(
        () => {
          notifications +=
            1;
        }
      );

    recordRuntimeSessionEvidence(
      result(
        1
      )
    );

    unsubscribe();

    assert.equal(
      notifications,
      1
    );

    assert.equal(
      getRuntimeEvidenceHistory()
        .entries.length,
      1
    );
  }
);


test(
  "runtime evidence history is bounded by sessions",
  () => {
    resetRuntimeEvidenceHistoryForTests();

    for (
      let index = 1;
      index <=
        RUNTIME_EVIDENCE_HISTORY_LIMIT + 7;
      index +=
        1
    ) {
      recordRuntimeSessionEvidence(
        result(
          index
        )
      );
    }

    const history =
      getRuntimeEvidenceHistory();

    assert.equal(
      history.entries.length,
      RUNTIME_EVIDENCE_HISTORY_LIMIT
    );

    assert.equal(
      history.entries.at(
        -1
      )?.sessionId,
      `runtime-bot-1-${
        RUNTIME_EVIDENCE_HISTORY_LIMIT + 7
      }`
    );
  }
);


test(
  "ledger ids reused across sessions remain bundle-correlated",
  () => {
    resetRuntimeEvidenceHistoryForTests();

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

    const entries =
      getRuntimeEvidenceHistory()
        .entries;

    assert.equal(
      entries[0]?.ledger[0]?.entry.id,
      entries[1]?.ledger[0]?.entry.id
    );

    assert.notEqual(
      entries[0]?.sessionId,
      entries[1]?.sessionId
    );
  }
);
