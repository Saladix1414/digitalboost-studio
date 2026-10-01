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
                  onClick={() =>
                    setSelectedBotId(
                      bot.id
                    )
                  }
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
