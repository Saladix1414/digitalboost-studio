import {
  useMemo,
} from "react";

import type {
  Candle,
} from "../types/trading";

import type {
  IndicatorPoint,
} from "../indicators";


export type CandlestickChartProps = {
  readonly candles: readonly Candle[];
  readonly label: string;
  readonly ema20?: readonly IndicatorPoint[];
  readonly ema50?: readonly IndicatorPoint[];
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
  ema20 = [],
  ema50 = [],
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
          priceY,
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

  const buildIndicatorPath = (
    points: readonly IndicatorPoint[]
  ) =>
    points
      .filter(
        (point) =>
          point.index >= 0 &&
          point.index <
            geometry.items.length
      )
      .map(
        (
          point,
          pathIndex
        ) => {
          const item =
            geometry.items[
              point.index
            ];

          const command =
            pathIndex === 0
              ? "M"
              : "L";

          return [
            command,
            item.x,
            geometry.priceY(
              point.value
            ),
          ].join(" ");
        }
      )
      .join(" ");

  const ema20Path =
    buildIndicatorPath(
      ema20
    );

  const ema50Path =
    buildIndicatorPath(
      ema50
    );

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

        {ema50Path ? (
          <path
            className="ti-terminal-indicator-line ti-terminal-indicator-line--ema50"
            d={ema50Path}
            fill="none"
          />
        ) : null}

        {ema20Path ? (
          <path
            className="ti-terminal-indicator-line ti-terminal-indicator-line--ema20"
            d={ema20Path}
            fill="none"
          />
        ) : null}

        {geometry.items.map(
          (item, index) => {
            const tone =
              item.positive
                ? "positive"
                : "negative";

            const selected =
              selectedIndex === index;

            return (
              <g
                key={
                  item.candle.time
                }
                className={[
                  "ti-terminal-candle",
                  `ti-terminal-candle--${tone}`,
                  selected
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
                {selected ? (
                  <>
                    <line
                      className="ti-terminal-crosshair ti-terminal-crosshair--vertical"
                      x1={item.x}
                      x2={item.x}
                      y1={PAD_Y}
                      y2={HEIGHT - PAD_Y}
                    />

                    <line
                      className="ti-terminal-crosshair ti-terminal-crosshair--horizontal"
                      x1={PAD_X}
                      x2={WIDTH - PAD_X}
                      y1={item.closeY}
                      y2={item.closeY}
                    />
                  </>
                ) : null}

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
