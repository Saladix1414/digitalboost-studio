import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVAL_RECOVERY_HISTORY_LIMIT,
  appendApprovalRecoveryAttemptHistory,
  createApprovalRecoveryAttemptHistory,
} from "../../src/trading/risk/approvalRecoveryAttemptHistory.ts";


test(
  "recovery history starts empty",
  () => {
    assert.deepEqual(
      createApprovalRecoveryAttemptHistory(),
      {
        entries:
          [],

        authoritative:
          false,
      }
    );
  }
);


test(
  "recovery history assigns monotonic sequence numbers",
  () => {
    let history =
      createApprovalRecoveryAttemptHistory();

    history =
      appendApprovalRecoveryAttemptHistory(
        history,
        {
          action:
            "rehydrate",

          status:
            "succeeded",

          diagnosticCode:
            null,
        }
      );

    history =
      appendApprovalRecoveryAttemptHistory(
        history,
        {
          action:
            "rehydrate",

          status:
            "failed",

          diagnosticCode:
            "timeout",
        }
      );

    assert.equal(
      history.entries[0]?.sequence,
      1
    );

    assert.equal(
      history.entries[1]?.sequence,
      2
    );
  }
);


test(
  "recovery history preserves diagnostic evidence",
  () => {
    const history =
      appendApprovalRecoveryAttemptHistory(
        createApprovalRecoveryAttemptHistory(),
        {
          action:
            "rehydrate",

          status:
            "failed",

          diagnosticCode:
            "network",
        }
      );

    assert.equal(
      history.entries[0]?.diagnosticCode,
      "network"
    );

    assert.equal(
      history.entries[0]?.authoritative,
      false
    );
  }
);


test(
  "recovery history remains bounded",
  () => {
    let history =
      createApprovalRecoveryAttemptHistory();

    for (
      let index = 0;
      index <
      APPROVAL_RECOVERY_HISTORY_LIMIT + 5;
      index += 1
    ) {
      history =
        appendApprovalRecoveryAttemptHistory(
          history,
          {
            action:
              "rehydrate",

            status:
              "succeeded",

            diagnosticCode:
              null,
          }
        );
    }

    assert.equal(
      history.entries.length,
      APPROVAL_RECOVERY_HISTORY_LIMIT
    );

    assert.equal(
      history.entries.at(-1)?.sequence,
      APPROVAL_RECOVERY_HISTORY_LIMIT + 5
    );
  }
);


test(
  "history container remains non authoritative",
  () => {
    const history =
      createApprovalRecoveryAttemptHistory();

    assert.equal(
      history.authoritative,
      false
    );
  }
);
