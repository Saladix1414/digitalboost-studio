import type {
  RuntimeEvidenceHistory,
} from "./runtimeEvidenceStore";


export const RUNTIME_EVIDENCE_SNAPSHOT_VERSION =
  1 as const;


export type RuntimeEvidenceSnapshot = {
  readonly version:
    typeof RUNTIME_EVIDENCE_SNAPSHOT_VERSION;

  readonly history:
    RuntimeEvidenceHistory;

  readonly authoritative:
    false;
};


export type RuntimeEvidencePersistenceLoadResult = {
  readonly snapshot:
    RuntimeEvidenceSnapshot | null;

  readonly authoritative:
    false;
};


export interface RuntimeEvidencePersistence {
  load():
    Promise<
      RuntimeEvidencePersistenceLoadResult
    >;

  save(
    snapshot:
      RuntimeEvidenceSnapshot
  ):
    Promise<void>;

  clear():
    Promise<void>;
}


export function createRuntimeEvidenceSnapshot(
  history:
    RuntimeEvidenceHistory
):
  RuntimeEvidenceSnapshot {
  return {
    version:
      RUNTIME_EVIDENCE_SNAPSHOT_VERSION,

    history,

    authoritative:
      false,
  };
}
