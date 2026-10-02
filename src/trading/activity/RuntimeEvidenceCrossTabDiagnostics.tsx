import {
  useSyncExternalStore,
} from "react";

import {
  getRuntimeEvidenceReconciliationHistoryCoordinationHealth,
  subscribeRuntimeEvidenceReconciliationHistory,
} from "../runtime/runtimeEvidenceReconciliationHistoryStore";


export function RuntimeEvidenceCrossTabDiagnostics() {
  const health =
    useSyncExternalStore(
      subscribeRuntimeEvidenceReconciliationHistory,
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth,
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth
    );

  const degraded =
    !health.crossContextSafe;

  const externallyChanged =
    health.externalChangeDetected;

  if (
    !degraded &&
    !externallyChanged
  ) {
    return null;
  }

  return (
    <section
      aria-label="Runtime evidence cross-tab diagnostics"
      className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            Cross-tab evidence coordination
          </p>

          {externallyChanged ? (
            <div className="mt-3">
              <p className="text-sm font-semibold text-amber-300/85">
                External evidence change detected
              </p>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/55">
                Another browser context changed the persisted reconciliation history. Existing local evidence remains readable and no history entry was fabricated.
              </p>
            </div>
          ) : null}

          {degraded ? (
            <div className="mt-3">
              <p className="text-sm font-semibold text-white/70">
                Cross-tab coordination is degraded
              </p>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
                This browser does not provide the coordination primitive required for strongly serialized cross-context writes. Trading runtime continues independently.
              </p>
            </div>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-white/35">
            Coordination diagnostics are observational only. They do not grant approval, execute trades, or change trading authority.
          </p>
        </div>

        <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
          {health.crossContextSafe
            ? "Coordinated"
            : "Degraded"}
        </span>
      </div>
    </section>
  );
}
