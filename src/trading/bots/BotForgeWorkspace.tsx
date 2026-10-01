import {
  resolveApprovalRecoveryPresentation,
} from "../risk/approvalRecoveryAction";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  assessTradingBot,
  mockTradingBots,
  transitionTradingBot,
} from "./index";

import type {
  TradingBot,
  TradingBotStatus,
} from "./types";

import {
  createPaperAccount,
} from "../paper";

import {
  indicatorEngine,
} from "../indicators";

import {
  evaluateStrategy,
  mockStrategies,
} from "../strategy";

import {
  createRuntimeAuditRecord,
  runBotRuntimeSession,
} from "../runtime";

import {
  appendRiskReviewHistory,
  createInitialVersionedReview,
  createNextVersionedReview,
  createRiskReviewHistory,
  createRiskReviewProvenance,
  evaluateRiskReviewFreshness,
  reviewPaperRisk,
  validateRiskReviewChain,
  validateRiskReviewProvenance,
} from "../risk";

import {
  useMarketData,
} from "../market-data";

import {
  useApprovalRepositoryStore,
} from "../risk/useApprovalRepositoryStore";

const lifecycleLabels:
  Readonly<
    Record<
      TradingBotStatus,
      string
    >
  > = {
    draft:
      "Draft",

    validated:
      "Validated",

    "paper-running":
      "Paper Running",

    paused:
      "Paused",

    stopped:
      "Stopped",
  };

