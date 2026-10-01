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
  BacktestExitReason,
  BacktestMetrics,
  BacktestResult,
  BacktestTrade,
} from "./types";

export type BacktestOptions = {
  readonly initialCapital:
    number;

  readonly feePercent?:
    number;

  readonly slippagePercent?:
    number;
};

type OpenPosition = {
  readonly entryIndex:
    number;

  readonly entryPrice:
    number;

  readonly quantity:
    number;

  readonly allocation:
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

function applySlippage(
  price: number,
  side:
    "entry" | "exit",
  strategySide:
    "long" | "short",
  slippagePercent:
    number
): number {
  const rate =
    slippagePercent /
    100;

  if (
    strategySide ===
    "long"
  ) {
    return side ===
      "entry"
      ? price *
        (1 + rate)
      : price *
        (1 - rate);
  }

  return side ===
    "entry"
    ? price *
      (1 - rate)
    : price *
      (1 + rate);
}

function calculateExitPrice(
  strategy:
    TradingStrategy,

  candle:
    Candle,

  position:
    OpenPosition,

  invalidated:
    boolean
): {
  readonly price: number;
  readonly reason:
    BacktestExitReason;
} | null {
  const entry =
    position.entryPrice;

  if (
    strategy.side ===
    "long"
  ) {
    const stop =
      entry *
      (
        1 -
        strategy.risk
          .stopLossPercent /
          100
      );

    const target =
      entry *
      (
        1 +
        strategy.risk
          .takeProfitPercent /
          100
      );

    if (
      candle.low <=
      stop
    ) {
      return {
        price:
          stop,
        reason:
          "stop-loss",
      };
    }

    if (
      candle.high >=
      target
    ) {
      return {
        price:
          target,
        reason:
          "take-profit",
      };
    }
  } else {
    const stop =
      entry *
      (
        1 +
        strategy.risk
          .stopLossPercent /
          100
      );

    const target =
      entry *
      (
        1 -
        strategy.risk
          .takeProfitPercent /
          100
      );

    if (
      candle.high >=
      stop
    ) {
      return {
        price:
          stop,
        reason:
          "stop-loss",
      };
    }

    if (
      candle.low <=
      target
    ) {
      return {
        price:
          target,
        reason:
          "take-profit",
      };
    }
  }

  if (
    invalidated
  ) {
    return {
      price:
        candle.close,
      reason:
        "invalidation",
    };
  }

  return null;
}

function closeTrade(
  strategy:
    TradingStrategy,

  position:
    OpenPosition,

  exitIndex:
    number,

  rawExitPrice:
    number,

  exitReason:
    BacktestExitReason,

  feePercent:
    number,

  slippagePercent:
    number
): BacktestTrade {
  const exitPrice =
    applySlippage(
      rawExitPrice,
      "exit",
      strategy.side,
      slippagePercent
    );

  const direction =
    strategy.side ===
    "long"
      ? 1
      : -1;

  const grossPnl =
    (
      exitPrice -
      position.entryPrice
    ) *
    position.quantity *
    direction;

  const entryNotional =
    position.entryPrice *
    position.quantity;

  const exitNotional =
    exitPrice *
    position.quantity;

  const fees =
    (
      entryNotional +
      exitNotional
    ) *
    (
      feePercent /
      100
    );

  const netPnl =
    grossPnl -
    fees;

  return {
    id:
      `${strategy.id}-${exitIndex}-${exitReason}`,

    side:
      strategy.side,

    entryIndex:
      position.entryIndex,

    exitIndex,

    entryPrice:
      position.entryPrice,

    exitPrice,

    quantity:
      position.quantity,

    grossPnl,
    fees,
    netPnl,

    returnPercent:
      position.allocation > 0
        ? netPnl /
          position.allocation *
          100
        : 0,

    exitReason,
  };
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
  const feePercent =
    Math.max(
      0,
      options.feePercent ??
        0
    );

  const slippagePercent =
    Math.max(
      0,
      options.slippagePercent ??
        0
    );

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

  let openPosition:
    OpenPosition | null =
      null;

  for (
    const point of
    history.points
  ) {
    if (
      openPosition ===
        null &&
      point.evaluation.signal !==
        "none"
    ) {
      const rawEntryPrice =
        point.candle.close;

      const entryPrice =
        applySlippage(
          rawEntryPrice,
          "entry",
          strategy.side,
          slippagePercent
        );

      const allocation =
        equity *
        (
          strategy.risk
            .maxPositionPercent /
          100
        );

      const quantity =
        entryPrice > 0
          ? allocation /
            entryPrice
          : 0;

      openPosition = {
        entryIndex:
          point.index,

        entryPrice,
        quantity,
        allocation,
      };
    } else if (
      openPosition !==
      null
    ) {
      const exit =
        calculateExitPrice(
          strategy,
          point.candle,
          openPosition,
          point.evaluation
            .invalidated
        );

      if (
        exit
      ) {
        const trade =
          closeTrade(
            strategy,
            openPosition,
            point.index,
            exit.price,
            exit.reason,
            feePercent,
            slippagePercent
          );

        equity +=
          trade.netPnl;

        trades.push(
          trade
        );

        openPosition =
          null;
      }
    }

    equityCurve.push({
      index:
        point.index,

      equity,
    });
  }

  if (
    openPosition !==
      null &&
    candles.length > 0
  ) {
    const finalIndex =
      candles.length - 1;

    const trade =
      closeTrade(
        strategy,
        openPosition,
        finalIndex,
        candles[
          finalIndex
        ].close,
        "end-of-window",
        feePercent,
        slippagePercent
      );

    equity +=
      trade.netPnl;

    trades.push(
      trade
    );

    if (
      equityCurve.length > 0
    ) {
      equityCurve[
        equityCurve.length -
        1
      ] = {
        index:
          finalIndex,
        equity,
      };
    }
  }

  const winningTrades =
    trades.filter(
      (
        trade
      ) =>
        trade.netPnl > 0
    );

  const losingTrades =
    trades.filter(
      (
        trade
      ) =>
        trade.netPnl < 0
    );

  const grossProfit =
    winningTrades.reduce(
      (
        total,
        trade
      ) =>
        total +
        trade.netPnl,
      0
    );

  const grossLoss =
    Math.abs(
      losingTrades.reduce(
        (
          total,
          trade
        ) =>
          total +
          trade.netPnl,
        0
      )
    );

  const totalFees =
    trades.reduce(
      (
        total,
        trade
      ) =>
        total +
        trade.fees,
      0
    );

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
        options.initialCapital >
        0
          ? (
              equity -
              options.initialCapital
            ) /
            options.initialCapital *
            100
          : 0,

      totalTrades:
        trades.length,

      winningTrades:
        winningTrades.length,

      losingTrades:
        losingTrades.length,

      winRatePercent:
        trades.length > 0
          ? winningTrades.length /
            trades.length *
            100
          : 0,

      maxDrawdownPercent:
        calculateMaxDrawdown(
          equityCurve
        ),

      grossProfit,
      grossLoss,

      profitFactor:
        grossLoss > 0
          ? grossProfit /
            grossLoss
          : grossProfit > 0
            ? Number.POSITIVE_INFINITY
            : 0,

      expectancy:
        trades.length > 0
          ? trades.reduce(
              (
                total,
                trade
              ) =>
                total +
                trade.netPnl,
              0
            ) /
            trades.length
          : 0,

      totalFees,
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
