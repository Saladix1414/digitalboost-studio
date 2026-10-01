import {
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  RuntimeEvidenceDiagnostics,
} from "./RuntimeEvidenceDiagnostics";

import {
  RuntimeEvidenceReconciliationHistory,
} from "./RuntimeEvidenceReconciliationHistory";

import {
  getRuntimeEvidenceHistory,
  subscribeRuntimeEvidenceHistory,
} from "../runtime";

import {
  useApprovalRepositoryStore,
} from "../risk/useApprovalRepositoryStore";

import {
  activityFromPaperLedgerEvidence,
  activityFromRecoveryAttemptHistoryEntry,
  activityFromRemoteRetryHistoryEntry,
  activityFromReviewChainIntegrity,
  activityFromReviewHistoryEntry,
  activityFromRuntimeAudit,
  activityFromRuntimeAuditSummary,
} from "./builders";

import type {
  TradingActivityItem,
} from "./types";

export function ActivityWorkspace() {
  const {
    state:
      approvalRepository,

    recoveryAttemptHistory,

    remoteRetryHistory,
  } =
    useApprovalRepositoryStore();

  const runtimeEvidenceHistory =
    useSyncExternalStore(
      subscribeRuntimeEvidenceHistory,
      getRuntimeEvidenceHistory,
      getRuntimeEvidenceHistory
    );


  const activity =
    useMemo<
      readonly TradingActivityItem[]
    >(
      () => {
        const items:
          TradingActivityItem[] =
            [];

        let sequence =
          1;

        /*
         * Approval activity must come only from repository evidence
         * that already exists. Activity never creates a review.
         */
        if (
          approvalRepository.history
        ) {
          for (
            const entry of
            approvalRepository.history.entries
          ) {
            items.push(
              activityFromReviewHistoryEntry(
                entry,
                sequence
              )
            );

            sequence +=
              1;
          }

          /*
           * Chain integrity is derived from the persisted review
           * history itself. It is evidence about that history and
           * cannot create approval authority.
           */
          items.push(
            activityFromReviewChainIntegrity(
              approvalRepository.history,
              sequence
            )
          );

          sequence +=
            1;
        }

        /*
         * Recovery attempts are shared observational evidence only.
         */
        for (
          const entry of
          recoveryAttemptHistory.entries
        ) {
          items.push(
            activityFromRecoveryAttemptHistoryEntry(
              entry,
              sequence
            )
          );

          sequence +=
            1;
        }

        /*
         * Remote retry attempts are shared observational evidence.
         * Activity does not create or influence retry decisions.
         */
        for (
          const entry of
          remoteRetryHistory.entries
        ) {
          items.push(
            activityFromRemoteRetryHistoryEntry(
              entry,
              sequence
            )
          );

          sequence +=
            1;
        }

        /*
         * Each completed paper runtime is consumed as one correlated
         * evidence bundle. Activity never joins independent stores.
         */
        for (
          const bundle of
          runtimeEvidenceHistory.entries
        ) {
          const runtimeItems =
            activityFromRuntimeAudit(
              bundle.audit,
              sequence
            );

          items.push(
            ...runtimeItems
          );

          sequence +=
            runtimeItems.length;

          for (
            const evidence of
            bundle.ledger
          ) {
            items.push(
              activityFromPaperLedgerEvidence(
                evidence,
                sequence
              )
            );

            sequence +=
              1;
          }

          items.push(
            activityFromRuntimeAuditSummary(
              bundle.audit,
              sequence
            )
          );

          sequence +=
            1;
        }

        return items;
      },
      [
        approvalRepository.history,
        recoveryAttemptHistory,
        remoteRetryHistory,
        runtimeEvidenceHistory,
      ]
    );

  return (
    <section className="ti-activity">
      <RuntimeEvidenceDiagnostics />
      <RuntimeEvidenceReconciliationHistory />
      <header className="ti-activity__header">
        <div>
          <span className="ti-label">
            Trading Activity
          </span>

          <h2>
            Unified operational timeline
          </h2>

          <p>
            Recorded approval, recovery and persistence evidence are projected
            into one timeline without manufacturing operational events.
          </p>
        </div>

        <div className="ti-activity__mode">
          READ-ONLY PROJECTION
        </div>
      </header>

      <section className="ti-activity__panel">
        <header>
          <div>
            <span className="ti-label">
              Timeline
            </span>

            <strong>
              {activity.length} recorded items
            </strong>
          </div>
        </header>

        <div className="ti-activity__timeline">
          {activity.map(
            (
              item
            ) => (
              <article
                key={
                  item.id
                }
                className={`ti-activity__item ti-activity__item--${item.severity}`}
              >
                <div className="ti-activity__sequence">
                  {String(
                    item.sequence
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="ti-activity__body">
                  <div className="ti-activity__title-row">
                    <div>
                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {item.message}
                      </p>
                    </div>

                    <span
                      className={`ti-activity__authority ti-activity__authority--${item.authority}`}
                    >
                      {item.authority ===
                      "approval"
                        ? "APPROVAL AUTHORITY"
                        : "NON-AUTHORITATIVE"}
                    </span>
                  </div>

                  <div className="ti-activity__meta">
                    <span>
                      SOURCE · {item.source}
                    </span>

                    {item.botId && (
                      <span>
                        BOT · {item.botId}
                      </span>
                    )}

                    {item.strategyId && (
                      <span>
                        STRATEGY · {item.strategyId}
                      </span>
                    )}

                    {item.referenceId && (
                      <span>
                        REF · {item.referenceId}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      <footer className="ti-activity__notice">
        Activity is read-only projection. Risk Review remains the approval
        authority; runtime, audit and ledger events remain evidence and
        observation only. Timeline presence never authorizes execution.
      </footer>
    </section>
  );
}

export default ActivityWorkspace;
