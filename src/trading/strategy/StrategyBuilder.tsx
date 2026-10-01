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
  StrategyComparator,
  StrategyCondition,
  StrategyIndicator,
  StrategyLogicOperator,
  StrategyOperand,
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

const comparators:
  readonly StrategyComparator[] = [
    "above",
    "below",
    "crosses_above",
    "crosses_below",
    "greater_than",
    "less_than",
  ];

type EditableCondition = {
  readonly id: string;

  left:
    StrategyIndicator;

  comparator:
    StrategyComparator;

  rightKind:
    "indicator" | "value";

  rightIndicator:
    StrategyIndicator;

  rightValue:
    number;
};

function createCondition(
  id: string
): EditableCondition {
  return {
    id,

    left:
      "ema20",

    comparator:
      "above",

    rightKind:
      "indicator",

    rightIndicator:
      "ema50",

    rightValue:
      50,
  };
}

function toCondition(
  condition:
    EditableCondition
): StrategyCondition {
  const right:
    StrategyOperand =
      condition.rightKind ===
      "indicator"
        ? {
            kind:
              "indicator",

            indicator:
              condition.rightIndicator,
          }
        : {
            kind:
              "value",

            value:
              condition.rightValue,
          };

  return {
    id:
      condition.id,

    left: {
      kind:
        "indicator",

      indicator:
        condition.left,
    },

    comparator:
      condition.comparator,

    right,
  };
}

