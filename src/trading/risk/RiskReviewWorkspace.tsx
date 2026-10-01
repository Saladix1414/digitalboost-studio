import {
  useEffect,
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

import {
  validateRiskReviewProvenance,
} from "./reviewProvenanceValidation";

import {
  validateRiskReviewChain,
} from "./reviewChainValidation";

import {
  useApprovalRepositoryStore,
} from "./useApprovalRepositoryStore";

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

  const {
    state:
      approvalRepository,

    lifecycle:
      approvalLifecycle,

    activeReview,

    bootstrap:
      bootstrapApproval,

    acceptReview,

    recoverPersistence,

    hydrate:
      rehydrateApprovalStore,
} =
    useApprovalRepositoryStore();

  const reloadApprovalState =
    async () => {
      if (
        approvalLifecycle.status !==
        "stale"
      ) {
        return;
      }

      await rehydrateApprovalStore();
    };

  const recoverApprovalPersistence =
    async () => {
      await recoverPersistence();
    };

  const approvalStoreReady =
    approvalLifecycle.status ===
    "ready";


  const activeReviewVersion =
    approvalRepository.active;

  const reviewHistory =
    approvalRepository.history;

  useEffect(
    () => {
      if (
        !approvalStoreReady ||
        approvalRepository.active
      ) {
        return;
      }

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

      if (
        !initialBot ||
        !initialStrategy
      ) {
        return;
      }

      bootstrapApproval(
        reviewPaperRisk({
          bot:
            initialBot,

          strategy:
            initialStrategy,
        }).review,
        "risk-review-workspace"
      );
    },
    [
      approvalRepository.active,
      approvalStoreReady,
      bootstrapApproval,
    ]
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

  const chainIntegrity =
    useMemo(
      () =>
        reviewHistory
          ? validateRiskReviewChain(
              reviewHistory
            )
          : null,
      [
        reviewHistory,
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
        !approvalStoreReady
      ) {
        return;
      }

      if (
        !candidateDecision?.approved
      ) {
        return;
      }

      acceptReview(
        candidateDecision.review,
        "risk-review-workspace"
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
            <>
            <section className="ti-risk-review__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Approval Store Lifecycle
                    </span>

                    <strong>
                      {approvalLifecycle.status.toUpperCase()}
                    </strong>
                  </div>

                  <span
                    className={
                      approvalStoreReady
                        ? "ti-hydration-state ti-hydration-state--ready"
                        : approvalLifecycle.status === "error"
                          ? "ti-hydration-state ti-hydration-state--error"
                          : "ti-hydration-state ti-hydration-state--pending"
                    }
                  >
                    {approvalStoreReady
                      ? "GOVERNANCE READY"
                      : "GOVERNANCE LOCKED"}
                  </span>
                </header>

                {approvalLifecycle.error ? (
                  <p className="ti-hydration-state__error">
                    {approvalLifecycle.error}
                  </p>
                ) : null}

                {approvalLifecycle.status === "stale" ? (
                  <div className="ti-hydration-recovery ti-hydration-recovery--stale">
                    <p className="ti-risk-review__boundary-note">
                      Approval state changed in another browser context.
                      Reload the persisted approval state before making
                      another governance decision.
                    </p>

                    <button
                      type="button"
                      className="ti-hydration-recovery__button ti-hydration-recovery__button--reload"
                      onClick={reloadApprovalState}
                    >
                      RELOAD APPROVAL STATE
                    </button>
                  </div>
                ) : null}

                {approvalLifecycle.status === "error" ? (
                  <div className="ti-hydration-recovery">
                    <p className="ti-risk-review__boundary-note">
                      Persisted approval state could not be loaded safely.
                      Runtime governance remains locked until recovery succeeds.
                    </p>

                    <button
                      type="button"
                      className="ti-hydration-recovery__button"
                      onClick={recoverApprovalPersistence}
                    >
                      RESET APPROVAL STORAGE
                    </button>
                  </div>
                ) : null}

                <p className="ti-risk-review__boundary-note">
                  Review acceptance and paper runtime remain locked while
                  approval state is hydrating.
                </p>
              </section>

              <section className="ti-risk-review__panel">
              <div className="ti-risk-review__empty">
                No bot available for review.
              </div>
            </section>
            </>
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
                        <div>
                          <strong>
                            {check.label}
                          </strong>

                          <span>
                            {check.detail}
                          </span>
                        </div>

                        <span>
                          {check.passed
                            ? "PASS"
                            : "FAIL"}
                        </span>
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
                      Chain Integrity
                    </span>

                    <strong>
                      {chainIntegrity?.valid
                        ? "CHAIN VALID"
                        : "CHAIN BROKEN"}
                    </strong>
                  </div>

                  <span
                    className={
                      chainIntegrity?.valid
                        ? "ti-chain-integrity ti-chain-integrity--valid"
                        : "ti-chain-integrity ti-chain-integrity--invalid"
                    }
                  >
                    {chainIntegrity?.checkedEntries ?? 0}
                    {" "}
                    VERIFIED
                  </span>
                </header>

                {!chainIntegrity?.valid &&
                chainIntegrity ? (
                  <div className="ti-chain-integrity__issues">
                    {chainIntegrity.issues.map(
                      (
                        issue,
                        index
                      ) => (
                        <article
                          key={
                            `${issue.code}-${issue.index}-${index}`
                          }
                        >
                          <strong>
                            {issue.code}
                          </strong>

                          <span>
                            {issue.detail}
                          </span>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <p className="ti-risk-review__boundary-note">
                    Review versions and supersedes links form a continuous
                    evidence chain.
                  </p>
                )}

                <p className="ti-risk-review__boundary-note">
                  Chain integrity validates evidence only. It does not grant,
                  renew, or replace runtime approval.
                </p>
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
                    ) => {
                      const integrity =
                        validateRiskReviewProvenance(
                          item
                        );

                      return (
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

                          <span
                            className={
                              integrity.valid
                                ? "ti-provenance-integrity ti-provenance-integrity--valid"
                                : "ti-provenance-integrity ti-provenance-integrity--invalid"
                            }
                            title={
                              integrity.valid
                                ? "Provenance matches the associated review."
                                : integrity.issues.join(
                                    ", "
                                  )
                            }
                          >
                            {integrity.valid
                              ? "INTEGRITY · VALID"
                              : "INTEGRITY · INVALID"}
                          </span>
                        </article>
                      );
                    }
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
