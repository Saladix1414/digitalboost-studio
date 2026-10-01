import {
  useMemo,
  useState,
} from "react";

import {
  mockMarkets,
} from "../fixtures/markets";

import {
  getMockCandles,
} from "../fixtures/candles";

import type {
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

import {
  StatusBadge,
} from "../components";

import CandlestickChart from "./CandlestickChart";

const timeframes: readonly TradingTimeframe[] = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
];

export function TradingTerminal() {
  const [
    symbol,
    setSymbol,
  ] = useState<MarketSymbol>(
    "BTC"
  );

  const [
    timeframe,
    setTimeframe,
  ] = useState<TradingTimeframe>(
    "1h"
  );

  const market =
    mockMarkets.find(
      (item) =>
        item.symbol === symbol
    )!;

  const candles =
    useMemo(
      () =>
        getMockCandles(
          symbol,
          timeframe
        ),
      [
        symbol,
        timeframe,
      ]
    );

  const latest =
    candles[
      candles.length - 1
    ];

  return (
    <div className="ti-terminal">
      <div className="ti-terminal__toolbar">
        <div className="ti-terminal__markets">
          {mockMarkets.map(
            (item) => (
              <button
                key={item.symbol}
                type="button"
                aria-pressed={
                  symbol ===
                  item.symbol
                }
                className={[
                  "ti-terminal__market",
                  symbol ===
                  item.symbol
                    ? "ti-terminal__market--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setSymbol(
                    item.symbol
                  )
                }
              >
                {item.symbol}/USDT
              </button>
            )
          )}
        </div>

        <div className="ti-terminal__timeframes">
          {timeframes.map(
            (item) => (
              <button
                key={item}
                type="button"
                aria-pressed={
                  timeframe === item
                }
                className={[
                  "ti-terminal__timeframe",
                  timeframe ===
                  item
                    ? "ti-terminal__timeframe--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setTimeframe(
                    item
                  )
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        <StatusBadge tone="neutral">
          Paper · Mock
        </StatusBadge>
      </div>

      <div className="ti-terminal__market-head">
        <div>
          <span className="ti-label">
            {market.pair}
          </span>

          <strong className="ti-terminal__price">
            {market.price.toLocaleString(
              "en-US",
              {
                style:
                  "currency",
                currency:
                  "USD",
              }
            )}
          </strong>
        </div>

        {latest ? (
          <div className="ti-terminal__ohlc">
            <span>
              O{" "}
              {latest.open.toLocaleString()}
            </span>
            <span>
              H{" "}
              {latest.high.toLocaleString()}
            </span>
            <span>
              L{" "}
              {latest.low.toLocaleString()}
            </span>
            <span>
              C{" "}
              {latest.close.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="ti-terminal__layout">
        <section className="ti-terminal__chart-panel">
          <CandlestickChart
            candles={candles}
            label={`${symbol} ${timeframe} deterministic candlestick chart`}
          />

          <div className="ti-terminal__indicators">
            <span>
              EMA 20
              <strong>
                {latest
                  ? (latest.close * 0.994).toFixed(2)
                  : "—"}
              </strong>
            </span>

            <span>
              EMA 50
              <strong>
                {latest
                  ? (latest.close * 0.982).toFixed(2)
                  : "—"}
              </strong>
            </span>

            <span>
              RSI
              <strong>
                {symbol === "SOL"
                  ? "47.8"
                  : symbol === "ETH"
                    ? "58.2"
                    : "61.4"}
              </strong>
            </span>

            <span>
              Volume
              <strong>
                {latest
                  ? latest.volume.toLocaleString()
                  : "—"}
              </strong>
            </span>
          </div>
        </section>

        <aside className="ti-terminal__side">
          <section className="ti-terminal__watchlist">
            <header>
              <span className="ti-label">
                Watchlist
              </span>

              <strong>
                Core markets
              </strong>
            </header>

            {mockMarkets.map(
              (item) => (
                <button
                  key={item.symbol}
                  type="button"
                  className={[
                    "ti-terminal__watch-row",
                    item.symbol === symbol
                      ? "ti-terminal__watch-row--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setSymbol(
                      item.symbol
                    )
                  }
                >
                  <span>
                    <strong>
                      {item.symbol}
                    </strong>

                    <small>
                      {item.pair}
                    </small>
                  </span>

                  <span>
                    <strong>
                      {item.price.toLocaleString(
                        "en-US",
                        {
                          maximumFractionDigits:
                            2,
                        }
                      )}
                    </strong>

                    <small
                      className={
                        item.change24h >= 0
                          ? "ti-positive"
                          : "ti-negative"
                      }
                    >
                      {item.change24h >= 0
                        ? "+"
                        : ""}
                      {item.change24h.toFixed(
                        2
                      )}
                      %
                    </small>
                  </span>
                </button>
              )
            )}
          </section>

          <section className="ti-terminal__ticket">
            <header>
              <div>
                <span className="ti-label">
                  Paper order
                </span>

                <strong>
                  Simulation ticket
                </strong>
              </div>

              <StatusBadge tone="warning">
                No live execution
              </StatusBadge>
            </header>

            <div className="ti-terminal__ticket-tabs">
              <button
                type="button"
                className="ti-terminal__ticket-tab ti-terminal__ticket-tab--active"
              >
                Buy
              </button>

              <button
                type="button"
                className="ti-terminal__ticket-tab"
              >
                Sell
              </button>
            </div>

            <label className="ti-terminal__field">
              <span>
                Order type
              </span>

              <select defaultValue="market">
                <option value="market">
                  Market
                </option>

                <option value="limit">
                  Limit
                </option>
              </select>
            </label>

            <label className="ti-terminal__field">
              <span>
                Amount
              </span>

              <input
                type="number"
                min="0"
                step="0.001"
                placeholder="0.000"
              />
            </label>

            <label className="ti-terminal__field">
              <span>
                Estimated price
              </span>

              <input
                value={market.price.toFixed(
                  2
                )}
                readOnly
              />
            </label>

            <button
              type="button"
              className="ti-terminal__paper-submit"
            >
              Preview paper order
            </button>

            <p>
              This ticket is intentionally non-executing.
              Live exchange connectivity is not enabled.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default TradingTerminal;
