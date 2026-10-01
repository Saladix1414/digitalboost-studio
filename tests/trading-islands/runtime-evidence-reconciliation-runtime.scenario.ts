import assert from "node:assert/strict";
import test from "node:test";

import {
  RUNTIME_EVIDENCE_HISTORY_LIMIT,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";

import {
  reconcileRuntimeEvidenceHistories,
} from "../../src/trading/runtime/runtimeEvidenceReconciliation.ts";

import type {
  RuntimeEvidenceBundle,
  RuntimeEvidenceHistory,
} from "../../src/trading/runtime/runtimeEvidenceStore.ts";


function bundle(
  sessionId:
    string,

  options: {
    botId?:
      string;

    strategyId?:
      string;

    reviewId?:
      string;
  } = {}
):
  RuntimeEvidenceBundle {
  const botId =
    options.botId ??
    "bot-1";

  const strategyId =
    options.strategyId ??
    "strategy-1";

  return {
    sessionId,

    botId,

    strategyId,

    audit: {
      sessionId,

      botId,

      strategyId,

      approval: {
        riskReviewId:
          options.reviewId ??
          "review-1",

        botId,

        strategyId,

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


test(
  "reconciliation unions distinct sessions",
  () => {
    const result =
      reconcileRuntimeEvidenceHistories(
        history(
          bundle(
            "runtime-bot-a-origin-a-1"
          )
        ),
        history(
          bundle(
            "runtime-bot-b-origin-b-1"
          )
        )
      );

    assert.equal(
      result.status,
      "merged"
    );

    if (
      result.status !==
      "merged"
    ) {
      return;
    }

    assert.deepEqual(
      result.history.entries.map(
        entry =>
          entry.sessionId
      ),
      [
        "runtime-bot-a-origin-a-1",
        "runtime-bot-b-origin-b-1",
      ]
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);


test(
  "identical session evidence is deduplicated",
  () => {
    const shared =
      bundle(
        "runtime-bot-a-origin-a-1"
      );

    const result =
      reconcileRuntimeEvidenceHistories(
        history(
          shared
        ),
        history(
          structuredClone(
            shared
          )
        )
      );

    assert.equal(
      result.status,
      "merged"
    );

    if (
      result.status !==
      "merged"
    ) {
      return;
    }

    assert.equal(
      result.history.entries.length,
      1
    );

    assert.deepEqual(
      result.duplicateSessionIds,
      [
        "runtime-bot-a-origin-a-1",
      ]
    );
  }
);


test(
  "same session id with different evidence is rejected",
  () => {
    const result =
      reconcileRuntimeEvidenceHistories(
        history(
          bundle(
            "runtime-bot-a-origin-a-1",
            {
              reviewId:
                "review-1",
            }
          )
        ),
        history(
          bundle(
            "runtime-bot-a-origin-a-1",
            {
              reviewId:
                "review-2",
            }
          )
        )
      );

    assert.equal(
      result.status,
      "conflict"
    );

    if (
      result.status !==
      "conflict"
    ) {
      return;
    }

    assert.equal(
      result.conflict.sessionId,
      "runtime-bot-a-origin-a-1"
    );

    assert.equal(
      result.conflict.reason,
      "session-content-mismatch"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);


test(
  "reconciliation is commutative for valid histories",
  () => {
    const left =
      history(
        bundle(
          "runtime-bot-z-origin-z-2"
        ),
        bundle(
          "runtime-bot-a-origin-a-1"
        )
      );

    const right =
      history(
        bundle(
          "runtime-bot-m-origin-m-4"
        )
      );

    const first =
      reconcileRuntimeEvidenceHistories(
        left,
        right
      );

    const second =
      reconcileRuntimeEvidenceHistories(
        right,
        left
      );

    assert.equal(
      first.status,
      "merged"
    );

    assert.equal(
      second.status,
      "merged"
    );

    if (
      first.status !==
        "merged" ||
      second.status !==
        "merged"
    ) {
      return;
    }

    assert.deepEqual(
      first.history,
      second.history
    );
  }
);


test(
  "reconciliation does not mutate source histories or bundles",
  () => {
    const firstBundle =
      bundle(
        "runtime-bot-z-origin-z-2"
      );

    const secondBundle =
      bundle(
        "runtime-bot-a-origin-a-1"
      );

    const local =
      history(
        firstBundle
      );

    const persisted =
      history(
        secondBundle
      );

    const localBefore =
      structuredClone(
        local
      );

    const persistedBefore =
      structuredClone(
        persisted
      );

    reconcileRuntimeEvidenceHistories(
      local,
      persisted
    );

    assert.deepEqual(
      local,
      localBefore
    );

    assert.deepEqual(
      persisted,
      persistedBefore
    );

    assert.equal(
      local.entries[0],
      firstBundle
    );

    assert.equal(
      persisted.entries[0],
      secondBundle
    );
  }
);


test(
  "reconciled history remains bounded",
  () => {
    const entries =
      Array.from(
        {
          length:
            RUNTIME_EVIDENCE_HISTORY_LIMIT +
            12,
        },
        (
          _,
          index
        ) =>
          bundle(
            `runtime-bot-${String(
              index
            ).padStart(
              3,
              "0"
            )}-origin-${String(
              index
            ).padStart(
              3,
              "0"
            )}-1`
          )
      );

    const midpoint =
      Math.floor(
        entries.length /
        2
      );

    const result =
      reconcileRuntimeEvidenceHistories(
        history(
          ...entries.slice(
            0,
            midpoint
          )
        ),
        history(
          ...entries.slice(
            midpoint
          )
        )
      );

    assert.equal(
      result.status,
      "merged"
    );

    if (
      result.status !==
      "merged"
    ) {
      return;
    }

    assert.equal(
      result.history.entries.length,
      RUNTIME_EVIDENCE_HISTORY_LIMIT
    );

    assert.equal(
      result.history.authoritative,
      false
    );
  }
);


test(
  "canonical ordering does not depend on source array order",
  () => {
    const a =
      bundle(
        "runtime-bot-a-origin-a-1"
      );

    const b =
      bundle(
        "runtime-bot-b-origin-b-1"
      );

    const c =
      bundle(
        "runtime-bot-c-origin-c-1"
      );

    const first =
      reconcileRuntimeEvidenceHistories(
        history(
          c,
          a
        ),
        history(
          b
        )
      );

    const second =
      reconcileRuntimeEvidenceHistories(
        history(
          b
        ),
        history(
          a,
          c
        )
      );

    assert.equal(
      first.status,
      "merged"
    );

    assert.equal(
      second.status,
      "merged"
    );

    if (
      first.status !==
        "merged" ||
      second.status !==
        "merged"
    ) {
      return;
    }

    assert.deepEqual(
      first.history.entries.map(
        entry =>
          entry.sessionId
      ),
      second.history.entries.map(
        entry =>
          entry.sessionId
      )
    );
  }
);
