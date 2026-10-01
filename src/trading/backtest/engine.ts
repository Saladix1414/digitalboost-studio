import {
  evaluateStrategyHistory,
} from "../strategy";

import type {
  TradingStrategy,
} from "../strategy";

import type {
  Candle,
} from "../types/trading";

import type {
  BacktestEquityPoint,
  BacktestMetrics,
  BacktestResult,
  BacktestTrade,
} from "./types";

export type BacktestOptions = {
  readonly initialCapital:
    number;
};

function calculateMaxDrawdown(
  equityCurve:
    readonly BacktestEquityPoint[]
): number {
  if (
    equityCurve.length === 0
  ) {
    return 0;
  }

  let peak =
    equityCurve[0].equity;

  let maxDrawdown = 0;

  for (
    const point of
    equityCurve
  ) {
    peak =
      Math.max(
        peak,
        point.equity
      );

    if (
      peak <= 0
    ) {
      continue;
    }

    const drawdown =
      (
        peak -
        point.equity
      ) /
      peak *
      100;

    maxDrawdown =
      Math.max(
        maxDrawdown,
        drawdown
      );
  }

  return maxDrawdown;
}

export function runBacktest(
  strategy:
    TradingStrategy,

  candles:
    readonly Candle[],

  options:
    BacktestOptions = {
      initialCapital:
        10_000,
    }
): BacktestResult {
  const history =
    evaluateStrategyHistory(
      strategy,
      candles
    );

  const trades:
    BacktestTrade[] = [];

  const equityCurve:
    BacktestEquityPoint[] = [];

  let equity =
    options.initialCapital;

  let openIndex:
    number | null =
      null;

  for (
    const point of
    history.points
  ) {
    if (
      openIndex === null &&
      point.evaluation.signal !==
        "none"
    ) {
      openIndex =
        point.index;
    } else if (
      openIndex !== null &&
      point.evaluation.invalidated
    ) {
      const entry =
        candles[
          openIndex
        ];

      const exit =
        point.candle;

      const allocation =
        equity *
        (
          strategy.risk
            .maxPositionPercent /
          100
        );

      const quantity =
        entry.close > 0
          ? allocation /
            entry.close
          : 0;

      const direction =
        strategy.side ===
        "long"
          ? 1
          : -1;

      const grossPnl =
        (
          exit.close -
          entry.close
        ) *
        quantity *
        direction;

      equity +=
        grossPnl;

      trades.push({
        id:
          `${strategy.id}-${trades.length + 1}`,

        side:
          strategy.side,

        entryIndex:
          openIndex,

        exitIndex:
          point.index,

        entryPrice:
          entry.close,

        exitPrice:
          exit.close,

        quantity,

        grossPnl,

        returnPercent:
          allocation > 0
            ? grossPnl /
              allocation *
              100
            : 0,
      });

      openIndex =
        null;
    }

    equityCurve.push({
      index:
        point.index,

      equity,
    });
  }

  const winningTrades =
    trades.filter(
      (
        trade
      ) =>
        trade.grossPnl > 0
    ).length;

  const losingTrades =
    trades.filter(
      (
        trade
      ) =>
        trade.grossPnl < 0
    ).length;

  const metrics:
    BacktestMetrics = {
      initialCapital:
        options.initialCapital,

      finalCapital:
        equity,

      netPnl:
        equity -
        options.initialCapital,

      returnPercent:
        options.initialCapital > 0
          ? (
              equity -
              options.initialCapital
            ) /
            options.initialCapital *
            100
          : 0,

      totalTrades:
        trades.length,

      winningTrades,
      losingTrades,

      winRatePercent:
        trades.length > 0
          ? winningTrades /
            trades.length *
            100
          : 0,

      maxDrawdownPercent:
        calculateMaxDrawdown(
          equityCurve
        ),
    };

  return {
    strategyId:
      strategy.id,

    symbol:
      strategy.symbol,

    timeframe:
      strategy.timeframe,

    trades,
    equityCurve,
    metrics,

    executionMode:
      "simulation-only",
  };
}

export default runBacktest;
