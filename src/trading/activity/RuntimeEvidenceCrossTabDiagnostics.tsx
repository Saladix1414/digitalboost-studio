import {
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getRuntimeEvidenceReconciliationHistoryCoordinationHealth,
  refreshRuntimeEvidenceReconciliationHistoryFromPersistence,
  subscribeRuntimeEvidenceReconciliationHistory,
} from "../runtime/runtimeEvidenceReconciliationHistoryStore";


export function RuntimeEvidenceCrossTabDiagnostics() {
  const health =
    useSyncExternalStore(
      subscribeRuntimeEvidenceReconciliationHistory,
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth,
      getRuntimeEvidenceReconciliationHistoryCoordinationHealth
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );

  const [
    refreshError,
    setRefreshError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const degraded =
    !health.crossContextSafe;

  const externallyChanged =
    health.externalChangeDetected;

  const refresh =
    useCallback(
      async () => {
        if (
          refreshing ||
          !externallyChanged
        ) {
          return;
        }

        setRefreshing(
          true
        );

        setRefreshError(
          null
        );

        try {
          const result =
            await refreshRuntimeEvidenceReconciliationHistoryFromPersistence();

          if (
            result.status ===
            "conflict"
          ) {
            setRefreshError(
              "The persisted history diverged from the last known baseline. Local evidence was preserved."
            );

            return;
          }

          if (
            result.status ===
            "unavailable"
          ) {
            setRefreshError(
              "Reconciliation-history persistence is unavailable."
            );

            return;
          }

          if (
            result.status ===
            "error"
          ) {
            setRefreshError(
              result.error
            );
          }
        } finally {
          setRefreshing(
            false
          );
        }
      },
      [
        externallyChanged,
        refreshing,
      ]
    );

  if (
    !degraded &&
    !externallyChanged &&
    !refreshError
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
                Another browser context changed the persisted reconciliation history. Review and merge it explicitly before assuming this view is current.
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

          {refreshError ? (
            <p
              role="status"
              className="mt-3 max-w-3xl text-sm leading-6 text-amber-300/80"
            >
              {refreshError}
            </p>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-white/35">
            Coordination diagnostics are observational only. Refreshing evidence does not grant approval, execute trades, or change trading authority.
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
            {health.crossContextSafe
              ? "Coordinated"
              : "Degraded"}
          </span>

          {externallyChanged ? (
            <button
              type="button"
              onClick={
                () => {
                  void refresh();
                }
              }
              disabled={
                refreshing
              }
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh evidence"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