export function BotForgeWorkspace() {
  const marketData =
    useMarketData();

  const [
    bots,
    setBots,
  ] = useState<
    readonly TradingBot[]
  >(
    mockTradingBots
  );

  const [
    selectedBotId,
    setSelectedBotId,
  ] = useState(
    mockTradingBots[0]?.id ??
      ""
  );

  const selectedBot =
    bots.find(
      (
        bot
      ) =>
        bot.id ===
        selectedBotId
    ) ??
    bots[0] ??
    null;

  const assessment =
    useMemo(
      () =>
        selectedBot
          ? assessTradingBot(
              selectedBot
            )
          : null,
      [
        selectedBot,
      ]
    );

  const selectedStrategy =
    useMemo(
      () =>
        selectedBot
          ? mockStrategies.find(
              (
                strategy
              ) =>
                strategy.id ===
                selectedBot.strategyId
            ) ??
            null
          : null,
      [
        selectedBot,
      ]
    );

  const [
    runtimeSession,
    setRuntimeSession,
  ] = useState<
    ReturnType<
      typeof runBotRuntimeSession
    > | null
  >(
    null
  );

  const runtimeAudit =
    useMemo(
      () =>
        runtimeSession
          ? createRuntimeAuditRecord(
              runtimeSession
            )
          : null,
      [
        runtimeSession,
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

    persistenceDiagnostics,

    persistenceMode,

    bootstrapFailurePolicy,
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
        "bot-forge"
      );
    },
    [
      approvalRepository.active,
      approvalStoreReady,
      bootstrapApproval,
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

  const candidateReview =
    useMemo(
      () =>
        selectedBot &&
        selectedStrategy
          ? reviewPaperRisk({
              bot:
                selectedBot,

              strategy:
                selectedStrategy,
            })
          : null,
      [
        selectedBot,
        selectedStrategy,
      ]
    );

  const reviewFreshness =
    useMemo(
      () =>
        selectedBot &&
        selectedStrategy &&
        activeReview
          ? evaluateRiskReviewFreshness(
              activeReview,
              selectedBot,
              selectedStrategy
            )
          : null,
      [
        selectedBot,
        selectedStrategy,
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
        !candidateReview?.approved
      ) {
        return;
      }

      acceptReview(
        candidateReview.review,
        "bot-forge"
      );

      setRuntimeSession(
        null
      );
    };

  const runLocalSession =
    () => {
      if (
        !approvalStoreReady
      ) {
        return;
      }

      if (
        !selectedBot ||
        !selectedStrategy
      ) {
        return;
      }

      const market =
        marketData.getMarket(
          selectedBot.symbol
        );

      if (
        !market
      ) {
        return;
      }

      const indicatorSnapshot =
        indicatorEngine.snapshot(
          marketData.getCandles(
            selectedBot.symbol,
            selectedBot.timeframe
          )
        );

      const evaluation =
        evaluateStrategy(
          selectedStrategy,
          {
            current:
              indicatorSnapshot,
          }
        );

      if (
        !activeReview ||
        !reviewFreshness ||
        reviewFreshness.reviewRequired
      ) {
        return;
      }

      const session =
        runBotRuntimeSession({
          bot:
            selectedBot,

          strategy:
            selectedStrategy,

          account:
            createPaperAccount(
              10_000
            ),

          evaluation,

          approval:
            activeReview,

          market: {
            marketPrice:
              market.price,

            quantity:
              0.01,
          },
        });

      setRuntimeSession(
        session
      );
    };

  const updateBotStatus =
    (
      nextStatus:
        TradingBotStatus
    ) => {
      if (
        !selectedBot
      ) {
        return;
      }

      setBots(
        (
          current
        ) =>
          current.map(
            (
              bot
            ) =>
              bot.id ===
              selectedBot.id
                ? transitionTradingBot(
                    bot,
                    nextStatus
                  )
                : bot
          )
      );
    };

  const approvalRecoveryPresentation =
    resolveApprovalRecoveryPresentation(
      bootstrapFailurePolicy
    );

  const handleApprovalPersistenceRecovery =
    async () => {
      if (
        approvalLifecycle.status !==
        "error"
      ) {
        return;
      }

      if (
        persistenceMode ===
          "remote"
      ) {
        await rehydrateApprovalStore();
        return;
      }

      await recoverPersistence();
    };



  return (
    <section className="ti-bot-forge">
      <header className="ti-bot-forge__header">
        <div>
          <span className="ti-label">
            Bot Forge
          </span>

          <h2>
            Strategy-bound automation
          </h2>

          <p>
            Bots reference validated strategy and risk configuration.
            Execution is restricted to paper mode.
          </p>
        </div>

        <div className="ti-bot-forge__mode">
          PAPER AUTOMATION
        </div>
      </header>

      <div className="ti-bot-forge__layout">
        <aside className="ti-bot-forge__list">
          <header>
            <span className="ti-label">
              Bots
            </span>

            <strong>
              {bots.length} configured
            </strong>
          </header>

          <div className="ti-bot-forge__bot-list">
            {bots.map(
              (
                bot
              ) => (
                <button
                  key={
                    bot.id
                  }
                  type="button"
                  aria-pressed={
                    selectedBot?.id ===
                    bot.id
                  }
                  className={
                    selectedBot?.id ===
                    bot.id
                      ? "ti-bot-forge__bot ti-bot-forge__bot--active"
                      : "ti-bot-forge__bot"
                  }
                  onClick={() => {
                    setSelectedBotId(
                      bot.id
                    );

                    setRuntimeSession(
                      null
                    );
                  }}
                >
                  <div>
                    <strong>
                      {bot.name}
                    </strong>

                    <span>
                      {bot.symbol}/USDT · {bot.timeframe}
                    </span>
                  </div>

                  <span
                    className={`ti-bot-forge__status ti-bot-forge__status--${bot.status}`}
                  >
                    {
                      lifecycleLabels[
                        bot.status
                      ]
                    }
                  </span>
                </button>
              )
            )}
          </div>
        </aside>

        <main className="ti-bot-forge__detail">
          {!selectedBot ||
          !assessment ? (
            <div className="ti-bot-forge__empty">
              No bot selected.
            </div>
          ) : (
            <>
              <section className="ti-bot-forge__panel">
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

                <div className="ti-approval-diagnostics">
                  <div className="ti-approval-diagnostics__header">
                    <span>
                      Persistence Diagnostics
                    </span>

                    <span>
                      EVIDENCE ONLY
                    </span>
                  </div>

                  <dl className="ti-approval-diagnostics__grid">
                    <div>
                      <dt>
                        Review version
                      </dt>

                      <dd>
                        {activeReviewVersion?.version ?? "NONE"}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Storage revision
                      </dt>

                      <dd>
                        {persistenceDiagnostics.revision ?? "EMPTY"}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Writes queued
                      </dt>

                      <dd>
                        {persistenceDiagnostics.queued}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Writes persisted
                      </dt>

                      <dd>
                        {persistenceDiagnostics.persisted}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Writes pending
                      </dt>

                      <dd>
                        {persistenceDiagnostics.pending}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Lifecycle
                      </dt>

                      <dd>
                        {approvalLifecycle.status.toUpperCase()}
                      </dd>
                    </div>
                  </dl>

                  {(
                    approvalLifecycle.status === "stale" ||
                    approvalLifecycle.status === "error"
                  ) && approvalLifecycle.error ? (
                    <div className="ti-approval-diagnostics__reason">
                      <span>
                        Sync reason
                      </span>

                      <strong>
                        {approvalLifecycle.error}
                      </strong>
                    </div>
                  ) : null}
                </div>

                {approvalLifecycle.error ? (
                  <p className="ti-hydration-state__error">
                    {approvalLifecycle.error}
                  </p>
                ) : null}

                {approvalLifecycle.status === "stale" ? (
                  <div className="ti-hydration-recovery ti-hydration-recovery--stale">
                    <p className="ti-bot-forge__approval-note">
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
                    <p className="ti-bot-forge__approval-note">
                      Persisted approval state could not be loaded safely.
                      Runtime governance remains locked until recovery succeeds.
                    </p>

                    <button
                      type="button"
                      className="ti-hydration-recovery__button"
                      onClick={handleApprovalPersistenceRecovery}
                    >
                      {approvalRecoveryPresentation.label}
                    </button>
                  </div>
                ) : null}

                <p className="ti-bot-forge__approval-note">
                  Review acceptance and paper runtime remain locked while
                  approval state is hydrating.
                </p>
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Bot Definition
                    </span>

                    <h3>
                      {selectedBot.name}
                    </h3>
                  </div>

                  <span
                    className={`ti-bot-forge__status ti-bot-forge__status--${selectedBot.status}`}
                  >
                    {
                      lifecycleLabels[
                        selectedBot.status
                      ]
                    }
                  </span>
                </header>

                <dl className="ti-bot-forge__definition">
                  <div>
                    <dt>
                      Strategy
                    </dt>

                    <dd>
                      {selectedBot.strategyId}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Market
                    </dt>

                    <dd>
                      {selectedBot.symbol}/USDT
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Timeframe
                    </dt>

                    <dd>
                      {selectedBot.timeframe}
                    </dd>
                  </div>

                  <div>
                    <dt>
                      Execution
                    </dt>

                    <dd>
                      {selectedBot.executionMode}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Risk Profile
                    </span>

                    <strong>
                      Explicit limits
                    </strong>
                  </div>
                </header>

                <div className="ti-bot-forge__risk-grid">
                  <article>
                    <span>
                      Max order
                    </span>

                    <strong>
                      {selectedBot.risk.maxOrderNotional.toLocaleString(
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
                      {selectedBot.risk.maxPositionNotional.toLocaleString(
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
                      {selectedBot.risk.minCashReserve.toLocaleString(
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
                </div>
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Validation
                    </span>

                    <strong>
                      {
                        assessment.validation.valid
                          ? "Ready for paper lifecycle"
                          : "Configuration invalid"
                      }
                    </strong>
                  </div>
                </header>

                {assessment.validation.issues.length >
                0 ? (
                  <ul className="ti-bot-forge__issues">
                    {assessment.validation.issues.map(
                      (
                        issue
                      ) => (
                        <li
                          key={`${issue.field}-${issue.message}`}
                        >
                          {issue.message}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <div className="ti-bot-forge__valid">
                    Bot definition passed local validation.
                  </div>
                )}
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Approval Integrity
                    </span>

                    <strong>
                      Runtime eligibility
                    </strong>
                  </div>

                  <span
                    className={
                      reviewFreshness?.freshness ===
                      "current"
                        ? "ti-bot-forge__review-state ti-bot-forge__review-state--current"
                        : "ti-bot-forge__review-state ti-bot-forge__review-state--stale"
                    }
                  >
                    {reviewFreshness?.freshness ===
                    "current"
                      ? "CURRENT"
                      : "STALE"}
                  </span>
                </header>

                <div className="ti-bot-forge__approval-integrity">
                  <div>
                    <span>
                      Risk review
                    </span>

                    <strong>
                      {activeReview?.id ??
                        "UNAVAILABLE"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Binding
                    </span>

                    <strong>
                      {reviewFreshness?.freshness ===
                      "current"
                        ? "MATCH"
                        : "MISMATCH"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Runtime eligibility
                    </span>

                    <strong>
                      {reviewFreshness?.reviewRequired
                        ? "REVIEW REQUIRED"
                        : "PAPER ELIGIBLE"}
                    </strong>
                  </div>
                </div>

                <p className="ti-bot-forge__approval-note">
                  {reviewFreshness?.reason ??
                    "No review is available for the selected bot and strategy."}
                </p>
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Re-review
                    </span>

                    <strong>
                      Explicit approval refresh
                    </strong>
                  </div>
                </header>

                <div className="ti-bot-forge__rereview">
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
                      Review version
                    </span>

                    <strong>
                      {activeReviewVersion
                        ? `v${activeReviewVersion.version}`
                        : "NONE"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Previous review
                    </span>

                    <strong>
                      {activeReviewVersion?.previousReviewId ??
                        "NONE"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Candidate
                    </span>

                    <strong>
                      {candidateReview?.review.id ??
                        "NONE"}
                    </strong>
                  </div>

                  <button
                    type="button"
                    disabled={
                      !candidateReview?.approved
                    }
                    onClick={
                      acceptCandidateReview
                    }
                  >
                    Accept new review
                  </button>
                </div>

                <p className="ti-bot-forge__approval-note">
                  A configuration change requires an explicit new review
                  before the bot can regain paper runtime eligibility.
                </p>
              </section>

              <section className="ti-bot-forge__panel">
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
                  <p className="ti-bot-forge__approval-note">
                    Accepted review versions form a continuous evidence chain.
                  </p>
                )}

                <p className="ti-bot-forge__approval-note">
                  Chain status is observational. Runtime still requires the
                  current active review.
                </p>
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Review History
                    </span>

                    <strong>
                      Accepted approval chain
                    </strong>
                  </div>

                  <span className="ti-bot-forge__audit-mode">
                    EVIDENCE ONLY
                  </span>
                </header>

                <div className="ti-bot-forge__review-history">
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
                          <strong>
                            v{item.versionedReview.version}
                          </strong>

                          <span>
                            {item.versionedReview.review.id}
                          </span>

                          <span>
                            PREV · {item.versionedReview.previousReviewId ?? "ROOT"}
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

                <p className="ti-bot-forge__approval-note">
                  Historical reviews are retained for evidence only.
                  Runtime consumes the current active review, never history.
                </p>
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Runtime Activity
                    </span>

                    <strong>
                      Observational paper session
                    </strong>
                  </div>

                  {runtimeSession && (
                    <span className="ti-bot-forge__runtime-decision">
                      {
                        runtimeSession.runtime
                          .decision
                      }
                    </span>
                  )}
                </header>

                <div className="ti-bot-forge__runtime-controls">
                  <button
                    type="button"
                    disabled={
                      selectedBot.status !==
                        "paper-running" ||
                      !selectedStrategy
                    }
                    onClick={
                      runLocalSession
                    }
                  >
                    Run local paper step
                  </button>

                  <span>
                    Telemetry records outcomes.
                    It does not authorize execution.
                  </span>
                </div>

                {!runtimeSession ? (
                  <div className="ti-bot-forge__empty">
                    No runtime session recorded for this bot.
                  </div>
                ) : (
                  <div className="ti-bot-forge__runtime-events">
                    {runtimeSession.session.events.map(
                      (
                        event
                      ) => (
                        <article
                          key={
                            event.id
                          }
                        >
                          <span className="ti-bot-forge__event-sequence">
                            {String(
                              event.sequence
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>
                            <strong>
                              {event.type
                                .replaceAll(
                                  "_",
                                  " "
                                )
                                .toUpperCase()}
                            </strong>

                            <p>
                              {event.message}
                            </p>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}

                {runtimeSession && (
                  <footer className="ti-bot-forge__runtime-footer">
                    <span>
                      Session{" "}
                      {
                        runtimeSession.session
                          .id
                      }
                    </span>

                    <span>
                      authoritative = false
                    </span>
                  </footer>
                )}
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Runtime Audit
                    </span>

                    <strong>
                      Approval evidence
                    </strong>
                  </div>

                  <span className="ti-bot-forge__audit-mode">
                    EVIDENCE ONLY
                  </span>
                </header>

                {!runtimeAudit ? (
                  <div className="ti-bot-forge__empty">
                    No runtime audit available until a local paper session is recorded.
                  </div>
                ) : (
                  <>
                    <dl className="ti-bot-forge__audit-grid">
                      <div>
                        <dt>
                          Session
                        </dt>

                        <dd>
                          {runtimeAudit.sessionId}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Risk review
                        </dt>

                        <dd>
                          {
                            runtimeAudit.approval
                              .riskReviewId
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Bot binding
                        </dt>

                        <dd>
                          {
                            runtimeAudit.approval
                              .botId
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Strategy binding
                        </dt>

                        <dd>
                          {
                            runtimeAudit.approval
                              .strategyId
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Approval scope
                        </dt>

                        <dd>
                          {
                            runtimeAudit.approval
                              .approvalScope
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Approval verified
                        </dt>

                        <dd>
                          {String(
                            runtimeAudit.approval
                              .approvalVerified
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Runtime decision
                        </dt>

                        <dd>
                          {runtimeAudit.decision}
                        </dd>
                      </div>

                      <div>
                        <dt>
                          Authoritative
                        </dt>

                        <dd>
                          {String(
                            runtimeAudit.authoritative
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div className="ti-bot-forge__audit-summary">
                      <span>
                        {
                          runtimeAudit.events
                            .length
                        }
                        {" "}
                        recorded events
                      </span>

                      <span>
                        Audit records evidence.
                        Audit does not authorize execution.
                      </span>
                    </div>
                  </>
                )}
              </section>

              <section className="ti-bot-forge__panel">
                <header>
                  <div>
                    <span className="ti-label">
                      Lifecycle Controls
                    </span>

                    <strong>
                      Explicit state transitions
                    </strong>
                  </div>
                </header>

                <div className="ti-bot-forge__actions">
                  {selectedBot.status ===
                    "validated" && (
                    <button
                      type="button"
                      disabled={
                        !assessment.canStartPaper
                      }
                      onClick={() =>
                        updateBotStatus(
                          "paper-running"
                        )
                      }
                    >
                      Start paper bot
                    </button>
                  )}

                  {selectedBot.status ===
                    "paper-running" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          updateBotStatus(
                            "paused"
                          )
                        }
                      >
                        Pause
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateBotStatus(
                            "stopped"
                          )
                        }
                      >
                        Stop
                      </button>
                    </>
                  )}

                  {selectedBot.status ===
                    "paused" && (
                    <>
                      <button
                        type="button"
                        disabled={
                          !assessment.canStartPaper
                        }
                        onClick={() =>
                          updateBotStatus(
                            "paper-running"
                          )
                        }
                      >
                        Resume
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateBotStatus(
                            "stopped"
                          )
                        }
                      >
                        Stop
                      </button>
                    </>
                  )}

                  {selectedBot.status ===
                    "stopped" && (
                    <div className="ti-bot-forge__terminal-state">
                      Bot lifecycle completed. Create a new bot definition
                      for another run.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled
                  className="ti-bot-forge__live-disabled"
                >
                  Live deployment unavailable
                </button>
              </section>
            </>
          )}
        </main>
      </div>

      <footer className="ti-bot-forge__notice">
        Bot Forge currently models local lifecycle state only.
        It does not transmit orders, connect to exchanges or control live capital.
      </footer>
    </section>
  );
}

export default BotForgeWorkspace;
