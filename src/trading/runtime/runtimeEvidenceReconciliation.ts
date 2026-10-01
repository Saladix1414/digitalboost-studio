import {
  RUNTIME_EVIDENCE_HISTORY_LIMIT,
} from "./runtimeEvidenceStore";

import type {
  RuntimeEvidenceBundle,
  RuntimeEvidenceHistory,
} from "./runtimeEvidenceStore";


export type RuntimeEvidenceReconciliationConflict = {
  readonly sessionId:
    string;

  readonly reason:
    "session-content-mismatch";

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationSuccess = {
  readonly status:
    "merged";

  readonly history:
    RuntimeEvidenceHistory;

  readonly duplicateSessionIds:
    readonly string[];

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationFailure = {
  readonly status:
    "conflict";

  readonly conflict:
    RuntimeEvidenceReconciliationConflict;

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationResult =
  | RuntimeEvidenceReconciliationSuccess
  | RuntimeEvidenceReconciliationFailure;


/*
 * Reconciliation order is canonical, not chronological.
 *
 * Runtime session ids are collision-resistant identities, but they do
 * not encode a globally comparable wall-clock timestamp across browser
 * contexts.
 *
 * Sorting by sessionId guarantees both contexts derive the same bounded
 * history from the same set of bundles.
 */
function compareRuntimeEvidenceBundles(
  left:
    RuntimeEvidenceBundle,

  right:
    RuntimeEvidenceBundle
):
  number {
  return left.sessionId.localeCompare(
    right.sessionId
  );
}


function canonicalize(
  value:
    unknown
):
  unknown {
  if (
    Array.isArray(
      value
    )
  ) {
    return value.map(
      canonicalize
    );
  }

  if (
    typeof value ===
      "object" &&
    value !==
      null
  ) {
    const record =
      value as Record<
        string,
        unknown
      >;

    return Object.fromEntries(
      Object.keys(
        record
      )
        .sort()
        .map(
          key => [
            key,
            canonicalize(
              record[key]
            ),
          ]
        )
    );
  }

  return value;
}


function runtimeEvidenceBundlesEqual(
  left:
    RuntimeEvidenceBundle,

  right:
    RuntimeEvidenceBundle
):
  boolean {
  return (
    JSON.stringify(
      canonicalize(
        left
      )
    ) ===
    JSON.stringify(
      canonicalize(
        right
      )
    )
  );
}


export function reconcileRuntimeEvidenceHistories(
  local:
    RuntimeEvidenceHistory,

  persisted:
    RuntimeEvidenceHistory
):
  RuntimeEvidenceReconciliationResult {
  const bySessionId =
    new Map<
      string,
      RuntimeEvidenceBundle
    >();

  const duplicateSessionIds =
    new Set<
      string
    >();

  for (
    const bundle of
    local.entries
  ) {
    bySessionId.set(
      bundle.sessionId,
      bundle
    );
  }

  for (
    const bundle of
    persisted.entries
  ) {
    const existing =
      bySessionId.get(
        bundle.sessionId
      );

    if (
      !existing
    ) {
      bySessionId.set(
        bundle.sessionId,
        bundle
      );

      continue;
    }

    if (
      !runtimeEvidenceBundlesEqual(
        existing,
        bundle
      )
    ) {
      return {
        status:
          "conflict",

        conflict: {
          sessionId:
            bundle.sessionId,

          reason:
            "session-content-mismatch",

          authoritative:
            false,
        },

        authoritative:
          false,
      };
    }

    duplicateSessionIds.add(
      bundle.sessionId
    );
  }

  const entries =
    Array.from(
      bySessionId.values()
    )
      .sort(
        compareRuntimeEvidenceBundles
      )
      .slice(
        -RUNTIME_EVIDENCE_HISTORY_LIMIT
      );

  return {
    status:
      "merged",

    history: {
      entries,

      authoritative:
        false,
    },

    duplicateSessionIds:
      Array.from(
        duplicateSessionIds
      ).sort(),

    authoritative:
      false,
  };
}
