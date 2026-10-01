import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
  ApprovalBackendRevisionConflictError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  classifyApprovalRecoveryFailure,
} from "../../src/trading/risk/approvalRecoveryDiagnostics.ts";

import {
  ApprovalHttpClientError,
} from "../../src/trading/risk/approvalHttpClient.ts";


test(
  "timeout is classified as retryable HTTP evidence",
  () => {
    const result =
      classifyApprovalRecoveryFailure(
        new ApprovalHttpClientError({
          message:
            "timed out",

          code:
            "timeout",

          retryable:
            true,
        })
      );

    assert.equal(
      result.code,
      "timeout"
    );

    assert.equal(
      result.retryable,
      true
    );

    assert.equal(
      result.source,
      "http"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);


test(
  "network failure preserves retryability",
  () => {
    const result =
      classifyApprovalRecoveryFailure(
        new ApprovalHttpClientError({
          message:
            "offline",

          code:
            "network",

          retryable:
            true,
        })
      );

    assert.equal(
      result.code,
      "network"
    );

    assert.equal(
      result.retryable,
      true
    );
  }
);


test(
  "revision conflict becomes backend evidence",
  () => {
    const result =
      classifyApprovalRecoveryFailure(
        new ApprovalBackendRevisionConflictError({
          operation:
            "write",

          message:
            "revision conflict",

          expectedRevision:
            2,

          actualRevision:
            3,
        })
      );

    assert.equal(
      result.code,
      "revision-conflict"
    );

    assert.equal(
      result.source,
      "backend"
    );

    assert.equal(
      result.retryable,
      false
    );
  }
);


test(
  "backend unavailable remains retryable evidence",
  () => {
    const result =
      classifyApprovalRecoveryFailure(
        new ApprovalBackendError({
          message:
            "unavailable",

          code:
            "unavailable",

          operation:
            "read",

          retryable:
            true,
        })
      );

    assert.equal(
      result.code,
      "unavailable"
    );

    assert.equal(
      result.retryable,
      true
    );
  }
);


test(
  "unknown errors remain non authoritative",
  () => {
    const result =
      classifyApprovalRecoveryFailure(
        new Error(
          "unknown failure"
        )
      );

    assert.equal(
      result.code,
      "unknown"
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);
