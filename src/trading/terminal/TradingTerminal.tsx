import {
  useMemo,
  useState,
} from "react";

import type {
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

import {
  localHistoricalData,
  type HistoricalWindow,
} from "../historical-data";

import {
  useMarketData,
} from "../market-data";

import {
  StatusBadge,
} from "../components";

import CandlestickChart from "./CandlestickChart";

import {
  indicatorEngine,
} from "../indicators";

import TerminalActivityPanel from "./TerminalActivityPanel";
import RsiPanel from "./RsiPanel";

const timeframes: readonly TradingTimeframe[] = [
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
];

const historicalWindows: readonly HistoricalWindow[] = [
  20,
  50,
  100,
  200,
];

export function TradingTerminal() {
  const marketData =
    useMarketData();

  const mockMarkets =
    marketData.getMarkets();

  const marketHealth =
    marketData.getHealth();
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

  const [
    historicalWindow,
    setHistoricalWindow,
  ] = useState<HistoricalWindow>(
    50
  );

  const [
    selectedCandleIndex,
    setSelectedCandleIndex,
  ] = useState<number | null>(
    null
  );

  const [
    paperSide,
    setPaperSide,
  ] = useState<"buy" | "sell">(
    "buy"
  );

  const [
    paperPreview,
    setPaperPreview,
  ] = useState(false);

  const [
    paperAmount,
    setPaperAmount,
  ] = useState("");

  const numericPaperAmount =
    Number(
      paperAmount
    );

  const paperAmountValid =
    Number.isFinite(
      numericPaperAmount
    ) &&
    numericPaperAmount > 0;

  const paperNotional =
    paperAmountValid
      ? numericPaperAmount *
        market.price
      : 0;

  const market =
    marketData.getMarket(
      symbol
    )!;

  const candles =
    useMemo(
      () =>
        localHistoricalData.getSeries({
          symbol,
          timeframe,
          window:
            historicalWindow,
        }).candles,
      [
        symbol,
        timeframe,
        historicalWindow,
      ]
    );

  const latest =
    candles[
      candles.length - 1
    ];

  const selectedCandle =
    selectedCandleIndex === null
      ? latest
      : candles[
          selectedCandleIndex
        ];

  const indicatorAnalysis =
    useMemo(
      () =>
        indicatorEngine.analyze(
          candles
        ),
      [candles]
    );

  const indicators =
    indicatorAnalysis.snapshot;

  const indicatorSeries =
    indicatorAnalysis.series;

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

        <div className="ti-terminal__windows">
          {historicalWindows.map(
            (window) => (
              <button
                key={window}
                type="button"
                aria-pressed={
                  historicalWindow ===
                  window
                }
                className={[
                  "ti-terminal__window",
                  historicalWindow ===
                  window
                    ? "ti-terminal__window--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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

        <StatusBadge
          tone={
            marketHealth.status === "ready"
              ? "positive"
              : marketHealth.status === "stale"
                ? "warning"
                : marketHealth.status === "error"
                  ? "negative"
                  : "info"
          }
        >
          {marketHealth.sourceLabel}
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
            ema20={
              indicatorSeries.ema20
            }
            ema50={
              indicatorSeries.ema50
            }
            selectedIndex={
              selectedCandleIndex
            }
            onSelectCandle={
              setSelectedCandleIndex
            }
          />

          <RsiPanel
            points={
              indicatorSeries.rsi14
            }
          />

          {selectedCandle ? (
            <div className="ti-terminal__selected-candle">
              <span>
                Candle
                <strong>
                  {selectedCandle.time}
                </strong>
              </span>

              <span>
                O
                <strong>
                  {selectedCandle.open}
                </strong>
              </span>

              <span>
                H
                <strong>
                  {selectedCandle.high}
                </strong>
              </span>

              <span>
                L
                <strong>
                  {selectedCandle.low}
                </strong>
              </span>

              <span>
                C
                <strong>
                  {selectedCandle.close}
                </strong>
              </span>

              <span>
                Vol
                <strong>
                  {selectedCandle.volume}
                </strong>
              </span>
            </div>
          ) : null}

          <div className="ti-terminal__indicators">
            <span>
              EMA 20
              <strong>
                {indicators.ema20.toFixed(
                  2
                )}
              </strong>
            </span>

            <span>
              EMA 50
              <strong>
                {indicators.ema50.toFixed(
                  2
                )}
              </strong>
            </span>

            <span>
              RSI
              <strong>
                {indicators.rsi14.toFixed(
                  1
                )}
              </strong>
            </span>

            <span>
              Volume
              <strong>
                {indicators.volume.toLocaleString()}
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
                aria-pressed={
                  paperSide ===
                  "buy"
                }
                className={[
                  "ti-terminal__ticket-tab",
                  paperSide ===
                  "buy"
                    ? "ti-terminal__ticket-tab--active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setPaperSide(
                    "buy"
                  )
                }
              >
                Buy
              </button>

              <button
                type="button"
                aria-pressed={
                  paperSide ===
                  "sell"
                }
                className={[
                  "ti-terminal__ticket-tab",
                  paperSide ===
                  "sell"
                    ? "ti-terminal__ticket-tab--sell-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  setPaperSide(
                    "sell"
                  )
                }
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
                value={paperAmount}
                placeholder="0.000"
                onChange={(event) => {
                  setPaperAmount(
                    event.target.value
                  );

                  setPaperPreview(
                    false
                  );
                }}
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
              disabled={
                !paperAmountValid
              }
              onClick={() =>
                setPaperPreview(
                  true
                )
              }
            >
              Preview paper order
            </button>

            {paperPreview &&
            paperAmountValid ? (
              <div className="ti-terminal__paper-preview">
                <strong>
                  Paper preview ready
                </strong>

                <span>
                  {paperSide.toUpperCase()} · {symbol}/USDT
                </span>

                <div className="ti-terminal__paper-preview-grid">
                  <span>
                    Quantity
                    <strong>
                      {numericPaperAmount}
                    </strong>
                  </span>

                  <span>
                    Reference
                    <strong>
                      {market.price.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}
                    </strong>
                  </span>

                  <span>
                    Notional
                    <strong>
                      {paperNotional.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPaperPreview(
                      false
                    )
                  }
                >
                  Clear preview
                </button>
              </div>
            ) : null}

            <p>
              This ticket is intentionally non-executing.
              Live exchange connectivity is not enabled.
            </p>
          </section>
        </aside>
      </div>

      <TerminalActivityPanel />
    </div>
  );
}

export default TradingTerminal;
