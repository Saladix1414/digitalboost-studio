import type {
  NftProvenanceHistory,
  NftProvenanceHistoryEntry,
  NftProvenanceRecord,
  NftProvenanceRevisionReason,
} from "./types";

import {
  snapshotNftProvenance,
} from "./snapshot";

function determineRevisionReason(
  previous:
    NftProvenanceRecord,
  next:
    NftProvenanceRecord
): NftProvenanceRevisionReason {
  if (
    next.status ===
      "ARCHIVED" &&
    previous.status !==
      "ARCHIVED"
  ) {
    return "ARCHIVED";
  }

  const evidenceChanged =
    JSON.stringify(
      previous.evidence
    ) !==
    JSON.stringify(
      next.evidence
    );

  const linksChanged =
    JSON.stringify(
      previous.links
    ) !==
    JSON.stringify(
      next.links
    );

  if (
    evidenceChanged &&
    linksChanged
  ) {
    return "EVIDENCE_AND_LINKS_UPDATED";
  }

  if (evidenceChanged) {
    return "EVIDENCE_ADDED";
  }

  return "LINK_ADDED";
}

export function createInitialNftProvenanceHistory(
  record:
    NftProvenanceRecord,
  capturedAt:
    string
): NftProvenanceHistory {
  const entry:
    NftProvenanceHistoryEntry = {
      id:
        `${record.id}:history:1`,

      provenanceId:
        record.id,

      version:
        1,

      previousEntryId:
        null,

      reason:
        "INITIAL_ASSEMBLY",

      snapshot:
        snapshotNftProvenance(
          record
        ),

      capturedAt,

      authoritative:
        false,
    };

  return {
    provenanceId:
      record.id,

    entries:
      [entry],

    authoritative:
      false,
  };
}

export function appendNftProvenanceHistory(
  history:
    NftProvenanceHistory,
  previous:
    NftProvenanceRecord,
  next:
    NftProvenanceRecord,
  capturedAt:
    string
): NftProvenanceHistory {
  if (
    history.provenanceId !==
      next.id ||
    previous.id !==
      next.id
  ) {
    throw new Error(
      "PROVENANCE_HISTORY_ID_MISMATCH"
    );
  }

  if (
    history.entries.length ===
      0
  ) {
    throw new Error(
      "PROVENANCE_HISTORY_EMPTY"
    );
  }

  const previousSnapshot =
    snapshotNftProvenance(
      previous
    );

  const nextSnapshot =
    snapshotNftProvenance(
      next
    );

  if (
    previousSnapshot.recordHash ===
      nextSnapshot.recordHash
  ) {
    throw new Error(
      "PROVENANCE_HISTORY_NO_CHANGE"
    );
  }

  const latest =
    history.entries[
      history.entries.length - 1
    ];

  const entry:
    NftProvenanceHistoryEntry = {
      id:
        `${next.id}:history:${latest.version + 1}`,

      provenanceId:
        next.id,

      version:
        latest.version + 1,

      previousEntryId:
        latest.id,

      reason:
        determineRevisionReason(
          previous,
          next
        ),

      snapshot:
        nextSnapshot,

      capturedAt,

      authoritative:
        false,
    };

  return {
    ...history,

    entries: [
      ...history.entries,
      entry,
    ],
  };
}
