import {
  indicatorEngine,
} from "../indicators";

import type {
  Candle,
} from "../types/trading";

import {
  evaluateStrategy,
} from "./evaluator";

import type {
  TradingStrategy,
} from "./types";

import type {
  StrategyEvaluation,
} from "./evaluation-types";

export type HistoricalStrategyPoint = {
  readonly index: number;

  readonly candle:
    Candle;

  readonly evaluation:
    StrategyEvaluation;
};

export type HistoricalStrategyEvaluation = {
  readonly strategyId:
    string;

  readonly points:
    readonly HistoricalStrategyPoint[];

  readonly signals:
    number;
};

export function evaluateStrategyHistory(
  strategy:
    TradingStrategy,

  candles:
    readonly Candle[]
): HistoricalStrategyEvaluation {
  const points:
    HistoricalStrategyPoint[] = [];

  for (
    let index = 0;
    index < candles.length;
    index += 1
  ) {
    const currentWindow =
      candles.slice(
        0,
        index + 1
      );

    const current =
      indicatorEngine.snapshot(
        currentWindow
      );

    const previous =
      index > 0
        ? indicatorEngine.snapshot(
            candles.slice(
              0,
              index
            )
          )
        : undefined;

    const evaluation =
      evaluateStrategy(
        strategy,
        {
          current,
          previous,
        }
      );

    points.push({
      index,
      candle:
        candles[index],
      evaluation,
    });
  }

  return {
    strategyId:
      strategy.id,

    points,

    signals:
      points.filter(
        (
          point
        ) =>
          point.evaluation.signal !==
          "none"
      ).length,
  };
}

export default evaluateStrategyHistory;
