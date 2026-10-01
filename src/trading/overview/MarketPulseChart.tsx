import {
  useMemo,
  useState,
} from "react";

import {
  mockMarketHistory,
} from "../fixtures/marketHistory";

import {
  mockMarkets,
} from "../fixtures/markets";

import type {
  MarketSymbol,
} from "../types/trading";

import {
  StatusBadge,
} from "../components";

const WIDTH = 720;
const HEIGHT = 230;
const PADDING_X = 28;
const PADDING_Y = 24;

function buildPath(
  values: readonly number[]
): string {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  const range =
    max - min || 1;

  return values
    .map((value, index) => {
      const x =
        PADDING_X +
        (
          index /
          Math.max(
            values.length - 1,
            1
          )
        ) *
          (
            WIDTH -
            PADDING_X * 2
          );

      const normalized =
        (value - min) /
        range;

      const y =
        HEIGHT -
        PADDING_Y -
        normalized *
          (
            HEIGHT -
            PADDING_Y * 2
          );

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function MarketPulseChart() {
  const [
    activeSymbol,
    setActiveSymbol,
  ] = useState<MarketSymbol>(
    "BTC"
  );

  const series =
    mockMarketHistory.find(
      (item) =>
        item.symbol ===
        activeSymbol
    )!;

  const market =
    mockMarkets.find(
      (item) =>
        item.symbol ===
        activeSymbol
    )!;

  const values =
    series.points.map(
      (point) =>
        point.value
    );

  const path =
    useMemo(
      () =>
        buildPath(values),
      [values]
    );

  const positive =
    market.change24h >= 0;

  return (
    <section className="ti-market-pulse">
      <header className="ti-market-pulse__head">
        <div>
          <span className="ti-label">
            Market pulse
          </span>

          <h2>
            Intraday structure
          </h2>
        </div>

        <StatusBadge
          tone={
            positive
              ? "positive"
              : "negative"
          }
        >
          {positive ? "+" : ""}
          {market.change24h.toFixed(
            2
          )}
          %
        </StatusBadge>
      </header>

      <div className="ti-market-pulse__toolbar">
        {mockMarkets.map(
          (item) => (
            <button
              key={item.symbol}
              type="button"
              aria-pressed={
                activeSymbol ===
                item.symbol
              }
              className={[
                "ti-market-pulse__market",
                activeSymbol ===
                item.symbol
                  ? "ti-market-pulse__market--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setActiveSymbol(
                  item.symbol
                )
              }
            >
              <strong>
                {item.symbol}
              </strong>

              <span>
                {item.price.toLocaleString(
                  "en-US",
                  {
                    maximumFractionDigits:
                      2,
                  }
                )}
              </span>
            </button>
          )
        )}
      </div>

      <div className="ti-market-pulse__chart">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${activeSymbol} deterministic intraday chart`}
        >
          <defs>
            <linearGradient
              id="tiMarketPulseArea"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={
                  positive
                    ? "#26c281"
                    : "#ef5b68"
                }
                stopOpacity="0.18"
              />

              <stop
                offset="100%"
                stopColor={
                  positive
                    ? "#26c281"
                    : "#ef5b68"
                }
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d={`${path} L ${WIDTH - PADDING_X} ${HEIGHT - PADDING_Y} L ${PADDING_X} ${HEIGHT - PADDING_Y} Z`}
            fill="url(#tiMarketPulseArea)"
          />

          <path
            d={path}
            fill="none"
            stroke={
              positive
                ? "#26c281"
                : "#ef5b68"
            }
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <footer className="ti-market-pulse__footer">
        <span>
          {series.points[0].time}
        </span>

        <span>
          Deterministic fixture
        </span>

        <span>
          {
            series.points[
              series.points.length -
                1
            ].time
          }
        </span>
      </footer>
    </section>
  );
}

export default MarketPulseChart;
