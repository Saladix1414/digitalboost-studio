import {
  calculateEMA,
} from "./ema";

import {
  calculateRSI,
} from "./rsi";

import type {
  IndicatorAnalysis,
  IndicatorEngine,
  IndicatorSeries,
  IndicatorSnapshot,
} from "./types";

function toSeries(
  values: readonly number[]
) {
  return values.map(
    (value, index) => ({
      index,
      value,
    })
  );
}

export const indicatorEngine:
  IndicatorEngine = {
    snapshot(
      candles
    ): IndicatorSnapshot {
      const closes =
        candles.map(
          (candle) =>
            candle.close
        );

      const ema20 =
        calculateEMA(
          closes,
          20
        );

      const ema50 =
        calculateEMA(
          closes,
          50
        );

      return {
        ema20:
          ema20[
            ema20.length - 1
          ] ?? 0,

        ema50:
          ema50[
            ema50.length - 1
          ] ?? 0,

        rsi14:
          calculateRSI(
            closes,
            14
          ),

        volume:
          candles[
            candles.length - 1
          ]?.volume ?? 0,
      };
    },

    series(
      candles
    ): IndicatorSeries {
      const closes =
        candles.map(
          (candle) =>
            candle.close
        );

      return {
        ema20:
          toSeries(
            calculateEMA(
              closes,
              20
            )
          ),

        ema50:
          toSeries(
            calculateEMA(
              closes,
              50
            )
          ),
      };
    },

    analyze(
      candles
    ): IndicatorAnalysis {
      return {
        snapshot:
          this.snapshot(
            candles
          ),

        series:
          this.series(
            candles
          ),
      };
    },
  };

export default indicatorEngine;
