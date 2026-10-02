import {
  useCallback,
  useState,
  useSyncExternalStore,
} from "react";

import {
  getRuntimeEvidenceLifecycle,
  reconcileStaleRuntimeEvidence,
  subscribeRuntimeEvidenceHistory,
  getRuntimeEvidenceCoordinationHealth,
} from "../runtime/runtimeEvidenceStore";


function lifecycleLabel(
  status:
    ReturnType<
      typeof getRuntimeEvidenceLifecycle
    >["status"]
):
  string {
  switch (
    status
  ) {
    case "idle":
      return "Idle";

    case "hydrating":
      return "Hydrating";

    case "ready":
      return "Ready";

    case "stale":
      return "Stale";

    case "reconciling":
      return "Reconciling";

    case "error":
      return "Error";
  }
}


function lifecycleDescription(
  status:
    ReturnType<
      typeof getRuntimeEvidenceLifecycle
    >["status"]
):
  string {
  switch (
    status
  ) {
    case "idle":
      return "Runtime evidence persistence has not completed bootstrap yet.";

    case "hydrating":
      return "Persisted runtime evidence is being loaded.";

    case "ready":
      return "Runtime evidence is synchronized with the current persistence view.";

    case "stale":
      return "Another browser context changed persisted runtime evidence. Existing evidence remains readable.";

    case "reconciling":
      return "Local and persisted runtime evidence are being reconciled.";

    case "error":
      return "Runtime evidence observability is degraded. Trading runtime authority is unaffected.";
  }
}


export function RuntimeEvidenceDiagnostics() {
  const lifecycle =
    useSyncExternalStore(
      subscribeRuntimeEvidenceHistory,
      getRuntimeEvidenceLifecycle,
      getRuntimeEvidenceLifecycle
    );

  const coordinationHealth =
    useSyncExternalStore(
      subscribeRuntimeEvidence,
      getRuntimeEvidenceCoordinationHealth,
      getRuntimeEvidenceCoordinationHealth
    );

  const [
    actionError,
    setActionError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const reconcile =
    useCallback(
      async () => {
        setActionError(
          null
        );

        try {
          const result =
            await reconcileStaleRuntimeEvidence();

          if (
            result.status ===
            "conflict"
          ) {
            setActionError(
              `Evidence conflict detected for session ${result.sessionId}. No evidence was overwritten.`
            );

            return;
          }

          if (
            result.status ===
            "unavailable"
          ) {
            setActionError(
              "Runtime evidence persistence is unavailable."
            );

            return;
          }

          if (
            result.status ===
            "error"
          ) {
            setActionError(
              result.error
            );
          }
        } catch (
          error
        ) {
          setActionError(
            error instanceof Error
              ? error.message
              : "Runtime evidence reconciliation failed."
          );
        }
      },
      []
    );

  const canReconcile =
    lifecycle.status ===
      "stale";

  const isReconciling =
    lifecycle.status ===
      "reconciling";

  const showDiagnostics =
    lifecycle.status !==
      "ready";

  if (
    !showDiagnostics
  ) {
    return null;
  }

  return (
    <section
      aria-label="Runtime evidence diagnostics"
      className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
              Runtime evidence
            </span>

            <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
              {lifecycleLabel(
                lifecycle.status
              )}
            </span>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            {lifecycleDescription(
              lifecycle.status
            )}
          </p>

          {!coordinationHealth.crossContextSafe ? (
            <p className="text-xs text-amber-300">
              Cross-tab runtime evidence coordination is degraded because browser Web Locks are unavailable. Evidence remains non-authoritative and storage changes still require explicit review when detected.
            </p>
          ) : null}

          {lifecycle.error ? (
            <p className="mt-2 text-sm text-amber-300/80">
              {lifecycle.error}
            </p>
          ) : null}

          {actionError ? (
            <p
              role="status"
              className="mt-2 text-sm text-amber-300/80"
            >
              {actionError}
            </p>
          ) : null}

          <p className="mt-2 text-xs leading-5 text-white/35">
            Diagnostics are observational only. Runtime evidence does not grant approval or execution authority.
          </p>
        </div>

        <button
          type="button"
          onClick={
            () => {
              void reconcile();
            }
          }
          disabled={
            !canReconcile ||
            isReconciling
          }
          className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isReconciling
            ? "Reconciling..."
            : "Reconcile evidence"}
        </button>
      </div>
    </section>
  );
}
