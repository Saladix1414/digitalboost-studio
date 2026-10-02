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


function entriesEqual(
  left:
    RuntimeEvidenceReconciliationAttemptEntry,

  right:
    RuntimeEvidenceReconciliationAttemptEntry
):
  boolean {
  const {
    sequence:
      _leftSequence,

    ...leftEvidence
  } =
    left;

  const {
    sequence:
      _rightSequence,

    ...rightEvidence
  } =
    right;

  return (
    JSON.stringify(
      leftEvidence
    ) ===
    JSON.stringify(
      rightEvidence
    )
  );
}


function entryAtSequence(
  history:
    RuntimeEvidenceReconciliationAttemptHistory,

  sequence:
    number
):
  RuntimeEvidenceReconciliationAttemptEntry | undefined {
  return history.entries.find(
    entry =>
      entry.sequence ===
      sequence
  );
}


/*
 * A bounded branch may legitimately trim entries from the
 * beginning of its previous base.
 *
 * Example:
 *
 * base   = 1 ... 24
 * branch = 2 ... 25
 *
 * Requiring base to remain a literal array prefix would
 * incorrectly classify that normal retention rollover as
 * divergence.
 *
 * Instead, validate every sequence still retained by both
 * histories. If a shared retained sequence changed content,
 * the branch truly diverged.
 *
 * If neither side retains any common base sequence, lineage
 * cannot be proven without stable attempt IDs, so the merge
 * remains conservative and reports conflict.
 */
function branchMatchesRetainedBase(
  base:
    RuntimeEvidenceReconciliationAttemptHistory,

  branch:
    RuntimeEvidenceReconciliationAttemptHistory
):
  boolean {
  if (
    base.entries.length ===
    0
  ) {
    return true;
  }

  const baseFirst =
    base.entries[0]?.sequence;

  const baseLast =
    base.entries.at(-1)?.sequence;

  if (
    baseFirst ===
      undefined ||
    baseLast ===
      undefined
  ) {
    return true;
  }

  const branchFirst =
    branch.entries[0]?.sequence;

  const branchLast =
    branch.entries.at(-1)?.sequence;

  if (
    branchFirst ===
      undefined ||
    branchLast ===
      undefined
  ) {
    return false;
  }

  const overlapStart =
    Math.max(
      baseFirst,
      branchFirst
    );

  const overlapEnd =
    Math.min(
      baseLast,
      branchLast
    );

  if (
    overlapStart >
    overlapEnd
  ) {
    return false;
  }

  for (
    let sequence =
      overlapStart;

    sequence <=
      overlapEnd;

    sequence +=
      1
  ) {
    const baseEntry =
      entryAtSequence(
        base,
        sequence
      );

    const branchEntry =
      entryAtSequence(
        branch,
        sequence
      );

    if (
      !baseEntry ||
      !branchEntry ||
      !entriesEqual(
        baseEntry,
        branchEntry
      )
    ) {
      return false;
    }
  }

  return true;
}


function entriesAfterBase(
  base:
    RuntimeEvidenceReconciliationAttemptHistory,

  branch:
    RuntimeEvidenceReconciliationAttemptHistory
):
  readonly RuntimeEvidenceReconciliationAttemptEntry[] {
  const baseLast =
    base.entries.at(-1)?.sequence ??
    0;

  return branch.entries.filter(
    entry =>
      entry.sequence >
      baseLast
  );
}


function appendWithFreshSequence(
  entries:
    readonly RuntimeEvidenceReconciliationAttemptEntry[],

  entry:
    RuntimeEvidenceReconciliationAttemptEntry
):
  readonly RuntimeEvidenceReconciliationAttemptEntry[] {
  const nextSequence =
    (
      entries.at(-1)?.sequence ??
      0
    ) + 1;

  return [
    ...entries,
    {
      ...entry,

      sequence:
        nextSequence,

      authoritative:
        false,
    },
  ];
}


function mergeSuffixes(
  base:
    RuntimeEvidenceReconciliationAttemptHistory,

  remoteSuffix:
    readonly RuntimeEvidenceReconciliationAttemptEntry[],

  localSuffix:
    readonly RuntimeEvidenceReconciliationAttemptEntry[]
):
  RuntimeEvidenceReconciliationAttemptHistory {
  let entries:
    readonly RuntimeEvidenceReconciliationAttemptEntry[] = [
      ...base.entries,
    ];

  /*
   * Deterministic ordering:
   *
   * persisted / remote evidence first,
   * then local evidence.
   *
   * Concurrent branches can contain colliding sequence numbers,
   * so merged suffix entries receive fresh monotonic sequences.
   */
  for (
    const entry of remoteSuffix
  ) {
    entries =
      appendWithFreshSequence(
        entries,
        entry
      );
  }

  for (
    const entry of localSuffix
  ) {
    entries =
      appendWithFreshSequence(
        entries,
        entry
      );
  }

  return {
    entries:
      entries.slice(
        -RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
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
  const localMatchesBase =
    branchMatchesRetainedBase(
      base,
      local
    );

  const remoteMatchesBase =
    branchMatchesRetainedBase(
      base,
      remote
    );

  if (
    !localMatchesBase ||
    !remoteMatchesBase
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

  const remoteSuffix =
    entriesAfterBase(
      base,
      remote
    );

  const localSuffix =
    entriesAfterBase(
      base,
      local
    );

  return {
    status:
      "merged",

    history:
      mergeSuffixes(
        base,
        remoteSuffix,
        localSuffix
      ),

    authoritative:
      false,
  };
}
