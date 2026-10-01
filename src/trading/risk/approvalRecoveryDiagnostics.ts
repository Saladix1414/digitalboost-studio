import {
  ApprovalBackendError,
} from "./approvalBackendTransactions";

import {
  ApprovalHttpClientError,
} from "./approvalHttpClient";


export type ApprovalRecoveryDiagnosticCode =
  | "aborted"
  | "timeout"
  | "network"
  | "invalid-response"
  | "revision-conflict"
  | "idempotency-conflict"
  | "unavailable"
  | "invalid-state"
  | "not-found"
  | "internal"
  | "unknown";


export type ApprovalRecoveryDiagnostic = {
  readonly code:
    ApprovalRecoveryDiagnosticCode;

  readonly retryable:
    boolean;

  readonly message:
    string;

  readonly source:
    "http"
    | "backend"
    | "unknown";

  readonly authoritative:
    false;
};


export function classifyApprovalRecoveryFailure(
  error:
    unknown
):
  ApprovalRecoveryDiagnostic {
  if (
    error instanceof
      ApprovalHttpClientError
  ) {
    return {
      code:
        error.code,

      retryable:
        error.retryable,

      message:
        error.message,

      source:
        "http",

      authoritative:
        false,
    };
  }

  if (
    error instanceof
      ApprovalBackendError
  ) {
    return {
      code:
        error.code,

      retryable:
        error.retryable,

      message:
        error.message,

      source:
        "backend",

      authoritative:
        false,
    };
  }

  return {
    code:
      "unknown",

    retryable:
      false,

    message:
      error instanceof Error
        ? error.message
        : "Unknown approval persistence failure.",

    source:
      "unknown",

    authoritative:
      false,
  };
}
