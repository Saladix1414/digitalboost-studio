import type {
  ApprovalRecoveryAttemptAction,
} from "./approvalRecoveryAttempt";

import type {
  ApprovalRecoveryDiagnosticCode,
} from "./approvalRecoveryDiagnostics";


export const APPROVAL_RECOVERY_HISTORY_LIMIT =
  12;


export type ApprovalRecoveryAttemptHistoryStatus =
  | "succeeded"
  | "failed";


export type ApprovalRecoveryAttemptHistoryEntry = {
  readonly sequence:
    number;

  readonly action:
    ApprovalRecoveryAttemptAction;

  readonly status:
    ApprovalRecoveryAttemptHistoryStatus;

  readonly diagnosticCode:
    ApprovalRecoveryDiagnosticCode | null;

  readonly authoritative:
    false;
};


export type ApprovalRecoveryAttemptHistory = {
  readonly entries:
    readonly ApprovalRecoveryAttemptHistoryEntry[];

  readonly authoritative:
    false;
};


export function createApprovalRecoveryAttemptHistory():
  ApprovalRecoveryAttemptHistory {
  return {
    entries:
      [],

    authoritative:
      false,
  };
}


export function appendApprovalRecoveryAttemptHistory(
  history:
    ApprovalRecoveryAttemptHistory,

  entry:
    Omit<
      ApprovalRecoveryAttemptHistoryEntry,
      "sequence"
      | "authoritative"
    >
):
  ApprovalRecoveryAttemptHistory {
  const nextSequence =
    (
      history.entries[
        history.entries.length - 1
      ]?.sequence ??
      0
    ) + 1;

  const nextEntry:
    ApprovalRecoveryAttemptHistoryEntry = {
      sequence:
        nextSequence,

      action:
        entry.action,

      status:
        entry.status,

      diagnosticCode:
        entry.diagnosticCode,

      authoritative:
        false,
    };

  const entries = [
    ...history.entries,
    nextEntry,
  ].slice(
    -APPROVAL_RECOVERY_HISTORY_LIMIT
  );

  return {
    entries,

    authoritative:
      false,
  };
}
