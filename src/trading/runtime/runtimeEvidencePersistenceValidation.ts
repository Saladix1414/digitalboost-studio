import {
  RUNTIME_EVIDENCE_HISTORY_LIMIT,
} from "./runtimeEvidenceConstants";

import {
  RUNTIME_EVIDENCE_SNAPSHOT_VERSION,
} from "./runtimeEvidencePersistence";

import type {
  RuntimeEvidenceBundle,
  RuntimeEvidenceHistory,
  RuntimeLedgerEvidenceEntry,
} from "./runtimeEvidenceStore";

import type {
  RuntimeEvidenceSnapshot,
} from "./runtimeEvidencePersistence";


function isRecord(
  value:
    unknown
):
  value is Record<
    string,
    unknown
  > {
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


function isString(
  value:
    unknown
):
  value is string {
  return (
    typeof value ===
    "string"
  );
}


function isBooleanFalse(
  value:
    unknown
):
  value is false {
  return (
    value ===
    false
  );
}


function validateLedgerEvidenceEntry(
  value:
    unknown
):
  value is RuntimeLedgerEvidenceEntry {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  if (
    !isString(
      value.sessionId
    ) ||
    !isString(
      value.botId
    ) ||
    !isString(
      value.strategyId
    ) ||
    !isBooleanFalse(
      value.authoritative
    )
  ) {
    return false;
  }

  if (
    !isRecord(
      value.entry
    )
  ) {
    return false;
  }

  return (
    isString(
      value.entry.id
    ) &&
    (
      value.entry.kind ===
        "deposit" ||
      value.entry.kind ===
        "trade" ||
      value.entry.kind ===
        "fee"
    ) &&
    typeof value.entry.amount ===
      "number" &&
    Number.isFinite(
      value.entry.amount
    ) &&
    typeof value.entry.balanceAfter ===
      "number" &&
    Number.isFinite(
      value.entry.balanceAfter
    ) &&
    isString(
      value.entry.note
    )
  );
}


function validateRuntimeEvidenceBundle(
  value:
    unknown
):
  value is RuntimeEvidenceBundle {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  if (
    !isString(
      value.sessionId
    ) ||
    !isString(
      value.botId
    ) ||
    !isString(
      value.strategyId
    ) ||
    !isBooleanFalse(
      value.authoritative
    )
  ) {
    return false;
  }

  if (
    !isRecord(
      value.audit
    ) ||
    !Array.isArray(
      value.ledger
    )
  ) {
    return false;
  }

  if (
    value.audit.sessionId !==
      value.sessionId ||
    value.audit.botId !==
      value.botId ||
    value.audit.strategyId !==
      value.strategyId ||
    value.audit.authoritative !==
      false
  ) {
    return false;
  }

  return value.ledger.every(
    entry =>
      validateLedgerEvidenceEntry(
        entry
      ) &&
      entry.sessionId ===
        value.sessionId &&
      entry.botId ===
        value.botId &&
      entry.strategyId ===
        value.strategyId
  );
}


function validateRuntimeEvidenceHistory(
  value:
    unknown
):
  value is RuntimeEvidenceHistory {
  if (
    !isRecord(
      value
    ) ||
    !Array.isArray(
      value.entries
    ) ||
    !isBooleanFalse(
      value.authoritative
    )
  ) {
    return false;
  }

  if (
    value.entries.length >
    RUNTIME_EVIDENCE_HISTORY_LIMIT
  ) {
    return false;
  }

  const seenSessionIds =
    new Set<
      string
    >();

  for (
    const entry of
    value.entries
  ) {
    if (
      !validateRuntimeEvidenceBundle(
        entry
      )
    ) {
      return false;
    }

    if (
      seenSessionIds.has(
        entry.sessionId
      )
    ) {
      return false;
    }

    seenSessionIds.add(
      entry.sessionId
    );
  }

  return true;
}


export function validateRuntimeEvidenceSnapshot(
  value:
    unknown
):
  value is RuntimeEvidenceSnapshot {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  return (
    value.version ===
      RUNTIME_EVIDENCE_SNAPSHOT_VERSION &&
    isBooleanFalse(
      value.authoritative
    ) &&
    validateRuntimeEvidenceHistory(
      value.history
    )
  );
}


export function serializeRuntimeEvidenceSnapshot(
  snapshot:
    RuntimeEvidenceSnapshot
):
  string {
  if (
    !validateRuntimeEvidenceSnapshot(
      snapshot
    )
  ) {
    throw new Error(
      "Runtime evidence snapshot is invalid."
    );
  }

  return JSON.stringify(
    snapshot
  );
}


export function deserializeRuntimeEvidenceSnapshot(
  serialized:
    string
):
  RuntimeEvidenceSnapshot {
  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(
        serialized
      );
  } catch {
    throw new Error(
      "Runtime evidence persistence contains invalid JSON."
    );
  }

  if (
    !validateRuntimeEvidenceSnapshot(
      parsed
    )
  ) {
    throw new Error(
      "Runtime evidence persistence contains an invalid snapshot."
    );
  }

  return parsed;
}
