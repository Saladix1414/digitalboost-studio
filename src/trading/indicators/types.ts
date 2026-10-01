import type {
  Candle,
} from "../types/trading";

export type IndicatorPoint = {
  readonly index: number;
  readonly value: number;
};

export type IndicatorSeries = {
  readonly ema20: readonly IndicatorPoint[];
  readonly ema50: readonly IndicatorPoint[];
  readonly rsi14: readonly IndicatorPoint[];
};

export type IndicatorSnapshot = {
  readonly ema20: number;
  readonly ema50: number;
  readonly rsi14: number;
  readonly volume: number;
};

export type IndicatorAnalysis = {
  readonly snapshot: IndicatorSnapshot;
  readonly series: IndicatorSeries;
};

export type IndicatorEngine = {
  snapshot(
    candles: readonly Candle[]
  ): IndicatorSnapshot;

  series(
    candles: readonly Candle[]
  ): IndicatorSeries;

  analyze(
    candles: readonly Candle[]
  ): IndicatorAnalysis;
};
