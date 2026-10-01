import {
  RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT,
} from "./runtimeEvidenceReconciliationHistory";

import type {
  RuntimeEvidenceReconciliationAttemptEntry,
  RuntimeEvidenceReconciliationAttemptHistory,
} from "./runtimeEvidenceReconciliationHistory";


export type RuntimeEvidenceReconciliationHistoryMergeSuccess = {
  readonly status:
    "merged";

  readonly history:
    RuntimeEvidenceReconciliationAttemptHistory;

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationHistoryMergeConflict = {
  readonly status:
    "conflict";

  readonly reason:
    "base-diverged";

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationHistoryMergeResult =
  | RuntimeEvidenceReconciliationHistoryMergeSuccess
  | RuntimeEvidenceReconciliationHistoryMergeConflict;


function comparableEntry(
  entry:
    RuntimeEvidenceReconciliationAttemptEntry
):
  Omit<
    RuntimeEvidenceReconciliationAttemptEntry,
    "sequence"
  > {
  return {
    status:
      entry.status,

    duplicateSessionIds:
      entry.duplicateSessionIds,

    conflictSessionId:
      entry.conflictSessionId,

    error:
      entry.error,

    authoritative:
      false,
  };
}


function entriesEqual(
  left:
    RuntimeEvidenceReconciliationAttemptEntry,

  right:
    RuntimeEvidenceReconciliationAttemptEntry
):
  boolean {
  return (
    JSON.stringify(
      comparableEntry(
        left
      )
    ) ===
    JSON.stringify(
      comparableEntry(
        right
      )
    )
  );
}


function hasBasePrefix(
  history:
    RuntimeEvidenceReconciliationAttemptHistory,

  base:
    RuntimeEvidenceReconciliationAttemptHistory
):
  boolean {
  if (
    history.entries.length <
    base.entries.length
  ) {
    return false;
  }

  return base.entries.every(
    (
      entry,
      index
    ) =>
      entriesEqual(
        entry,
        history.entries[
          index
        ]!
      )
  );
}


function resequence(
  entries:
    readonly RuntimeEvidenceReconciliationAttemptEntry[]
):
  RuntimeEvidenceReconciliationAttemptHistory {
  const bounded =
    entries.slice(
      -RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
    );

  return {
    entries:
      bounded.map(
        (
          entry,
          index
        ) => ({
          ...entry,

          sequence:
            index +
            1,

          authoritative:
            false,
        })
      ),

    authoritative:
      false,
  };
}


export function mergeRuntimeEvidenceReconciliationHistories(
  base:
    RuntimeEvidenceReconciliationAttemptHistory,

  local:
    RuntimeEvidenceReconciliationAttemptHistory,

  remote:
    RuntimeEvidenceReconciliationAttemptHistory
):
  RuntimeEvidenceReconciliationHistoryMergeResult {
  if (
    !hasBasePrefix(
      local,
      base
    ) ||
    !hasBasePrefix(
      remote,
      base
    )
  ) {
    return {
      status:
        "conflict",

      reason:
        "base-diverged",

      authoritative:
        false,
    };
  }

  const baseLength =
    base.entries.length;

  const remoteSuffix =
    remote.entries.slice(
      baseLength
    );

  const localSuffix =
    local.entries.slice(
      baseLength
    );

  return {
    status:
      "merged",

    history:
      resequence([
        ...base.entries,
        ...remoteSuffix,
        ...localSuffix,
      ]),

    authoritative:
      false,
  };
}
