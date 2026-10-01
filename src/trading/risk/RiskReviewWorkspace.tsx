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

import {
  createInitialVersionedReview,
  createNextVersionedReview,
} from "./reviewVersion";

import {
  appendRiskReviewHistory,
  createRiskReviewHistory,
} from "./reviewHistory";

import {
  createRiskReviewProvenance,
} from "./reviewProvenance";

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

  const [
    activeReviewVersion,
    setActiveReviewVersion,
  ] = useState(
    () => {
      const initialBot =
        mockTradingBots[0];

      const initialStrategy =
        initialBot
          ? mockStrategies.find(
              (
                item
              ) =>
                item.id ===
                initialBot.strategyId
            ) ?? null
          : null;

      return initialBot &&
        initialStrategy
        ? createInitialVersionedReview(
            reviewPaperRisk({
              bot:
                initialBot,

              strategy:
                initialStrategy,
            }).review
          )
        : null;
    }
  );

  const activeReview =
    activeReviewVersion?.review ??
    null;

  const [
    reviewHistory,
    setReviewHistory,
  ] = useState(
    () =>
      activeReviewVersion
        ? createRiskReviewHistory({
            versionedReview:
              activeReviewVersion,

            provenance:
              createRiskReviewProvenance(
                activeReviewVersion,
                "risk-review-workspace",
                "initial-review"
              ),
          })
        : null
  );

  const candidateDecision =
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
        activeReview
          ? evaluateRiskReviewFreshness(
              activeReview,
              bot,
              strategy
            )
          : null,
      [
        bot,
        strategy,
        activeReview,
      ]
    );

  const acceptCandidateReview =
    () => {
      if (
        !candidateDecision
      ) {
        return;
      }

      setActiveReviewVersion(
        (
          current
        ) => {
          const next =
            current
              ? createNextVersionedReview(
                  current,
                  candidateDecision.review
                )
              : createInitialVersionedReview(
                  candidateDecision.review
                );

          setReviewHistory(
            (
              history
            ) =>
              history
                ? appendRiskReviewHistory(
                    history,
                    {
                      versionedReview:
                        next,

                      provenance:
                        createRiskReviewProvenance(
                          next,
                          "risk-review-workspace",
                          "explicit-rereview"
                        ),
                    }
                  )
                : createRiskReviewHistory({
                    versionedReview:
                      next,

                    provenance:
                      createRiskReviewProvenance(
                        next,
                        "risk-review-workspace",
                        "explicit-rereview"
                      ),
                  })
          );

          return next;
        }
      );
    };

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
            activeReview?.status === "approved"
              ? "ti-risk-review__decision--approved"
              : "ti-risk-review__decision--rejected",
          ].join(" ")}
        >
          {activeReview
            ? activeReview.status === "approved"
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
          ) : !candidateDecision ? (
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
                      {activeReview?.id ?? "NO ACTIVE REVIEW"}
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
                      {activeReview?.approvedFor ?? "none"}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Review version
                    </dt>

                    <dd>
                      {activeReviewVersion
                        ? `v${activeReviewVersion.version}`
                        : "NONE"}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Previous review
                    </dt>

                    <dd>
                      {activeReviewVersion?.previousReviewId ??
                        "NONE"}
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
                      {activeReview?.checks.filter(
                        (
                          check
                        ) =>
                          check.passed
                      ).length}
                      /
                      {activeReview?.checks.length ?? 0}
                      {" "}
                      passed
                    </strong>
                  </div>
                </header>

                <div className="ti-risk-review__checks">
                  {(activeReview?.checks ?? []).map(
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
                      Re-review workflow
                    </span>

                    <strong>
                      Candidate review
                    </strong>
                  </div>
                </header>

                <div className="ti-risk-review__rereview">
                  <div>
                    <span>
                      Active review
                    </span>

                    <strong>
                      {activeReview?.id ??
                        "NONE"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Candidate
                    </span>

                    <strong>
                      {candidateDecision.review.id}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Candidate result
                    </span>

                    <strong>
                      {candidateDecision.approved
                        ? "APPROVABLE"
                        : "REJECTED"}
                    </strong>
                  </div>
                </div>

                <div className="ti-risk-review__rereview-action">
                  <p>
                    Configuration changes do not silently replace the active
                    review. Accepting a candidate creates the new active
                    approval state explicitly.
                  </p>

                  <button
                    type="button"
                    disabled={
                      !candidateDecision.approved
                    }
                    onClick={
                      acceptCandidateReview
                    }
                  >
                    Accept new review
                  </button>
                </div>
              </section>

              <section className="ti-risk-review__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Review History
                    </span>

                    <strong>
                      {reviewHistory?.entries.length ?? 0}
                      {" "}
                      accepted reviews
                    </strong>
                  </div>
                </header>

                <div className="ti-risk-review__history">
                  {(reviewHistory?.entries ?? []).map(
                    (
                      item
                    ) => (
                      <article
                        key={
                          `${item.versionedReview.review.id}-${item.versionedReview.version}`
                        }
                      >
                        <div>
                          <strong>
                            v{item.versionedReview.version}
                          </strong>

                          <span>
                            {item.versionedReview.review.id}
                          </span>
                        </div>

                        <span>
                          PREV · {item.versionedReview.previousReviewId ?? "ROOT"}
                        </span>

                        <span>
                          {item.versionedReview.review.status.toUpperCase()}
                        </span>

                        <span>
                          SOURCE · {item.provenance.source}
                        </span>

                        <span>
                          CREATED · {item.provenance.createdFrom}
                        </span>

                        <span>
                          SUPERSEDES · {item.provenance.supersedes ?? "ROOT"}
                        </span>

                        <code
                          title={
                            item.provenance.bindingFingerprint
                          }
                        >
                          FP · {item.provenance.bindingFingerprint.slice(
                            0,
                            18
                          )}…
                        </code>
                      </article>
                    )
                  )}
                </div>

                <p className="ti-risk-review__boundary-note">
                  Review history is evidence only. Historical reviews do not
                  authorize runtime execution.
                </p>
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
                      {activeReview?.status ?? "none"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Authoritative
                    </span>

                    <strong>
                      {String(
                        activeReview?.authoritative ?? false
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
