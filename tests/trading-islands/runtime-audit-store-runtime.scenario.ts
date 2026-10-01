import assert from "node:assert/strict";
import test from "node:test";

import {
  RUNTIME_AUDIT_HISTORY_LIMIT,
  getRuntimeAuditHistory,
  recordRuntimeAuditEvidence,
  resetRuntimeAuditHistoryForTests,
  subscribeRuntimeAuditHistory,
} from "../../src/trading/runtime/runtimeAuditStore.ts";

import type {
  RuntimeAuditRecord,
} from "../../src/trading/runtime/auditTypes.ts";


function audit(
  index:
    number
):
  RuntimeAuditRecord {
  return {
    sessionId:
      `session-${index}`,

    botId:
      "bot-1",

    strategyId:
      "strategy-1",

    approval: {
      riskReviewId:
        `review-${index}`,

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      approvalScope:
        "paper-only",

      approvalVerified:
        true,

      bindingFingerprint:
        `fingerprint-${index}`,
    },

    decision:
      "paper-filled",

    events:
      [],

    authoritative:
      false,
  };
}


test(
  "runtime audit evidence can be recorded and read",
  () => {
    resetRuntimeAuditHistoryForTests();

    recordRuntimeAuditEvidence(
      audit(
        1
      )
    );

    const history =
      getRuntimeAuditHistory();

    assert.equal(
      history.entries.length,
      1
    );

    assert.equal(
      history.entries[0]?.sessionId,
      "session-1"
    );

    assert.equal(
      history.authoritative,
      false
    );
  }
);


test(
  "runtime audit history is bounded",
  () => {
    resetRuntimeAuditHistoryForTests();

    for (
      let index = 0;
      index <
        RUNTIME_AUDIT_HISTORY_LIMIT + 8;
      index +=
        1
    ) {
      recordRuntimeAuditEvidence(
        audit(
          index
        )
      );
    }

    const history =
      getRuntimeAuditHistory();

    assert.equal(
      history.entries.length,
      RUNTIME_AUDIT_HISTORY_LIMIT
    );

    assert.equal(
      history.entries.at(
        -1
      )?.sessionId,
      `session-${
        RUNTIME_AUDIT_HISTORY_LIMIT + 7
      }`
    );
  }
);


test(
  "runtime audit subscribers observe changes",
  () => {
    resetRuntimeAuditHistoryForTests();

    let notifications =
      0;

    const unsubscribe =
      subscribeRuntimeAuditHistory(
        () => {
          notifications +=
            1;
        }
      );

    recordRuntimeAuditEvidence(
      audit(
        1
      )
    );

    unsubscribe();

    recordRuntimeAuditEvidence(
      audit(
        2
      )
    );

    assert.equal(
      notifications,
      1
    );
  }
);
