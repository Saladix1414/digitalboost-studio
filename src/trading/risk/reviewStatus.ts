import type {
  TradingBot,
} from "../bots";

import {
  createRuntimeBindingFingerprint,
} from "../runtime";

import type {
  TradingStrategy,
} from "../strategy";

import type {
  RiskReview,
} from "./reviewTypes";

export type RiskReviewFreshness =
  | "current"
  | "stale";

export type RiskReviewFreshnessResult = {
  readonly freshness:
    RiskReviewFreshness;

  readonly reviewRequired:
    boolean;

  readonly reason:
    string;
};

export function evaluateRiskReviewFreshness(
  review:
    RiskReview,

  bot:
    TradingBot,

  strategy:
    TradingStrategy
): RiskReviewFreshnessResult {
  const binding =
    createRuntimeBindingFingerprint(
      bot,
      strategy
    );

  if (
    review.botId !==
      bot.id ||
    review.strategyId !==
      strategy.id
  ) {
    return {
      freshness:
        "stale",

      reviewRequired:
        true,

      reason:
        "Review target no longer matches the selected bot and strategy.",
    };
  }

  if (
    review.bindingFingerprint !==
    binding.value
  ) {
    return {
      freshness:
        "stale",

      reviewRequired:
        true,

      reason:
        "Bot or strategy configuration changed after this review.",
    };
  }

  return {
    freshness:
      "current",

    reviewRequired:
      false,

    reason:
      "Risk review matches the current bot and strategy configuration.",
  };
}
