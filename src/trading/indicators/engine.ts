import {
  calculateEMA,
} from "./ema";

import {
  calculateRSI,
} from "./rsi";

import type {
  IndicatorEngine,
  IndicatorSnapshot,
} from "./types";

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
  };

export default indicatorEngine;
