import {
  useMemo,
  useState,
} from "react";

import {
  assessStrategy,
} from "./engine";

import type {
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

import type {
  StrategyIndicator,
  TradingStrategy,
} from "./types";

const symbols:
  readonly MarketSymbol[] = [
    "BTC",
    "ETH",
    "SOL",
  ];

const timeframes:
  readonly TradingTimeframe[] = [
    "5m",
    "15m",
    "1h",
    "4h",
    "1d",
  ];

const indicators:
  readonly StrategyIndicator[] = [
    "ema20",
    "ema50",
    "rsi14",
  ];

export function StrategyBuilder() {
  const [
    name,
    setName,
  ] = useState(
    "Momentum Strategy"
  );

  const [
    symbol,
    setSymbol,
  ] = useState<MarketSymbol>(
    "BTC"
  );

  const [
    timeframe,
    setTimeframe,
  ] =
    useState<TradingTimeframe>(
      "1h"
    );

  const [
    leftIndicator,
    setLeftIndicator,
  ] =
    useState<StrategyIndicator>(
      "ema20"
    );

  const [
    rightIndicator,
    setRightIndicator,
  ] =
    useState<StrategyIndicator>(
      "ema50"
    );

  const [
    maxPositionPercent,
    setMaxPositionPercent,
  ] = useState(10);

  const [
    stopLossPercent,
    setStopLossPercent,
  ] = useState(2);

  const [
    takeProfitPercent,
    setTakeProfitPercent,
  ] = useState(4);

  const strategy =
    useMemo<TradingStrategy>(
      () => ({
        id:
          "local-builder-strategy",

        name,
        symbol,
        timeframe,

        side:
          "long",

        entryConditions: [
          {
            id:
              "primary-condition",

            left: {
              kind:
                "indicator",

              indicator:
                leftIndicator,
            },

            comparator:
              "above",

            right: {
              kind:
                "indicator",

              indicator:
                rightIndicator,
            },
          },
        ],

        invalidationConditions: [],

        risk: {
          maxPositionPercent,
          stopLossPercent,
          takeProfitPercent,
        },

        executionMode:
          "paper-only",
      }),
      [
        name,
        symbol,
        timeframe,
        leftIndicator,
        rightIndicator,
        maxPositionPercent,
        stopLossPercent,
        takeProfitPercent,
      ]
    );

  const assessment =
    useMemo(
      () =>
        assessStrategy(
          strategy
        ),
      [
        strategy,
      ]
    );

  return (
    <section className="ti-strategy-builder">
      <header className="ti-strategy-builder__header">
        <div>
          <span className="ti-label">
            Strategy Builder
          </span>

          <h2>
            Build a deterministic strategy
          </h2>

          <p>
            Compose indicator rules and risk intent.
            Strategy remains paper-only.
          </p>
        </div>

        <div
          className={[
            "ti-strategy-builder__status",
            assessment.validation.valid
              ? "ti-strategy-builder__status--valid"
              : "ti-strategy-builder__status--invalid",
          ].join(" ")}
        >
          {assessment.validation.valid
            ? "VALID"
            : "INVALID"}
        </div>
      </header>

      <div className="ti-strategy-builder__grid">
        <div className="ti-strategy-builder__panel">
          <label>
            Strategy name

            <input
              value={name}
              onChange={(
                event
              ) =>
                setName(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Market

            <select
              value={symbol}
              onChange={(
                event
              ) =>
                setSymbol(
                  event.target
                    .value as MarketSymbol
                )
              }
            >
              {symbols.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}/USDT
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Timeframe

            <select
              value={
                timeframe
              }
              onChange={(
                event
              ) =>
                setTimeframe(
                  event.target
                    .value as TradingTimeframe
                )
              }
            >
              {timeframes.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <div className="ti-strategy-builder__panel">
          <span className="ti-label">
            Entry condition
          </span>

          <div className="ti-strategy-builder__condition">
            <select
              value={
                leftIndicator
              }
              onChange={(
                event
              ) =>
                setLeftIndicator(
                  event.target
                    .value as StrategyIndicator
                )
              }
            >
              {indicators.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item.toUpperCase()}
                  </option>
                )
              )}
            </select>

            <strong>
              ABOVE
            </strong>

            <select
              value={
                rightIndicator
              }
              onChange={(
                event
              ) =>
                setRightIndicator(
                  event.target
                    .value as StrategyIndicator
                )
              }
            >
              {indicators.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item.toUpperCase()}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="ti-strategy-builder__panel">
          <span className="ti-label">
            Risk intent
          </span>

          <label>
            Max position %

            <input
              type="number"
              min="1"
              max="100"
              value={
                maxPositionPercent
              }
              onChange={(
                event
              ) =>
                setMaxPositionPercent(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>

          <label>
            Stop loss %

            <input
              type="number"
              min="0.1"
              step="0.1"
              value={
                stopLossPercent
              }
              onChange={(
                event
              ) =>
                setStopLossPercent(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>

          <label>
            Take profit %

            <input
              type="number"
              min="0.1"
              step="0.1"
              value={
                takeProfitPercent
              }
              onChange={(
                event
              ) =>
                setTakeProfitPercent(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>
        </div>

        <div className="ti-strategy-builder__panel">
          <span className="ti-label">
            Structured preview
          </span>

          <dl className="ti-strategy-builder__preview">
            <div>
              <dt>
                Market
              </dt>

              <dd>
                {strategy.symbol}/USDT
              </dd>
            </div>

            <div>
              <dt>
                Timeframe
              </dt>

              <dd>
                {strategy.timeframe}
              </dd>
            </div>

            <div>
              <dt>
                Side
              </dt>

              <dd>
                {strategy.side}
              </dd>
            </div>

            <div>
              <dt>
                Mode
              </dt>

              <dd>
                {strategy.executionMode}
              </dd>
            </div>
          </dl>

          {!assessment.validation.valid ? (
            <ul className="ti-strategy-builder__issues">
              {assessment.validation.issues.map(
                (
                  item
                ) => (
                  <li
                    key={`${item.field}-${item.message}`}
                  >
                    {item.message}
                  </li>
                )
              )}
            </ul>
          ) : (
            <div className="ti-strategy-builder__ready">
              Strategy structure is valid for
              future backtest evaluation.
            </div>
          )}

          <button
            type="button"
            disabled
            className="ti-strategy-builder__deploy"
          >
            Live deployment unavailable
          </button>
        </div>
      </div>
    </section>
  );
}

export default StrategyBuilder;
