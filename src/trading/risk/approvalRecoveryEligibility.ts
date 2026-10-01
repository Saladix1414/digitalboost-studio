import type {
  ApprovalPersistenceMode,
} from "./approvalPersistenceMode";

import type {
  ApprovalRecoveryDiagnostic,
} from "./approvalRecoveryDiagnostics";


export type ApprovalRecoveryEligibilityReason =
  | "local-reset"
  | "retryable-remote-failure"
  | "non-retryable-remote-failure"
  | "missing-remote-diagnostic";


export type ApprovalRecoveryEligibility = {
  readonly allowed:
    boolean;

  readonly reason:
    ApprovalRecoveryEligibilityReason;

  readonly authoritative:
    false;
};


export function resolveApprovalRecoveryEligibility(
  mode:
    ApprovalPersistenceMode,

  diagnostic:
    ApprovalRecoveryDiagnostic | null
):
  ApprovalRecoveryEligibility {
  if (
    mode ===
    "local"
  ) {
    return {
      allowed:
        true,

      reason:
        "local-reset",

      authoritative:
        false,
    };
  }

  if (
    diagnostic ===
    null
  ) {
    return {
      allowed:
        false,

      reason:
        "missing-remote-diagnostic",

      authoritative:
        false,
    };
  }

  if (
    diagnostic.retryable
  ) {
    return {
      allowed:
        true,

      reason:
        "retryable-remote-failure",

      authoritative:
        false,
    };
  }

  return {
    allowed:
      false,

    reason:
      "non-retryable-remote-failure",

    authoritative:
      false,
  };
}
