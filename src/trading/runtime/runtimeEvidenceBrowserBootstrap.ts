import {
  createBrowserRuntimeEvidencePersistence,
} from "./localRuntimeEvidencePersistence";

import {
  configureRuntimeEvidencePersistence,
  hydrateRuntimeEvidence,
} from "./runtimeEvidenceStore";


let runtimeEvidenceBrowserBootstrap:
  Promise<void> | null =
    null;


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

        await hydrateRuntimeEvidence();
      }
    )();

  return runtimeEvidenceBrowserBootstrap;
}


/*
 * Test-only reset of bootstrap ownership.
 *
 * This does not clear persisted browser evidence and grants no
 * runtime authority.
 */
export function resetRuntimeEvidenceBrowserBootstrapForTests():
  void {
  runtimeEvidenceBrowserBootstrap =
    null;
}
