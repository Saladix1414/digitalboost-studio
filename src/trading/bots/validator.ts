import type {
  TradingBot,
  TradingBotValidationIssue,
  TradingBotValidationResult,
} from "./types";

function issue(
  field: string,
  message: string
): TradingBotValidationIssue {
  return {
    field,
    message,
  };
}

export function validateTradingBot(
  bot:
    TradingBot
): TradingBotValidationResult {
  const issues:
    TradingBotValidationIssue[] = [];

  if (
    bot.name.trim().length <
    3
  ) {
    issues.push(
      issue(
        "name",
        "Bot name must contain at least 3 characters."
      )
    );
  }

  if (
    !bot.strategyId.trim()
  ) {
    issues.push(
      issue(
        "strategyId",
        "Bot must reference a strategy."
      )
    );
  }

  if (
    bot.executionMode !==
    "paper-only"
  ) {
    issues.push(
      issue(
        "executionMode",
        "Trading bots are currently restricted to paper-only execution."
      )
    );
  }

  if (
    bot.risk.maxOrderNotional <=
    0
  ) {
    issues.push(
      issue(
        "risk.maxOrderNotional",
        "Max order notional must be greater than zero."
      )
    );
  }

  if (
    bot.risk.maxPositionNotional <
    bot.risk.maxOrderNotional
  ) {
    issues.push(
      issue(
        "risk.maxPositionNotional",
        "Max position notional cannot be lower than max order notional."
      )
    );
  }

  if (
    bot.risk.minCashReserve <
    0
  ) {
    issues.push(
      issue(
        "risk.minCashReserve",
        "Minimum cash reserve cannot be negative."
      )
    );
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