function ConditionEditor({
  title,
  logic,
  onLogicChange,
  conditions,
  onConditionsChange,
}: {
  readonly title: string;

  readonly logic:
    StrategyLogicOperator;

  readonly onLogicChange:
    (
      value:
        StrategyLogicOperator
    ) => void;

  readonly conditions:
    readonly EditableCondition[];

  readonly onConditionsChange:
    (
      value:
        readonly EditableCondition[]
    ) => void;
}) {
  const updateCondition = (
    id: string,
    patch:
      Partial<EditableCondition>
  ) => {
    onConditionsChange(
      conditions.map(
        (condition) =>
          condition.id === id
            ? {
                ...condition,
                ...patch,
              }
            : condition
      )
    );
  };

  const removeCondition = (
    id: string
  ) => {
    onConditionsChange(
      conditions.filter(
        (condition) =>
          condition.id !== id
      )
    );
  };

  return (
    <section className="ti-strategy-builder__panel">
      <header className="ti-strategy-builder__condition-head">
        <div>
          <span className="ti-label">
            {title}
          </span>

          <small>
            {conditions.length} condition
            {conditions.length === 1
              ? ""
              : "s"}
          </small>
        </div>

        <div className="ti-strategy-builder__logic">
          {(
            [
              "and",
              "or",
            ] as const
          ).map(
            (operator) => (
              <button
                key={operator}
                type="button"
                aria-pressed={
                  logic ===
                  operator
                }
                className={
                  logic ===
                  operator
                    ? "ti-strategy-builder__logic--active"
                    : ""
                }
                onClick={() =>
                  onLogicChange(
                    operator
                  )
                }
              >
                {operator.toUpperCase()}
              </button>
            )
          )}
        </div>
      </header>

      <div className="ti-strategy-builder__conditions">
        {conditions.map(
          (
            condition,
            index
          ) => (
            <div
              key={
                condition.id
              }
              className="ti-strategy-builder__condition-row"
            >
              <span className="ti-strategy-builder__condition-index">
                {index + 1}
              </span>

              <select
                value={
                  condition.left
                }
                aria-label={`${title} left indicator ${index + 1}`}
                onChange={(
                  event
                ) =>
                  updateCondition(
                    condition.id,
                    {
                      left:
                        event.target
                          .value as StrategyIndicator,
                    }
                  )
                }
              >
                {indicators.map(
                  (indicator) => (
                    <option
                      key={
                        indicator
                      }
                      value={
                        indicator
                      }
                    >
                      {indicator.toUpperCase()}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  condition.comparator
                }
                aria-label={`${title} comparator ${index + 1}`}
                onChange={(
                  event
                ) =>
                  updateCondition(
                    condition.id,
                    {
                      comparator:
                        event.target
                          .value as StrategyComparator,
                    }
                  )
                }
              >
                {comparators.map(
                  (
                    comparator
                  ) => (
                    <option
                      key={
                        comparator
                      }
                      value={
                        comparator
                      }
                    >
                      {comparator
                        .replaceAll(
                          "_",
                          " "
                        )
                        .toUpperCase()}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  condition.rightKind
                }
                aria-label={`${title} right operand type ${index + 1}`}
                onChange={(
                  event
                ) =>
                  updateCondition(
                    condition.id,
                    {
                      rightKind:
                        event.target
                          .value as
                          | "indicator"
                          | "value",
                    }
                  )
                }
              >
                <option value="indicator">
                  Indicator
                </option>

                <option value="value">
                  Numeric value
                </option>
              </select>

              {condition.rightKind ===
              "indicator" ? (
                <select
                  value={
                    condition.rightIndicator
                  }
                  aria-label={`${title} right indicator ${index + 1}`}
                  onChange={(
                    event
                  ) =>
                    updateCondition(
                      condition.id,
                      {
                        rightIndicator:
                          event.target
                            .value as StrategyIndicator,
                      }
                    )
                  }
                >
                  {indicators.map(
                    (
                      indicator
                    ) => (
                      <option
                        key={
                          indicator
                        }
                        value={
                          indicator
                        }
                      >
                        {indicator.toUpperCase()}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  type="number"
                  value={
                    condition.rightValue
                  }
                  aria-label={`${title} numeric value ${index + 1}`}
                  onChange={(
                    event
                  ) =>
                    updateCondition(
                      condition.id,
                      {
                        rightValue:
                          Number(
                            event.target
                              .value
                          ),
                      }
                    )
                  }
                />
              )}

              <button
                type="button"
                className="ti-strategy-builder__remove"
                aria-label={`Remove ${title} condition ${index + 1}`}
                disabled={
                  conditions.length <=
                  1
                }
                onClick={() =>
                  removeCondition(
                    condition.id
                  )
                }
              >
                Remove
              </button>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="ti-strategy-builder__add"
        onClick={() =>
          onConditionsChange([
            ...conditions,
            createCondition(
              `${title
                .toLowerCase()
                .replaceAll(
                  " ",
                  "-"
                )}-${conditions.length + 1}`
            ),
          ])
        }
      >
        + Add condition
      </button>
    </section>
  );
}

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
    entryLogic,
    setEntryLogic,
  ] =
    useState<StrategyLogicOperator>(
      "and"
    );

  const [
    invalidationLogic,
    setInvalidationLogic,
  ] =
    useState<StrategyLogicOperator>(
      "or"
    );

  const [
    entryConditions,
    setEntryConditions,
  ] = useState<
    readonly EditableCondition[]
  >([
    {
      ...createCondition(
        "entry-1"
      ),
      left:
        "ema20",
      comparator:
        "above",
      rightIndicator:
        "ema50",
    },
    {
      ...createCondition(
        "entry-2"
      ),
      left:
        "rsi14",
      comparator:
        "greater_than",
      rightKind:
        "value",
      rightValue:
        55,
    },
  ]);

  const [
    invalidationConditions,
    setInvalidationConditions,
  ] = useState<
    readonly EditableCondition[]
  >([
    {
      ...createCondition(
        "invalidation-1"
      ),
      left:
        "rsi14",
      comparator:
        "less_than",
      rightKind:
        "value",
      rightValue:
        40,
    },
  ]);

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

        entryLogic,

        entryConditions:
          entryConditions.map(
            toCondition
          ),

        invalidationLogic,

        invalidationConditions:
          invalidationConditions.map(
            toCondition
          ),

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
        entryLogic,
        entryConditions,
        invalidationLogic,
        invalidationConditions,
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
            Compose deterministic trading logic
          </h2>

          <p>
            Multiple entry and invalidation conditions.
            Paper-only by design.
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
        <section className="ti-strategy-builder__panel">
          <span className="ti-label">
            Strategy identity
          </span>

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
        </section>

        <section className="ti-strategy-builder__panel">
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
                    event.target.value
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
                    event.target.value
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
                    event.target.value
                  )
                )
              }
            />
          </label>
        </section>
      </div>

      <ConditionEditor
        title="Entry"
        logic={entryLogic}
        onLogicChange={
          setEntryLogic
        }
        conditions={
          entryConditions
        }
        onConditionsChange={
          setEntryConditions
        }
      />

      <ConditionEditor
        title="Invalidation"
        logic={
          invalidationLogic
        }
        onLogicChange={
          setInvalidationLogic
        }
        conditions={
          invalidationConditions
        }
        onConditionsChange={
          setInvalidationConditions
        }
      />

      <section className="ti-strategy-builder__panel">
        <span className="ti-label">
          Structured strategy preview
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
              Entry
            </dt>

            <dd>
              {strategy.entryConditions.length}
              {" "}
              {strategy.entryLogic.toUpperCase()}
            </dd>
          </div>

          <div>
            <dt>
              Invalidation
            </dt>

            <dd>
              {strategy.invalidationConditions.length}
              {" "}
              {strategy.invalidationLogic.toUpperCase()}
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
              Execution
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
            deterministic backtest evaluation.
          </div>
        )}

        <button
          type="button"
          disabled
          className="ti-strategy-builder__deploy"
        >
          Live deployment unavailable
        </button>
      </section>
    </section>
  );
}

export default StrategyBuilder;
