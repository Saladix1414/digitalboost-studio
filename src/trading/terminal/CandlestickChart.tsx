import {
  useMemo,
} from "react";

import type {
  Candle,
} from "../types/trading";

export type CandlestickChartProps = {
  readonly candles: readonly Candle[];
  readonly label: string;
  readonly selectedIndex?: number | null;
  readonly onSelectCandle?: (
    index: number
  ) => void;
};

const WIDTH = 860;
const HEIGHT = 360;
const PAD_X = 42;
const PAD_Y = 30;
const VOLUME_HEIGHT = 70;

export function CandlestickChart({
  candles,
  label,
  selectedIndex = null,
  onSelectCandle,
}: CandlestickChartProps) {
  const geometry =
    useMemo(
      () => {
        if (candles.length === 0) {
          return null;
        }

        const min =
          Math.min(
            ...candles.map(
              (candle) =>
                candle.low
            )
          );

        const max =
          Math.max(
            ...candles.map(
              (candle) =>
                candle.high
            )
          );

        const range =
          max - min || 1;

        const maxVolume =
          Math.max(
            ...candles.map(
              (candle) =>
                candle.volume
            )
          ) || 1;

        const chartBottom =
          HEIGHT -
          VOLUME_HEIGHT -
          PAD_Y;

        const chartHeight =
          chartBottom -
          PAD_Y;

        const slot =
          (
            WIDTH -
            PAD_X * 2
          ) /
          candles.length;

        const bodyWidth =
          Math.max(
            7,
            Math.min(
              24,
              slot * 0.48
            )
          );

        const priceY = (
          value: number
        ) =>
          PAD_Y +
          (
            1 -
            (value - min) /
              range
          ) *
            chartHeight;

        const items =
          candles.map(
            (
              candle,
              index
            ) => {
              const x =
                PAD_X +
                slot * index +
                slot / 2;

              const openY =
                priceY(
                  candle.open
                );

              const closeY =
                priceY(
                  candle.close
                );

              const highY =
                priceY(
                  candle.high
                );

              const lowY =
                priceY(
                  candle.low
                );

              const positive =
                candle.close >=
                candle.open;

              const bodyTop =
                Math.min(
                  openY,
                  closeY
                );

              const bodyHeight =
                Math.max(
                  2,
                  Math.abs(
                    closeY -
                      openY
                  )
                );

              const volumeHeight =
                (
                  candle.volume /
                  maxVolume
                ) *
                (
                  VOLUME_HEIGHT -
                  18
                );

              return {
                candle,
                x,
                openY,
                closeY,
                highY,
                lowY,
                positive,
                bodyTop,
                bodyHeight,
                bodyWidth,
                volumeY:
                  HEIGHT -
                  PAD_Y -
                  volumeHeight,
                volumeHeight,
              };
            }
          );

        return {
          min,
          max,
          items,
          chartBottom,
        };
      },
      [candles]
    );

  if (!geometry) {
    return (
      <div className="ti-terminal-chart-empty">
        No deterministic candles available.
      </div>
    );
  }

  return (
    <div className="ti-terminal-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
      >
        <g className="ti-terminal-chart__grid">
          {[0.2, 0.4, 0.6, 0.8].map(
            (ratio) => {
              const y =
                PAD_Y +
                ratio *
                  (
                    geometry.chartBottom -
                    PAD_Y
                  );

              return (
                <line
                  key={ratio}
                  x1={PAD_X}
                  x2={
                    WIDTH -
                    PAD_X
                  }
                  y1={y}
                  y2={y}
                />
              );
            }
          )}
        </g>

        {geometry.items.map(
          (item) => {
            const tone =
              item.positive
                ? "positive"
                : "negative";

            return (
              <g
                key={
                  item.candle.time
                }
                className={[
                  "ti-terminal-candle",
                  `ti-terminal-candle--${tone}`,
                  selectedIndex === index
                    ? "ti-terminal-candle--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role={
                  onSelectCandle
                    ? "button"
                    : undefined
                }
                tabIndex={
                  onSelectCandle
                    ? 0
                    : undefined
                }
                onClick={() =>
                  onSelectCandle?.(
                    index
                  )
                }
                onKeyDown={(event) => {
                  if (
                    !onSelectCandle
                  ) {
                    return;
                  }

                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    onSelectCandle(
                      index
                    );
                  }
                }}
              >
                <line
                  x1={item.x}
                  x2={item.x}
                  y1={item.highY}
                  y2={item.lowY}
                />

                <rect
                  x={
                    item.x -
                    item.bodyWidth /
                      2
                  }
                  y={item.bodyTop}
                  width={
                    item.bodyWidth
                  }
                  height={
                    item.bodyHeight
                  }
                  rx="1"
                />

                <rect
                  className="ti-terminal-volume"
                  x={
                    item.x -
                    item.bodyWidth /
                      2
                  }
                  y={item.volumeY}
                  width={
                    item.bodyWidth
                  }
                  height={
                    item.volumeHeight
                  }
                />
              </g>
            );
          }
        )}
      </svg>

      <div className="ti-terminal-chart__scale">
        <span>
          {geometry.max.toLocaleString(
            "en-US",
            {
              maximumFractionDigits:
                2,
            }
          )}
        </span>

        <span>
          {geometry.min.toLocaleString(
            "en-US",
            {
              maximumFractionDigits:
                2,
            }
          )}
        </span>
      </div>
    </div>
  );
}

export default CandlestickChart;
