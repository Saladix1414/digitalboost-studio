import type {
  RuntimeAuditRecord,
} from "./auditTypes";


export const RUNTIME_AUDIT_HISTORY_LIMIT =
  24;


export type RuntimeAuditEvidenceHistory = {
  readonly entries:
    readonly RuntimeAuditRecord[];

  readonly authoritative:
    false;
};


type RuntimeAuditStoreListener =
  () => void;


let history:
  RuntimeAuditEvidenceHistory = {
    entries:
      [],

    authoritative:
      false,
  };


const listeners =
  new Set<
    RuntimeAuditStoreListener
  >();


function emitRuntimeAuditHistoryChange():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
}


export function subscribeRuntimeAuditHistory(
  listener:
    RuntimeAuditStoreListener
):
  () => void {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}


export function getRuntimeAuditHistory():
  RuntimeAuditEvidenceHistory {
  return history;
}


export function recordRuntimeAuditEvidence(
  audit:
    RuntimeAuditRecord
):
  RuntimeAuditEvidenceHistory {
  const nextEntries = [
    ...history.entries,
    audit,
  ];

  history = {
    entries:
      nextEntries.slice(
        -RUNTIME_AUDIT_HISTORY_LIMIT
      ),

    authoritative:
      false,
  };

  emitRuntimeAuditHistoryChange();

  return history;
}


export function resetRuntimeAuditHistoryForTests():
  void {
  history = {
    entries:
      [],

    authoritative:
      false,
  };

  emitRuntimeAuditHistoryChange();
}
