import {
  deserializeRuntimeEvidenceReconciliationHistorySnapshot,
  serializeRuntimeEvidenceReconciliationHistorySnapshot,
} from "./runtimeEvidenceReconciliationHistoryPersistenceValidation";

import type {
  RuntimeEvidenceReconciliationHistoryPersistence,
} from "./runtimeEvidenceReconciliationHistoryPersistence";


export const LOCAL_RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_STORAGE_KEY =
  "digitalboost.trading.runtime-evidence-reconciliation-history.v1";


export type RuntimeEvidenceReconciliationHistoryStorage = {
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
};


export function createLocalRuntimeEvidenceReconciliationHistoryPersistence(
  storage:
    RuntimeEvidenceReconciliationHistoryStorage,

  storageKey:
    string =
      LOCAL_RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_STORAGE_KEY
):
  RuntimeEvidenceReconciliationHistoryPersistence {
  return {
    async load() {
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
          deserializeRuntimeEvidenceReconciliationHistorySnapshot(
            serialized
          ),

        authoritative:
          false,
      };
    },

    async save(
      snapshot
    ) {
      storage.setItem(
        storageKey,
        serializeRuntimeEvidenceReconciliationHistorySnapshot(
          snapshot
        )
      );
    },

    async clear() {
      storage.removeItem(
        storageKey
      );
    },
  };
}


export function createBrowserRuntimeEvidenceReconciliationHistoryPersistence():
  RuntimeEvidenceReconciliationHistoryPersistence | null {
  if (
    typeof window ===
      "undefined"
  ) {
    return null;
  }

  return createLocalRuntimeEvidenceReconciliationHistoryPersistence(
    window.localStorage
  );
}
