import {
  LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY,
  createBrowserRuntimeEvidencePersistence,
} from "./localRuntimeEvidencePersistence";

import {
  configureRuntimeEvidencePersistence,
  hydrateRuntimeEvidence,
  markRuntimeEvidenceStale,
} from "./runtimeEvidenceStore";


let runtimeEvidenceBrowserBootstrap:
  Promise<void> | null =
    null;


let runtimeEvidenceStorageListenerInstalled =
  false;


function handleRuntimeEvidenceStorageChange(
  event:
    StorageEvent
):
  void {
  /*
   * Browser storage events are emitted in other documents,
   * not the document that performed the write.
   *
   * Only the canonical runtime evidence key is relevant.
   */
  if (
    event.key !==
    LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY
  ) {
    return;
  }

  markRuntimeEvidenceStale();
}


function installRuntimeEvidenceStorageListener():
  void {
  if (
    runtimeEvidenceStorageListenerInstalled
  ) {
    return;
  }

  if (
    typeof window ===
      "undefined" ||
    typeof window.addEventListener !==
      "function"
  ) {
    return;
  }

  window.addEventListener(
    "storage",
    handleRuntimeEvidenceStorageChange
  );

  runtimeEvidenceStorageListenerInstalled =
    true;
}


/*
 * Browser evidence bootstrap is idempotent within the current
 * JavaScript context.
 *
 * Multiple React renders, mounts or consumers share one bootstrap
 * promise and therefore cannot independently reconfigure or hydrate
 * the runtime evidence store.
 *
 * Evidence hydration is observational only and never participates in
 * runtime approval or execution decisions.
 */
export function bootstrapRuntimeEvidenceBrowserPersistence():
  Promise<void> {
  if (
    runtimeEvidenceBrowserBootstrap
  ) {
    return runtimeEvidenceBrowserBootstrap;
  }

  runtimeEvidenceBrowserBootstrap =
    (
      async () => {
        const persistence =
          createBrowserRuntimeEvidencePersistence();

        configureRuntimeEvidencePersistence(
          persistence
        );

        installRuntimeEvidenceStorageListener();

        await hydrateRuntimeEvidence();
      }
    )();

  return runtimeEvidenceBrowserBootstrap;
}


/*
 * Test-only reset of bootstrap ownership.
 *
 * Browser listener ownership is reset as well so runtime scenarios
 * can install an isolated test window.
 *
 * This does not clear persisted browser evidence and grants no
 * runtime authority.
 */
export function resetRuntimeEvidenceBrowserBootstrapForTests():
  void {
  if (
    runtimeEvidenceStorageListenerInstalled &&
    typeof window !==
      "undefined" &&
    typeof window.removeEventListener ===
      "function"
  ) {
    window.removeEventListener(
      "storage",
      handleRuntimeEvidenceStorageChange
    );
  }

  runtimeEvidenceStorageListenerInstalled =
    false;

  runtimeEvidenceBrowserBootstrap =
    null;
}
