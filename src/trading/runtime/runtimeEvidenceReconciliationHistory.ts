export const RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT =
  24 as const;


export type RuntimeEvidenceReconciliationAttemptStatus =
  | "merged"
  | "conflict"
  | "error"
  | "unavailable"
  | "not-stale";


export type RuntimeEvidenceReconciliationAttemptEntry = {
  readonly sequence:
    number;

  readonly status:
    RuntimeEvidenceReconciliationAttemptStatus;

  readonly duplicateSessionIds:
    readonly string[];

  readonly conflictSessionId:
    string | null;

  readonly error:
    string | null;

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationAttemptHistory = {
  readonly entries:
    readonly RuntimeEvidenceReconciliationAttemptEntry[];

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationAttemptInput = {
  readonly status:
    RuntimeEvidenceReconciliationAttemptStatus;

  readonly duplicateSessionIds?:
    readonly string[];

  readonly conflictSessionId?:
    string | null;

  readonly error?:
    string | null;
};


export function createRuntimeEvidenceReconciliationAttemptHistory():
  RuntimeEvidenceReconciliationAttemptHistory {
  return {
    entries:
      [],

    authoritative:
      false,
  };
}


export function appendRuntimeEvidenceReconciliationAttempt(
  history:
    RuntimeEvidenceReconciliationAttemptHistory,

  input:
    RuntimeEvidenceReconciliationAttemptInput
):
  RuntimeEvidenceReconciliationAttemptHistory {
  const previousSequence =
    history.entries.at(
      -1
    )?.sequence ??
    0;

  const entry:
    RuntimeEvidenceReconciliationAttemptEntry = {
      sequence:
        previousSequence +
        1,

      status:
        input.status,

      duplicateSessionIds:
        [
          ...(
            input.duplicateSessionIds ??
            []
          ),
        ],

      conflictSessionId:
        input.conflictSessionId ??
        null,

      error:
        input.error ??
        null,

      authoritative:
        false,
    };

  return {
    entries: [
      ...history.entries,
      entry,
    ].slice(
      -RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
    ),

    authoritative:
      false,
  };
}
