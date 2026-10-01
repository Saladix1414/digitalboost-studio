import {
  useMemo,
} from "react";

import {
  mockTradingBots,
} from "../bots";

import {
  indicatorEngine,
} from "../indicators";

import {
  localHistoricalData,
} from "../historical-data";

import {
  createPaperAccount,
} from "../paper";

import {
  reviewPaperRisk,
} from "../risk";

import {
  useApprovalRepositoryStore,
} from "../risk/useApprovalRepositoryStore";

import {
  createRuntimeAuditRecord,
  runBotRuntimeSession,
} from "../runtime";

import {
  evaluateStrategy,
  mockStrategies,
} from "../strategy";

import {
  activityFromPaperLedger,
  activityFromRecoveryAttemptHistoryEntry,
  activityFromReviewChainIntegrity,
  activityFromReviewHistoryEntry,
  activityFromRiskReview,
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
  } =
    useApprovalRepositoryStore();


  const activity =
    useMemo<
      readonly TradingActivityItem[]
    >(
      () => {
        const bot =
          mockTradingBots[0];

        const strategy =
          bot
            ? mockStrategies.find(
                (
                  item
                ) =>
                  item.id ===
                  bot.strategyId
              ) ?? null
            : null;

        if (
          !bot ||
          !strategy
        ) {
          return [];
        }

        const reviewDecision =
          reviewPaperRisk({
            bot,
            strategy,
          });

        const items:
          TradingActivityItem[] = [];

        let sequence =
          1;

        items.push(
          activityFromRiskReview(
            reviewDecision.review,
            sequence
          )
        );

        sequence +=
          1;

        /*
         * Project only review evidence that already exists.
         * Activity does not manufacture review history.
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
         * Recovery attempts are observational evidence only.
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


        const historical =
          localHistoricalData.getSeries({
            symbol:
              strategy.symbol,

            timeframe:
              strategy.timeframe,

            window:
              50,
          });

        const candles =
          historical.candles;

        if (
          candles.length > 0 &&
          reviewDecision.approved
        ) {
          const current =
            indicatorEngine.snapshot(
              candles
            );

          const previous =
            candles.length > 1
              ? indicatorEngine.snapshot(
                  candles.slice(
                    0,
                    -1
                  )
                )
              : undefined;

          const evaluation =
            evaluateStrategy(
              strategy,
              {
                current,
                previous,
              }
            );

          const paperRunningBot = {
            ...bot,

            status:
              "paper-running" as const,
          };

          const session =
            runBotRuntimeSession({
              bot:
                paperRunningBot,

              strategy,

              account:
                createPaperAccount(
                  10_000
                ),

              evaluation,

              approval:
                reviewDecision.review,

              market: {
                marketPrice:
                  candles[
                    candles.length -
                    1
                  ].close,

                quantity:
                  0.01,
              },
            });

          const audit =
            createRuntimeAuditRecord(
              session
            );

          const runtimeItems =
            activityFromRuntimeAudit(
              audit,
              sequence
            );

          items.push(
            ...runtimeItems
          );

          sequence +=
            runtimeItems.length;

          items.push(
            activityFromRuntimeAuditSummary(
              audit,
              sequence
            )
          );

          sequence +=
            1;

          for (
            const entry of
            session.runtime.account
              .ledger
          ) {
            items.push(
              activityFromPaperLedger(
                entry,
                sequence
              )
            );

            sequence +=
              1;
          }
        }

        return items;
      },
      [
        approvalRepository.history,
        recoveryAttemptHistory,
      ]
    );

  return (
    <section className="ti-activity">
      <header className="ti-activity__header">
        <div>
          <span className="ti-label">
            Trading Activity
          </span>

          <h2>
            Unified operational timeline
          </h2>

          <p>
            Risk approval, runtime events, audit evidence and paper ledger
            are projected into one timeline without merging their authority.
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
