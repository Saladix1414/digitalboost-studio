import {
  useMemo,
  useState,
} from "react";

import {
  localHistoricalData,
  type HistoricalWindow,
} from "../historical-data";

import {
  mockStrategies,
} from "../strategy";

import {
  runBacktest,
} from "./engine";

const windows:
  readonly HistoricalWindow[] = [
    20,
    50,
    100,
    200,
  ];

const WIDTH = 760;
const HEIGHT = 180;
const PAD = 18;

function EquityCurve({
  values,
}: {
  readonly values:
    readonly number[];
}) {
  if (
    values.length === 0
  ) {
    return null;
  }

  const min =
    Math.min(
      ...values
    );

  const max =
    Math.max(
      ...values
    );

  const range =
    max - min || 1;

  const slot =
    (
      WIDTH -
      PAD * 2
    ) /
    Math.max(
      1,
      values.length - 1
    );

  const path =
    values
      .map(
        (
          value,
          index
        ) => {
          const x =
            PAD +
            slot * index;

          const y =
            PAD +
            (
              1 -
              (
                value -
                min
              ) /
                range
            ) *
              (
                HEIGHT -
                PAD * 2
              );

          return `${
            index === 0
              ? "M"
              : "L"
          } ${x} ${y}`;
        }
      )
      .join(" ");

  return (
    <svg
      className="ti-backtest__equity-chart"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Deterministic backtest equity curve"
    >
      <path
        d={path}
        fill="none"
        className="ti-backtest__equity-line"
      />
    </svg>
  );
}

export function BacktestWorkspace() {
  const strategy =
    mockStrategies[0];

  const [
    historicalWindow,
    setHistoricalWindow,
  ] = useState<HistoricalWindow>(
    100
  );

  const candles =
    useMemo(
      () =>
        localHistoricalData.getSeries({
          symbol:
            strategy.symbol,

          timeframe:
            strategy.timeframe,

          window:
            historicalWindow,
        }).candles,
      [
        strategy.symbol,
        strategy.timeframe,
        historicalWindow,
      ]
    );

  const result =
    useMemo(
      () =>
        runBacktest(
          strategy,
          candles,
          {
            initialCapital:
              10_000,
          }
        ),
      [
        strategy,
        candles,
      ]
    );

  const metrics =
    result.metrics;

  return (
    <section className="ti-backtest">
      <header className="ti-backtest__header">
        <div>
          <span className="ti-label">
            Backtest Engine
          </span>

          <h2>
            Deterministic strategy simulation
          </h2>

          <p>
            Historical fixtures only. No exchange connectivity,
            no capital execution and no performance guarantee.
          </p>
        </div>

        <div className="ti-backtest__mode">
          SIMULATION ONLY
        </div>
      </header>

      <div className="ti-backtest__toolbar">
        <div>
          <span className="ti-label">
            Strategy
          </span>

          <strong>
            {strategy.name}
          </strong>
        </div>

        <div>
          <span className="ti-label">
            Market
          </span>

          <strong>
            {strategy.symbol}/USDT · {strategy.timeframe}
          </strong>
        </div>

        <div className="ti-backtest__windows">
          {windows.map(
            (
              window
            ) => (
              <button
                key={window}
                type="button"
                aria-pressed={
                  historicalWindow ===
                  window
                }
                className={
                  historicalWindow ===
                  window
                    ? "ti-backtest__window--active"
                    : ""
                }
                onClick={() =>
                  setHistoricalWindow(
                    window
                  )
                }
              >
                {window}
              </button>
            )
          )}
        </div>
      </div>

      <div className="ti-backtest__metrics">
        <article>
          <span>
            Final capital
          </span>

          <strong>
            {metrics.finalCapital.toLocaleString(
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
            Net PnL
          </span>

          <strong>
            {metrics.netPnl.toLocaleString(
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
            Return
          </span>

          <strong>
            {metrics.returnPercent.toFixed(
              2
            )}
            %
          </strong>
        </article>

        <article>
          <span>
            Win rate
          </span>

          <strong>
            {metrics.winRatePercent.toFixed(
              1
            )}
            %
          </strong>
        </article>

        <article>
          <span>
            Max drawdown
          </span>

          <strong>
            {metrics.maxDrawdownPercent.toFixed(
              2
            )}
            %
          </strong>
        </article>

        <article>
          <span>
            Trades
          </span>

          <strong>
            {metrics.totalTrades}
          </strong>
        </article>
      </div>

      <section className="ti-backtest__panel">
        <header>
          <div>
            <span className="ti-label">
              Equity Curve
            </span>

            <strong>
              Simulated capital trajectory
            </strong>
          </div>
        </header>

        <EquityCurve
          values={
            result.equityCurve.map(
              (
                point
              ) =>
                point.equity
            )
          }
        />
      </section>

      <section className="ti-backtest__panel">
        <header>
          <div>
            <span className="ti-label">
              Simulated Trades
            </span>

            <strong>
              Closed positions only
            </strong>
          </div>
        </header>

        {result.trades.length ===
        0 ? (
          <div className="ti-backtest__empty">
            No completed simulated trades in this historical window.
          </div>
        ) : (
          <div className="ti-backtest__table-wrap">
            <table className="ti-backtest__table">
              <thead>
                <tr>
                  <th>
                    Trade
                  </th>

                  <th>
                    Side
                  </th>

                  <th>
                    Entry
                  </th>

                  <th>
                    Exit
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    PnL
                  </th>

                  <th>
                    Return
                  </th>
                </tr>
              </thead>

              <tbody>
                {result.trades.map(
                  (
                    trade
                  ) => (
                    <tr
                      key={
                        trade.id
                      }
                    >
                      <td>
                        {trade.id}
                      </td>

                      <td>
                        {trade.side}
                      </td>

                      <td>
                        {trade.entryPrice.toFixed(
                          2
                        )}
                      </td>

                      <td>
                        {trade.exitPrice.toFixed(
                          2
                        )}
                      </td>

                      <td>
                        {trade.quantity.toFixed(
                          6
                        )}
                      </td>

                      <td>
                        {trade.grossPnl.toFixed(
                          2
                        )}
                      </td>

                      <td>
                        {trade.returnPercent.toFixed(
                          2
                        )}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="ti-backtest__notice">
        Backtest results are deterministic simulations over local
        fixture data and are not evidence of future performance.
      </footer>
    </section>
  );
}

export default BacktestWorkspace;
