import type {
  RuntimeEvidenceReconciliationAttemptHistory,
} from "./runtimeEvidenceReconciliationHistory";


export const RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_SNAPSHOT_VERSION =
  1 as const;


export type RuntimeEvidenceReconciliationHistorySnapshot = {
  readonly version:
    typeof RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_SNAPSHOT_VERSION;

  readonly history:
    RuntimeEvidenceReconciliationAttemptHistory;

  readonly authoritative:
    false;
};


export type RuntimeEvidenceReconciliationHistoryPersistenceLoadResult = {
  readonly snapshot:
    RuntimeEvidenceReconciliationHistorySnapshot | null;

  readonly authoritative:
    false;
};


export interface RuntimeEvidenceReconciliationHistoryPersistence {
  load():
    Promise<
      RuntimeEvidenceReconciliationHistoryPersistenceLoadResult
    >;

  save(
    snapshot:
      RuntimeEvidenceReconciliationHistorySnapshot
  ):
    Promise<void>;

  clear():
    Promise<void>;
}


export function createRuntimeEvidenceReconciliationHistorySnapshot(
  history:
    RuntimeEvidenceReconciliationAttemptHistory
):
  RuntimeEvidenceReconciliationHistorySnapshot {
  return {
    version:
      RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_SNAPSHOT_VERSION,

    history,

    authoritative:
      false,
  };
}
