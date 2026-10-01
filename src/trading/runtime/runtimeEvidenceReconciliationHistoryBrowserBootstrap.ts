import {
  createBrowserRuntimeEvidenceReconciliationHistoryPersistence,
  LOCAL_RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_STORAGE_KEY,
} from "./localRuntimeEvidenceReconciliationHistoryPersistence";

import {
  createBrowserRuntimeEvidenceReconciliationHistoryCoordinator,
} from "./runtimeEvidenceReconciliationHistoryCoordination";

import {
  configureRuntimeEvidenceReconciliationHistoryCoordinator,
  configureRuntimeEvidenceReconciliationHistoryPersistence,
  hydrateRuntimeEvidenceReconciliationHistory,
  markRuntimeEvidenceReconciliationHistoryExternalChange,
} from "./runtimeEvidenceReconciliationHistoryStore";


let browserBootstrap:
  Promise<void> | null =
    null;


let storageListenerInstalled =
  false;


function handleRuntimeEvidenceReconciliationHistoryStorageChange(
  event:
    StorageEvent
):
  void {
  if (
    event.key !==
    LOCAL_RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_STORAGE_KEY
  ) {
    return;
  }

  markRuntimeEvidenceReconciliationHistoryExternalChange();
}


function installRuntimeEvidenceReconciliationHistoryStorageListener():
  void {
  if (
    typeof window ===
      "undefined" ||
    storageListenerInstalled
  ) {
    return;
  }

  window.addEventListener(
    "storage",
    handleRuntimeEvidenceReconciliationHistoryStorageChange
  );

  storageListenerInstalled =
    true;
}


export function bootstrapRuntimeEvidenceReconciliationHistoryBrowserPersistence():
  Promise<void> {
  if (
    browserBootstrap
  ) {
    return browserBootstrap;
  }

  browserBootstrap =
    (
      async () => {
        const adapter =
          createBrowserRuntimeEvidenceReconciliationHistoryPersistence();

        const coordinator =
          createBrowserRuntimeEvidenceReconciliationHistoryCoordinator();

        configureRuntimeEvidenceReconciliationHistoryPersistence(
          adapter
        );

        configureRuntimeEvidenceReconciliationHistoryCoordinator(
          coordinator
        );

        installRuntimeEvidenceReconciliationHistoryStorageListener();

        await hydrateRuntimeEvidenceReconciliationHistory();
      }
    )();

  return browserBootstrap;
}


export function resetRuntimeEvidenceReconciliationHistoryBrowserBootstrapForTests():
  void {
  browserBootstrap =
    null;

  if (
    typeof window !==
      "undefined" &&
    storageListenerInstalled
  ) {
    window.removeEventListener(
      "storage",
      handleRuntimeEvidenceReconciliationHistoryStorageChange
    );
  }

  storageListenerInstalled =
    false;
}
