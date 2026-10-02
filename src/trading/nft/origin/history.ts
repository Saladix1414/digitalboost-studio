import {
  createNftOriginSnapshot,
} from "./snapshot";

import type {
  NftOriginHistory,
  NftOriginHistoryEntry,
  NftOriginRecord,
  NftOriginRevisionReason,
} from "./types";

function determineRevisionReason(
  previous:
    NftOriginRecord,
  next:
    NftOriginRecord
): NftOriginRevisionReason {
  if (
    previous.status !==
      "ARCHIVED" &&
    next.status ===
      "ARCHIVED"
  ) {
    return "ARCHIVED";
  }

  if (
    previous.context.mode !==
      next.context.mode
  ) {
    return "MODE_UPDATE";
  }

  if (
    previous.context.source.type !==
      next.context.source.type ||
    previous.context.source.reference !==
      next.context.source.reference
  ) {
    return "SOURCE_UPDATE";
  }

  return "CONTEXT_UPDATE";
}

export function createInitialNftOriginHistory(
  origin:
    NftOriginRecord
): NftOriginHistory {
  const entry:
    NftOriginHistoryEntry = {
      id:
        `origin-history-${origin.id}-1`,

      originId:
        origin.id,

      version:
        1,

      previousEntryId:
        null,

      reason:
        "INITIAL_CAPTURE",

      snapshot:
        createNftOriginSnapshot(
          origin
        ),

      capturedAt:
        origin.capturedAt,

      authoritative:
        false,
    };

  return {
    originId:
      origin.id,

    entries: [
      entry,
    ],

    authoritative:
      false,
  };
}

export function appendNftOriginHistory(
  history:
    NftOriginHistory,
  previous:
    NftOriginRecord,
  next:
    NftOriginRecord
): NftOriginHistory {
  if (
    history.originId !==
      previous.id ||
    history.originId !==
      next.id
  ) {
    throw new Error(
      "ORIGIN_HISTORY_ID_MISMATCH"
    );
  }

  const last =
    history.entries[
      history.entries.length - 1
    ];

  if (!last) {
    throw new Error(
      "ORIGIN_HISTORY_EMPTY"
    );
  }

  const previousSnapshot =
    createNftOriginSnapshot(
      previous
    );

  const nextSnapshot =
    createNftOriginSnapshot(
      next
    );

  if (
    previousSnapshot.recordHash ===
      nextSnapshot.recordHash
  ) {
    throw new Error(
      "ORIGIN_HISTORY_NO_CHANGE"
    );
  }

  const version =
    last.version + 1;

  const entry:
    NftOriginHistoryEntry = {
      id:
        `origin-history-${next.id}-${version}`,

      originId:
        next.id,

      version,

      previousEntryId:
        last.id,

      reason:
        determineRevisionReason(
          previous,
          next
        ),

      snapshot:
        nextSnapshot,

      capturedAt:
        next.capturedAt,

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
