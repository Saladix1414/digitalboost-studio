import {
  validateTradingBot,
} from "./validator";

import type {
  TradingBot,
  TradingBotAssessment,
  TradingBotStatus,
} from "./types";

const allowedTransitions:
  Readonly<
    Record<
      TradingBotStatus,
      readonly TradingBotStatus[]
    >
  > = {
    draft: [
      "validated",
      "stopped",
    ],

    validated: [
      "paper-running",
      "stopped",
    ],

    "paper-running": [
      "paused",
      "stopped",
    ],

    paused: [
      "paper-running",
      "stopped",
    ],

    stopped: [],
  };

export function assessTradingBot(
  bot:
    TradingBot
): TradingBotAssessment {
  const validation =
    validateTradingBot(
      bot
    );

  return {
    bot,

    validation,

    canStartPaper:
      validation.valid &&
      (
        bot.status ===
          "validated" ||
        bot.status ===
          "paused"
      ),

    liveDeployable:
      false,
  };
}

export function canTransitionBot(
  from:
    TradingBotStatus,

  to:
    TradingBotStatus
): boolean {
  return allowedTransitions[
    from
  ].includes(
    to
  );
}

export function transitionTradingBot(
  bot:
    TradingBot,

  nextStatus:
    TradingBotStatus
): TradingBot {
  if (
    !canTransitionBot(
      bot.status,
      nextStatus
    )
  ) {
    return bot;
  }

  return {
    ...bot,

    status:
      nextStatus,
  };
}
