import type {
  ApprovalRecoveryDiagnosticCode,
} from "./approvalRecoveryDiagnostics";


export type ApprovalRecoveryAttemptAction =
  | "rehydrate"
  | "recover-local";


export type ApprovalRecoveryAttemptStatus =
  | "idle"
  | "retrying"
  | "succeeded"
  | "failed";


export type ApprovalRecoveryAttempt = {
  readonly status:
    ApprovalRecoveryAttemptStatus;

  readonly action:
    ApprovalRecoveryAttemptAction | null;

  readonly diagnosticCode:
    ApprovalRecoveryDiagnosticCode | null;

  readonly authoritative:
    false;
};


export function createIdleApprovalRecoveryAttempt():
  ApprovalRecoveryAttempt {
  return {
    status:
      "idle",

    action:
      null,

    diagnosticCode:
      null,

    authoritative:
      false,
  };
}


export function beginApprovalRecoveryAttempt(
  action:
    ApprovalRecoveryAttemptAction
):
  ApprovalRecoveryAttempt {
  return {
    status:
      "retrying",

    action,

    diagnosticCode:
      null,

    authoritative:
      false,
  };
}


export function completeApprovalRecoveryAttempt(
  action:
    ApprovalRecoveryAttemptAction
):
  ApprovalRecoveryAttempt {
  return {
    status:
      "succeeded",

    action,

    diagnosticCode:
      null,

    authoritative:
      false,
  };
}


export function failApprovalRecoveryAttempt(
  action:
    ApprovalRecoveryAttemptAction,

  diagnosticCode:
    ApprovalRecoveryDiagnosticCode | null
):
  ApprovalRecoveryAttempt {
  return {
    status:
      "failed",

    action,

    diagnosticCode,

    authoritative:
      false,
  };
}
