import {
  useMemo,
} from "react";

import {
  mockTradingBots,
} from "../bots";

import {
  createPaperAccount,
} from "../paper";

import {
  reviewPaperRisk,
} from "../risk";

import {
  mockStrategies,
} from "../strategy";

import {
  activityFromPaperLedger,
  activityFromRiskReview,
} from "./builders";

import type {
  TradingActivityItem,
} from "./types";

export function ActivityWorkspace() {
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

        const items:
          TradingActivityItem[] = [];

        let sequence =
          1;

        if (
          bot &&
          strategy
        ) {
          const review =
            reviewPaperRisk({
              bot,
              strategy,
            });

          items.push(
            activityFromRiskReview(
              review.review,
              sequence
            )
          );

          sequence +=
            1;
        }

        const paperAccount =
          createPaperAccount(
            10_000
          );

        for (
          const entry of
          paperAccount.ledger
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

        return items;
      },
      []
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
            Activity merges observations and approvals into one readable
            timeline without merging their authority.
          </p>
        </div>

        <div className="ti-activity__mode">
          OBSERVATION + APPROVAL
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
        Activity is a projection of domain events. Only items explicitly
        marked as approval authority may represent an approval decision.
        Timeline presence alone never authorizes execution.
      </footer>
    </section>
  );
}

export default ActivityWorkspace;
