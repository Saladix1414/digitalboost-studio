import {
  validateTradingBot,
} from "../bots";

import {
  validateStrategy,
} from "../strategy";

import type {
  RiskReview,
  RiskReviewCheck,
  RiskReviewDecision,
  RiskReviewInput,
} from "./reviewTypes";

export function reviewPaperRisk(
  input:
    RiskReviewInput
): RiskReviewDecision {
  const botValidation =
    validateTradingBot(
      input.bot
    );

  const strategyValidation =
    validateStrategy(
      input.strategy
    );

  const checks:
    RiskReviewCheck[] = [
      {
        id:
          "strategy-valid",

        passed:
          strategyValidation.valid,

        message:
          strategyValidation.valid
            ? "Strategy validation passed."
            : "Strategy validation failed.",
      },

      {
        id:
          "paper-only",

        passed:
          input.bot.executionMode ===
            "paper-only" &&
          input.strategy.executionMode ===
            "paper-only",

        message:
          "Strategy and bot must remain paper-only.",
      },

      {
        id:
          "order-limit",

        passed:
          input.bot.risk.maxOrderNotional >
          0,

        message:
          "Maximum order notional must be defined.",
      },

      {
        id:
          "position-limit",

        passed:
          input.bot.risk.maxPositionNotional >=
          input.bot.risk.maxOrderNotional,

        message:
          "Position limit must cover at least one maximum-sized order.",
      },

      {
        id:
          "cash-reserve",

        passed:
          input.bot.risk.minCashReserve >=
          0,

        message:
          "Minimum paper cash reserve must not be negative.",
      },

      {
        id:
          "risk-reward",

        passed:
          input.strategy.risk.stopLossPercent >
            0 &&
          input.strategy.risk.takeProfitPercent >
            0,

        message:
          "Strategy requires explicit stop-loss and take-profit intent.",
      },
    ];

  const approved =
    botValidation.valid &&
    checks.every(
      (
        check
      ) =>
        check.passed
    );

  const review:
    RiskReview = {
      id:
        `risk-review-${input.bot.id}`,

      botId:
        input.bot.id,

      strategyId:
        input.strategy.id,

      status:
        approved
          ? "approved"
          : "rejected",

      checks,

      approvedFor:
        "paper-only",

      authoritative:
        true,
    };

  return {
    review,
    approved,
  };
}
