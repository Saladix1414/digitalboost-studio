import assert from "node:assert/strict";
import test from "node:test";

import {
  beginApprovalRecoveryAttempt,
  completeApprovalRecoveryAttempt,
  createIdleApprovalRecoveryAttempt,
  failApprovalRecoveryAttempt,
} from "../../src/trading/risk/approvalRecoveryAttempt.ts";


test(
  "recovery attempt starts idle",
  () => {
    assert.deepEqual(
      createIdleApprovalRecoveryAttempt(),
      {
        status:
          "idle",

        action:
          null,

        diagnosticCode:
          null,

        authoritative:
          false,
      }
    );
  }
);


test(
  "rehydration attempt enters retrying",
  () => {
    const result =
      beginApprovalRecoveryAttempt(
        "rehydrate"
      );

    assert.equal(
      result.status,
      "retrying"
    );

    assert.equal(
      result.action,
      "rehydrate"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);


test(
  "successful attempt records completion",
  () => {
    const result =
      completeApprovalRecoveryAttempt(
        "rehydrate"
      );

    assert.equal(
      result.status,
      "succeeded"
    );

    assert.equal(
      result.diagnosticCode,
      null
    );
  }
);


test(
  "failed attempt records diagnostic evidence",
  () => {
    const result =
      failApprovalRecoveryAttempt(
        "rehydrate",
        "timeout"
      );

    assert.deepEqual(
      result,
      {
        status:
          "failed",

        action:
          "rehydrate",

        diagnosticCode:
          "timeout",

        authoritative:
          false,
      }
    );
  }
);


test(
  "local recovery action is explicit",
  () => {
    const result =
      beginApprovalRecoveryAttempt(
        "recover-local"
      );

    assert.equal(
      result.action,
      "recover-local"
    );
  }
);
