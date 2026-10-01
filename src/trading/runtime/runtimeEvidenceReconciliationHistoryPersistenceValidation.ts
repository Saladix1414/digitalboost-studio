import {
  RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT,
} from "./runtimeEvidenceReconciliationHistory";

import {
  RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_SNAPSHOT_VERSION,
} from "./runtimeEvidenceReconciliationHistoryPersistence";

import type {
  RuntimeEvidenceReconciliationAttemptEntry,
  RuntimeEvidenceReconciliationAttemptHistory,
} from "./runtimeEvidenceReconciliationHistory";

import type {
  RuntimeEvidenceReconciliationHistorySnapshot,
} from "./runtimeEvidenceReconciliationHistoryPersistence";


function isRecord(
  value:
    unknown
):
  value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}


function isStringArray(
  value:
    unknown
):
  value is readonly string[] {
  return (
    Array.isArray(
      value
    ) &&
    value.every(
      entry =>
        typeof entry ===
          "string"
    )
  );
}


function isStatus(
  value:
    unknown
):
  value is RuntimeEvidenceReconciliationAttemptEntry["status"] {
  return (
    value ===
      "merged" ||
    value ===
      "conflict" ||
    value ===
      "error" ||
    value ===
      "unavailable" ||
    value ===
      "not-stale"
  );
}


function validateEntry(
  value:
    unknown
):
  value is RuntimeEvidenceReconciliationAttemptEntry {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  return (
    Number.isInteger(
      value.sequence
    ) &&
    (
      value.sequence as number
    ) >
      0 &&
    isStatus(
      value.status
    ) &&
    isStringArray(
      value.duplicateSessionIds
    ) &&
    (
      value.conflictSessionId ===
        null ||
      typeof value.conflictSessionId ===
        "string"
    ) &&
    (
      value.error ===
        null ||
      typeof value.error ===
        "string"
    ) &&
    value.authoritative ===
      false
  );
}


function validateHistory(
  value:
    unknown
):
  value is RuntimeEvidenceReconciliationAttemptHistory {
  if (
    !isRecord(
      value
    ) ||
    !Array.isArray(
      value.entries
    ) ||
    value.authoritative !==
      false
  ) {
    return false;
  }

  if (
    value.entries.length >
    RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT
  ) {
    return false;
  }

  let previousSequence =
    0;

  for (
    const entry of
    value.entries
  ) {
    if (
      !validateEntry(
        entry
      )
    ) {
      return false;
    }

    if (
      entry.sequence <=
      previousSequence
    ) {
      return false;
    }

    previousSequence =
      entry.sequence;
  }

  return true;
}


export function validateRuntimeEvidenceReconciliationHistorySnapshot(
  value:
    unknown
):
  value is RuntimeEvidenceReconciliationHistorySnapshot {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  return (
    value.version ===
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_SNAPSHOT_VERSION &&
    value.authoritative ===
      false &&
    validateHistory(
      value.history
    )
  );
}


export function serializeRuntimeEvidenceReconciliationHistorySnapshot(
  snapshot:
    RuntimeEvidenceReconciliationHistorySnapshot
):
  string {
  if (
    !validateRuntimeEvidenceReconciliationHistorySnapshot(
      snapshot
    )
  ) {
    throw new Error(
      "Runtime evidence reconciliation history snapshot is invalid."
    );
  }

  return JSON.stringify(
    snapshot
  );
}


export function deserializeRuntimeEvidenceReconciliationHistorySnapshot(
  serialized:
    string
):
  RuntimeEvidenceReconciliationHistorySnapshot {
  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(
        serialized
      );
  } catch {
    throw new Error(
      "Runtime evidence reconciliation history persistence contains invalid JSON."
    );
  }

  if (
    !validateRuntimeEvidenceReconciliationHistorySnapshot(
      parsed
    )
  ) {
    throw new Error(
      "Runtime evidence reconciliation history persistence contains an invalid snapshot."
    );
  }

  return parsed;
}
