export const RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LOCK_NAME =
  "digitalboost.trading.runtime-evidence-reconciliation-history.persistence";


export type RuntimeEvidenceReconciliationHistoryCoordinator = {
  runExclusive<T>(
    operation:
      () => Promise<T>
  ):
    Promise<T>;

  readonly crossContextSafe:
    boolean;

  readonly authoritative:
    false;
};


export function createLocalRuntimeEvidenceReconciliationHistoryCoordinator():
  RuntimeEvidenceReconciliationHistoryCoordinator {
  return {
    crossContextSafe:
      false,

    authoritative:
      false,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      return operation();
    },
  };
}


type BrowserLockManager = {
  request<T>(
    name:
      string,

    callback:
      () => Promise<T>
  ):
    Promise<T>;
};


type NavigatorWithLocks =
  Navigator & {
    readonly locks?:
      BrowserLockManager;
  };


export function createBrowserRuntimeEvidenceReconciliationHistoryCoordinator():
  RuntimeEvidenceReconciliationHistoryCoordinator {
  if (
    typeof navigator ===
      "undefined"
  ) {
    return createLocalRuntimeEvidenceReconciliationHistoryCoordinator();
  }

  const browserNavigator =
    navigator as NavigatorWithLocks;

  const lockManager =
    browserNavigator.locks;

  if (
    !lockManager
  ) {
    return createLocalRuntimeEvidenceReconciliationHistoryCoordinator();
  }

  return {
    crossContextSafe:
      true,

    authoritative:
      false,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      return lockManager.request(
        RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LOCK_NAME,
        operation
      );
    },
  };
}
