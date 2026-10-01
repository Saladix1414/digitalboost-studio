import type {
  TradingBot,
} from "../bots";

import type {
  RiskReview,
} from "../risk";

import type {
  TradingStrategy,
} from "../strategy";

import {
  createRuntimeBindingFingerprint,
} from "./binding";

export type RuntimeApprovalBindingResult = {
  readonly valid:
    boolean;

  readonly reason:
    string;
};

export function verifyRuntimeApproval(
  bot:
    TradingBot,

  strategy:
    TradingStrategy,

  review:
    RiskReview
): RuntimeApprovalBindingResult {
  if (
    review.status !==
    "approved"
  ) {
    return {
      valid:
        false,

      reason:
        "Risk review is not approved.",
    };
  }

  if (
    review.authoritative !==
    true
  ) {
    return {
      valid:
        false,

      reason:
        "Risk review is not authoritative.",
    };
  }

  if (
    review.approvedFor !==
    "paper-only"
  ) {
    return {
      valid:
        false,

      reason:
        "Risk review does not authorize paper execution.",
    };
  }

  if (
    review.botId !==
    bot.id
  ) {
    return {
      valid:
        false,

      reason:
        "Risk review is bound to a different bot.",
    };
  }

  if (
    review.strategyId !==
    strategy.id
  ) {
    return {
      valid:
        false,

      reason:
        "Risk review is bound to a different strategy.",
    };
  }

  if (
    bot.strategyId !==
    strategy.id
  ) {
    return {
      valid:
        false,

      reason:
        "Bot strategy binding does not match runtime strategy.",
    };
  }

  const runtimeBinding =
    createRuntimeBindingFingerprint(
      bot,
      strategy
    );

  if (
    review.bindingFingerprint !==
    runtimeBinding.value
  ) {
    return {
      valid:
        false,

      reason:
        "Risk review binding is stale because bot or strategy configuration changed.",
    };
  }

  return {
    valid:
      true,

    reason:
      "Paper runtime approval binding verified.",
  };
}
