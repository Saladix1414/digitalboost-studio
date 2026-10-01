import type {
  TradingBot,
} from "../bots";

import type {
  TradingStrategy,
} from "../strategy";

export type RuntimeBindingFingerprint = {
  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly value:
    string;
};

function stableNumber(
  value:
    number
): string {
  return Number.isFinite(
    value
  )
    ? String(value)
    : "invalid";
}

export function createRuntimeBindingFingerprint(
  bot:
    TradingBot,

  strategy:
    TradingStrategy
): RuntimeBindingFingerprint {
  const value = [
    `bot:${bot.id}`,
    `bot-strategy:${bot.strategyId}`,
    `symbol:${bot.symbol}`,
    `timeframe:${bot.timeframe}`,
    `mode:${bot.executionMode}`,
    `max-order:${stableNumber(
      bot.risk.maxOrderNotional
    )}`,
    `max-position:${stableNumber(
      bot.risk.maxPositionNotional
    )}`,
    `cash-reserve:${stableNumber(
      bot.risk.minCashReserve
    )}`,
    `strategy:${strategy.id}`,
    `strategy-symbol:${strategy.symbol}`,
    `strategy-timeframe:${strategy.timeframe}`,
    `strategy-mode:${strategy.executionMode}`,
    `strategy-position:${stableNumber(
      strategy.risk.maxPositionPercent
    )}`,
    `stop-loss:${stableNumber(
      strategy.risk.stopLossPercent
    )}`,
    `take-profit:${stableNumber(
      strategy.risk.takeProfitPercent
    )}`,
    `entry-logic:${strategy.entryLogic}`,
    `invalidation-logic:${strategy.invalidationLogic}`,
    `entry:${JSON.stringify(
      strategy.entryConditions
    )}`,
    `invalidation:${JSON.stringify(
      strategy.invalidationConditions
    )}`,
  ].join("|");

  return {
    botId:
      bot.id,

    strategyId:
      strategy.id,

    value,
  };
}
