import {
  useSyncExternalStore,
} from "react";

import {
  getRuntimeEvidenceReconciliationHistory,
  subscribeRuntimeEvidenceReconciliationHistory,
} from "../runtime/runtimeEvidenceReconciliationHistoryStore";

import type {
  RuntimeEvidenceReconciliationAttemptEntry,
} from "../runtime/runtimeEvidenceReconciliationHistory";


function statusLabel(
  status:
    RuntimeEvidenceReconciliationAttemptEntry["status"]
):
  string {
  switch (
    status
  ) {
    case "merged":
      return "Merged";

    case "conflict":
      return "Conflict";

    case "error":
      return "Error";

    case "unavailable":
      return "Unavailable";

    case "not-stale":
      return "Ignored";
  }
}


function description(
  entry:
    RuntimeEvidenceReconciliationAttemptEntry
):
  string {
  switch (
    entry.status
  ) {
    case "merged":
      return entry.duplicateSessionIds.length > 0
        ? `${entry.duplicateSessionIds.length} duplicate session reference(s) were safely collapsed.`
        : "Local and persisted runtime evidence were reconciled.";

    case "conflict":
      return entry.conflictSessionId
        ? `Conflicting evidence was detected for session ${entry.conflictSessionId}. No overwrite was performed.`
        : "Conflicting runtime evidence was detected. No overwrite was performed.";

    case "error":
      return entry.error ??
        "Runtime evidence reconciliation failed.";

    case "unavailable":
      return "Runtime evidence persistence was unavailable.";

    case "not-stale":
      return "Reconciliation was requested while evidence was not stale.";
  }
}


export function RuntimeEvidenceReconciliationHistory() {
  const history =
    useSyncExternalStore(
      subscribeRuntimeEvidenceReconciliationHistory,
      getRuntimeEvidenceReconciliationHistory,
      getRuntimeEvidenceReconciliationHistory
    );

  const entries =
    history.entries.slice(
      -6
    ).reverse();

  if (
    entries.length ===
    0
  ) {
    return null;
  }

  return (
    <section
      aria-label="Runtime evidence reconciliation history"
      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
            Evidence reconciliation
          </p>

          <p className="mt-1 text-sm text-white/50">
            Observational history of explicit reconciliation attempts.
          </p>
        </div>

        <span className="text-xs text-white/30">
          {history.entries.length} recorded
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {entries.map(
          entry => (
            <div
              key={
                entry.sequence
              }
              className="rounded-lg border border-white/[0.07] bg-black/10 px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white/70">
                  Attempt #{entry.sequence}
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                  {statusLabel(
                    entry.status
                  )}
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-white/45">
                {description(
                  entry
                )}
              </p>
            </div>
          )
        )}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-white/30">
        Reconciliation history is evidence only and never grants trading authority.
      </p>
    </section>
  );
}
