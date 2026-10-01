import {
  createBrowserRuntimeEvidenceReconciliationHistoryPersistence,
} from "./localRuntimeEvidenceReconciliationHistoryPersistence";

import {
  configureRuntimeEvidenceReconciliationHistoryPersistence,
  hydrateRuntimeEvidenceReconciliationHistory,
} from "./runtimeEvidenceReconciliationHistoryStore";


let browserBootstrap:
  Promise<void> | null =
    null;


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

        configureRuntimeEvidenceReconciliationHistoryPersistence(
          adapter
        );

        await hydrateRuntimeEvidenceReconciliationHistory();
      }
    )();

  return browserBootstrap;
}


export function resetRuntimeEvidenceReconciliationHistoryBrowserBootstrapForTests():
  void {
  browserBootstrap =
    null;
}
