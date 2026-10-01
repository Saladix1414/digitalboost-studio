import type {
  ApprovalRemoteRetryDecision,
} from "./approvalRemoteRetry";


export const APPROVAL_REMOTE_RETRY_HISTORY_LIMIT =
  24;


export type ApprovalRemoteRetryOperation =
  | "write"
  | "clear";


export type ApprovalRemoteRetryAttemptStatus =
  | "attempt"
  | "retry"
  | "succeeded"
  | "failed";


export type ApprovalRemoteRetryAttemptEvent = {
  readonly attempt:
    number;

  readonly status:
    ApprovalRemoteRetryAttemptStatus;

  readonly reason:
    ApprovalRemoteRetryDecision["reason"] | null;

  readonly authoritative:
    false;
};


export type ApprovalRemoteRetryHistoryEntry = {
  readonly sequence:
    number;

  readonly operation:
    ApprovalRemoteRetryOperation;

  readonly attempt:
    number;

  readonly status:
    ApprovalRemoteRetryAttemptStatus;

  readonly reason:
    ApprovalRemoteRetryDecision["reason"] | null;

  readonly idempotencyProtected:
    boolean;

  /*
   * Opaque observational correlation reference.
   *
   * This is the persistence mutation identity already created
   * by the approval store. It is evidence only and never
   * participates in retry, CAS, approval, or execution.
   */
  readonly mutationRef:
    string | null;

  readonly authoritative:
    false;
};


export type ApprovalRemoteRetryHistory = {
  readonly entries:
    readonly ApprovalRemoteRetryHistoryEntry[];

  readonly authoritative:
    false;
};


export function createApprovalRemoteRetryHistory():
  ApprovalRemoteRetryHistory {
  return {
    entries:
      [],

    authoritative:
      false,
  };
}


export function appendApprovalRemoteRetryHistory(
  history:
    ApprovalRemoteRetryHistory,

  input: {
    readonly operation:
      ApprovalRemoteRetryOperation;

    readonly attempt:
      number;

    readonly status:
      ApprovalRemoteRetryAttemptStatus;

    readonly reason:
      ApprovalRemoteRetryDecision["reason"] | null;

    readonly idempotencyProtected:
      boolean;

    readonly mutationRef:
      string | null;
  }
):
  ApprovalRemoteRetryHistory {
  const previousSequence =
    history.entries.at(
      -1
    )?.sequence ??
    0;

  const entry:
    ApprovalRemoteRetryHistoryEntry = {
    sequence:
      previousSequence +
      1,

    operation:
      input.operation,

    attempt:
      input.attempt,

    status:
      input.status,

    reason:
      input.reason,

    idempotencyProtected:
      input.idempotencyProtected,

    mutationRef:
      input.mutationRef,

    authoritative:
      false,
  };

  const entries =
    [
      ...history.entries,
      entry,
    ].slice(
      -APPROVAL_REMOTE_RETRY_HISTORY_LIMIT
    );

  return {
    entries,

    authoritative:
      false,
  };
}
