import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveApprovalRecoveryEligibility,
} from "../../src/trading/risk/approvalRecoveryEligibility.ts";

import type {
  ApprovalRecoveryDiagnostic,
} from "../../src/trading/risk/approvalRecoveryDiagnostics.ts";


function diagnostic(
  code:
    ApprovalRecoveryDiagnostic["code"],

  retryable:
    boolean
):
  ApprovalRecoveryDiagnostic {
  return {
    code,

    retryable,

    message:
      code,

    source:
      "http",

    authoritative:
      false,
  };
}


test(
  "local recovery remains allowed",
  () => {
    const result =
      resolveApprovalRecoveryEligibility(
        "local",
        null
      );

    assert.deepEqual(
      result,
      {
        allowed:
          true,

        reason:
          "local-reset",

        authoritative:
          false,
      }
    );
  }
);


test(
  "remote timeout may be retried",
  () => {
    const result =
      resolveApprovalRecoveryEligibility(
        "remote",
        diagnostic(
          "timeout",
          true
        )
      );

    assert.equal(
      result.allowed,
      true
    );

    assert.equal(
      result.reason,
      "retryable-remote-failure"
    );
  }
);


test(
  "remote network failure may be retried",
  () => {
    const result =
      resolveApprovalRecoveryEligibility(
        "remote",
        diagnostic(
          "network",
          true
        )
      );

    assert.equal(
      result.allowed,
      true
    );
  }
);


test(
  "remote unavailable failure may be retried",
  () => {
    const result =
      resolveApprovalRecoveryEligibility(
        "remote",
        {
          code:
            "unavailable",

          retryable:
            true,

          message:
            "unavailable",

          source:
            "backend",

          authoritative:
            false,
        }
      );

    assert.equal(
      result.allowed,
      true
    );
  }
);


for (
  const code of [
    "invalid-response",
    "revision-conflict",
    "idempotency-conflict",
    "invalid-state",
    "not-found",
    "internal",
  ] as const
) {
  test(
    `remote ${code} is blocked when non retryable`,
    () => {
      const result =
        resolveApprovalRecoveryEligibility(
          "remote",
          diagnostic(
            code,
            false
          )
        );

      assert.equal(
        result.allowed,
        false
      );

      assert.equal(
        result.reason,
        "non-retryable-remote-failure"
      );
    }
  );
}


test(
  "remote retry is blocked without diagnostic evidence",
  () => {
    const result =
      resolveApprovalRecoveryEligibility(
        "remote",
        null
      );

    assert.deepEqual(
      result,
      {
        allowed:
          false,

        reason:
          "missing-remote-diagnostic",

        authoritative:
          false,
      }
    );
  }
);
