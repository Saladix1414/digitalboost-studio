import type {
  Candle,
} from "../types/trading";

export type IndicatorPoint = {
  readonly index: number;
  readonly value: number;
};

export type IndicatorSnapshot = {
  readonly ema20: number;
  readonly ema50: number;
  readonly rsi14: number;
  readonly volume: number;
};

export type IndicatorEngine = {
  snapshot(
    candles: readonly Candle[]
  ): IndicatorSnapshot;
};
