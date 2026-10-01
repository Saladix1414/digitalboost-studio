import {
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
  evaluateRiskReviewFreshness,
  reviewPaperRisk,
} from "../risk";

import {
  useMarketData,
} from "../market-data";

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

  const currentReview =
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
        currentReview
          ? evaluateRiskReviewFreshness(
              currentReview.review,
              selectedBot,
              selectedStrategy
            )
          : null,
      [
        selectedBot,
        selectedStrategy,
        currentReview,
      ]
    );

  const runLocalSession =
    () => {
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

      const approvalDecision =
        reviewPaperRisk({
          bot:
            selectedBot,

          strategy:
            selectedStrategy,
        });

      if (
        !approvalDecision.approved
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
            approvalDecision.review,

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
                      {currentReview?.review.id ??
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
