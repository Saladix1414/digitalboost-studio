import assert from "node:assert/strict";
import test from "node:test";

import {
  createApprovalBootstrapFailurePolicy,
} from "../../src/trading/risk/approvalBootstrapFailurePolicy.ts";

import {
  resolveApprovalRecoveryPresentation,
} from "../../src/trading/risk/approvalRecoveryAction.ts";


test(
  "local mode resolves to storage reset",
  () => {
    const result =
      resolveApprovalRecoveryPresentation(
        createApprovalBootstrapFailurePolicy(
          "local"
        )
      );

    assert.deepEqual(
      result,
      {
        action:
          "reset-local-storage",

        label:
          "RESET APPROVAL STORAGE",

        clearsPersistence:
          true,

        authoritative:
          false,
      }
    );
  }
);


test(
  "remote mode resolves to rehydrate-only retry",
  () => {
    const result =
      resolveApprovalRecoveryPresentation(
        createApprovalBootstrapFailurePolicy(
          "remote"
        )
      );

    assert.deepEqual(
      result,
      {
        action:
          "retry-remote-state",

        label:
          "RETRY REMOTE APPROVAL STATE",

        clearsPersistence:
          false,

        authoritative:
          false,
      }
    );
  }
);
