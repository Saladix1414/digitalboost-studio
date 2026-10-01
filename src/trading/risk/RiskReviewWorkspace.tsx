import {
  useMemo,
  useState,
} from "react";

import {
  mockTradingBots,
} from "../bots";

import {
  mockStrategies,
} from "../strategy";

import {
  reviewPaperRisk,
} from "./review";

import {
  evaluateRiskReviewFreshness,
} from "./reviewStatus";

export function RiskReviewWorkspace() {
  const [
    selectedBotId,
    setSelectedBotId,
  ] = useState(
    mockTradingBots[0]?.id ??
      ""
  );

  const bot =
    useMemo(
      () =>
        mockTradingBots.find(
          (
            item
          ) =>
            item.id ===
            selectedBotId
        ) ??
        mockTradingBots[0] ??
        null,
      [
        selectedBotId,
      ]
    );

  const strategy =
    useMemo(
      () =>
        bot
          ? mockStrategies.find(
              (
                item
              ) =>
                item.id ===
                bot.strategyId
            ) ??
            null
          : null,
      [
        bot,
      ]
    );

  const decision =
    useMemo(
      () =>
        bot &&
        strategy
          ? reviewPaperRisk({
              bot,
              strategy,
            })
          : null,
      [
        bot,
        strategy,
      ]
    );

  const freshness =
    useMemo(
      () =>
        bot &&
        strategy &&
        decision
          ? evaluateRiskReviewFreshness(
              decision.review,
              bot,
              strategy
            )
          : null,
      [
        bot,
        strategy,
        decision,
      ]
    );

  return (
    <section className="ti-risk-review">
      <header className="ti-risk-review__header">
        <div>
          <span className="ti-label">
            Risk Review
          </span>

          <h2>
            Paper approval boundary
          </h2>

          <p>
            Strategy and bot configuration are reviewed before
            paper runtime eligibility. This review cannot execute orders.
          </p>
        </div>

        <div
          className={[
            "ti-risk-review__decision",
            decision?.approved
              ? "ti-risk-review__decision--approved"
              : "ti-risk-review__decision--rejected",
          ].join(" ")}
        >
          {decision
            ? decision.approved
              ? "APPROVED FOR PAPER"
              : "REJECTED"
            : "UNAVAILABLE"}
        </div>
      </header>

      <div className="ti-risk-review__layout">
        <aside className="ti-risk-review__selector">
          <header>
            <span className="ti-label">
              Review target
            </span>

            <strong>
              Trading bot
            </strong>
          </header>

          <div className="ti-risk-review__bots">
            {mockTradingBots.map(
              (
                item
              ) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  aria-pressed={
                    bot?.id ===
                    item.id
                  }
                  className={
                    bot?.id ===
                    item.id
                      ? "ti-risk-review__bot ti-risk-review__bot--active"
                      : "ti-risk-review__bot"
                  }
                  onClick={() =>
                    setSelectedBotId(
                      item.id
                    )
                  }
                >
                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.symbol}/USDT · {item.timeframe}
                  </span>
                </button>
              )
            )}
          </div>
        </aside>

        <main className="ti-risk-review__content">
          {!bot ? (
            <section className="ti-risk-review__panel">
              <div className="ti-risk-review__empty">
                No bot available for review.
              </div>
            </section>
          ) : !strategy ? (
            <section className="ti-risk-review__panel">
              <header>
                <span className="ti-label">
                  Strategy binding
                </span>

                <strong>
                  Missing strategy
                </strong>
              </header>

              <div className="ti-risk-review__failure">
                Strategy {bot.strategyId} could not be resolved.
                Paper approval cannot be granted.
              </div>
            </section>
          ) : !decision ? (
            <section className="ti-risk-review__panel">
              <div className="ti-risk-review__empty">
                Risk review unavailable.
              </div>
            </section>
          ) : (
            <>
              <section className="ti-risk-review__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Review identity
                    </span>

                    <strong>
                      {decision.review.id}
                    </strong>
                  </div>
                </header>

                <dl className="ti-risk-review__identity">
                  <div>
                    <dt>
                      Bot
                    </dt>

                    <dd>
                      {bot.name}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Strategy
                    </dt>

                    <dd>
                      {strategy.name}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Market
                    </dt>

                    <dd>
                      {bot.symbol}/USDT
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Approval scope
                    </dt>

                    <dd>
                      {decision.review.approvedFor}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Review freshness
                    </dt>

                    <dd
                      className={
                        freshness?.freshness ===
                        "current"
                          ? "ti-risk-review__freshness ti-risk-review__freshness--current"
                          : "ti-risk-review__freshness ti-risk-review__freshness--stale"
                      }
                    >
                      {freshness?.freshness ===
                      "current"
                        ? "CURRENT"
                        : "STALE"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="ti-risk-review__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Risk limits
                    </span>

                    <strong>
                      Bot execution envelope
                    </strong>
                  </div>
                </header>

                <div className="ti-risk-review__metrics">
                  <article>
                    <span>
                      Max order
                    </span>

                    <strong>
                      {bot.risk.maxOrderNotional.toLocaleString(
                        "en-US",
                        {
                          style:
                            "currency",
                          currency:
                            "USD",
                        }
                      )}
                    </strong>
                  </article>

                  <article>
                    <span>
                      Max position
                    </span>

                    <strong>
                      {bot.risk.maxPositionNotional.toLocaleString(
                        "en-US",
                        {
                          style:
                            "currency",
                          currency:
                            "USD",
                        }
                      )}
                    </strong>
                  </article>

                  <article>
                    <span>
                      Cash reserve
                    </span>

                    <strong>
                      {bot.risk.minCashReserve.toLocaleString(
                        "en-US",
                        {
                          style:
                            "currency",
                          currency:
                            "USD",
                        }
                      )}
                    </strong>
                  </article>

                  <article>
                    <span>
                      Strategy position
                    </span>

                    <strong>
                      {strategy.risk.maxPositionPercent}%
                    </strong>
                  </article>

                  <article>
                    <span>
                      Stop loss
                    </span>

                    <strong>
                      {strategy.risk.stopLossPercent}%
                    </strong>
                  </article>

                  <article>
                    <span>
                      Take profit
                    </span>

                    <strong>
                      {strategy.risk.takeProfitPercent}%
                    </strong>
                  </article>
                </div>
              </section>

              <section className="ti-risk-review__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Review checks
                    </span>

                    <strong>
                      {decision.review.checks.filter(
                        (
                          check
                        ) =>
                          check.passed
                      ).length}
                      /
                      {decision.review.checks.length}
                      {" "}
                      passed
                    </strong>
                  </div>
                </header>

                <div className="ti-risk-review__checks">
                  {decision.review.checks.map(
                    (
                      check
                    ) => (
                      <article
                        key={
                          check.id
                        }
                        className={
                          check.passed
                            ? "ti-risk-review__check ti-risk-review__check--passed"
                            : "ti-risk-review__check ti-risk-review__check--failed"
                        }
                      >
                        <span className="ti-risk-review__check-mark">
                          {check.passed
                            ? "✓"
                            : "×"}
                        </span>

                        <div>
                          <strong>
                            {check.id
                              .replaceAll(
                                "-",
                                " "
                              )
                              .toUpperCase()}
                          </strong>

                          <p>
                            {check.message}
                          </p>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>

              <section className="ti-risk-review__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Authority boundary
                    </span>

                    <strong>
                      Paper approval only
                    </strong>
                  </div>
                </header>

                <div className="ti-risk-review__authority">
                  <div>
                    <span>
                      Review status
                    </span>

                    <strong>
                      {decision.review.status}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Authoritative
                    </span>

                    <strong>
                      {String(
                        decision.review.authoritative
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Execution capability
                    </span>

                    <strong>
                      NONE
                    </strong>
                  </div>
                </div>

                <p className="ti-risk-review__boundary-note">
                  Approval permits progression toward paper runtime
                  eligibility only. Risk Review cannot place, fill,
                  transmit or settle an order.
                </p>

                {freshness && (
                  <div
                    className={
                      freshness.reviewRequired
                        ? "ti-risk-review__freshness-note ti-risk-review__freshness-note--stale"
                        : "ti-risk-review__freshness-note"
                    }
                  >
                    <strong>
                      {freshness.reviewRequired
                        ? "REVIEW REQUIRED"
                        : "REVIEW CURRENT"}
                    </strong>

                    <span>
                      {freshness.reason}
                    </span>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </section>
  );
}

export default RiskReviewWorkspace;
