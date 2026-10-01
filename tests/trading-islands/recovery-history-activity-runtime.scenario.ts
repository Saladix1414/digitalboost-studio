import assert from "node:assert/strict";
import test from "node:test";

import {
  getApprovalRecoveryAttemptHistory,
  recordApprovalRecoveryAttemptHistory,
  resetApprovalRecoveryAttemptHistoryForTests,
} from "../../src/trading/risk/approvalRecoveryAttemptHistoryStore.ts";


test(
  "shared recovery history exposes recorded evidence",
  () => {
    resetApprovalRecoveryAttemptHistoryForTests();

    recordApprovalRecoveryAttemptHistory({
      action:
        "rehydrate",

      status:
        "failed",

      diagnosticCode:
        "timeout",
    });

    const history =
      getApprovalRecoveryAttemptHistory();

    assert.equal(
      history.entries.length,
      1
    );

    assert.equal(
      history.entries[0]?.diagnosticCode,
      "timeout"
    );

    assert.equal(
      history.entries[0]?.authoritative,
      false
    );
  }
);


test(
  "shared recovery history remains bounded",
  () => {
    resetApprovalRecoveryAttemptHistoryForTests();

    for (
      let index = 0;
      index < 20;
      index += 1
    ) {
      recordApprovalRecoveryAttemptHistory({
        action:
          "rehydrate",

        status:
          "succeeded",

        diagnosticCode:
          null,
      });
    }

    assert.equal(
      getApprovalRecoveryAttemptHistory()
        .entries.length,
      12
    );
  }
);
