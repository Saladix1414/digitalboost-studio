import type {
  RuntimeEvidencePersistence,
  RuntimeEvidencePersistenceLoadResult,
  RuntimeEvidenceSnapshot,
} from "./runtimeEvidencePersistence";

import {
  deserializeRuntimeEvidenceSnapshot,
  serializeRuntimeEvidenceSnapshot,
} from "./runtimeEvidencePersistenceValidation";


export const LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY =
  "digitalboost.trading.runtime-evidence.v1";


export interface RuntimeEvidenceStorage {
  getItem(
    key:
      string
  ):
    string | null;

  setItem(
    key:
      string,

    value:
      string
  ):
    void;

  removeItem(
    key:
      string
  ):
    void;
}


export function createLocalRuntimeEvidencePersistence(
  storage:
    RuntimeEvidenceStorage,

  storageKey =
    LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY
):
  RuntimeEvidencePersistence {
  return {
    async load():
      Promise<
        RuntimeEvidencePersistenceLoadResult
      > {
      const serialized =
        storage.getItem(
          storageKey
        );

      if (
        serialized ===
        null
      ) {
        return {
          snapshot:
            null,

          authoritative:
            false,
        };
      }

      return {
        snapshot:
          deserializeRuntimeEvidenceSnapshot(
            serialized
          ),

        authoritative:
          false,
      };
    },

    async save(
      snapshot:
        RuntimeEvidenceSnapshot
    ):
      Promise<void> {
      storage.setItem(
        storageKey,
        serializeRuntimeEvidenceSnapshot(
          snapshot
        )
      );
    },

    async clear():
      Promise<void> {
      storage.removeItem(
        storageKey
      );
    },
  };
}


export function createBrowserRuntimeEvidencePersistence():
  RuntimeEvidencePersistence | null {
  if (
    typeof window ===
      "undefined" ||
    !window.localStorage
  ) {
    return null;
  }

  return createLocalRuntimeEvidencePersistence(
    window.localStorage
  );
}
