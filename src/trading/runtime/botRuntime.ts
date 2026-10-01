import {
  executePaperOrder,
} from "../paper";

import {
  verifyRuntimeApproval,
} from "./approval";

import type {
  PaperOrderSide,
} from "../paper";

import type {
  BotRuntimeContext,
  BotRuntimeResult,
} from "./types";

function resolveOrderSide(
  context:
    BotRuntimeContext
): PaperOrderSide {
  return context.strategy.side ===
    "long"
    ? "buy"
    : "sell";
}

export function runBotRuntimeStep(
  context:
    BotRuntimeContext
): BotRuntimeResult {
  if (
    context.bot.status !==
    "paper-running"
  ) {
    return {
      botId:
        context.bot.id,

      decision:
        "inactive",

      account:
        context.account,

      reason:
        "Bot is not in paper-running state.",

      approvalReviewId:
        context.approval.id,

      approvalBotId:
        context.approval.botId,

      approvalStrategyId:
        context.approval.strategyId,

      approvalBindingFingerprint:
        context.approval.bindingFingerprint,

      liveExecution:
        false,
    };
  }

  if (
    context.bot.executionMode !==
    "paper-only"
  ) {
    return {
      botId:
        context.bot.id,

      decision:
        "inactive",

      account:
        context.account,

      reason:
        "Bot execution mode is not paper-only.",

      approvalReviewId:
        context.approval.id,

      approvalBotId:
        context.approval.botId,

      approvalStrategyId:
        context.approval.strategyId,

      approvalBindingFingerprint:
        context.approval.bindingFingerprint,

      liveExecution:
        false,
    };
  }

  const approval =
    verifyRuntimeApproval(
      context.bot,
      context.strategy,
      context.approval
    );

  if (
    !approval.valid
  ) {
    return {
      botId:
        context.bot.id,

      decision:
        "approval-rejected",

      account:
        context.account,

      reason:
        approval.reason,

      approvalReviewId:
        context.approval.id,

      approvalBotId:
        context.approval.botId,

      approvalStrategyId:
        context.approval.strategyId,

      approvalBindingFingerprint:
        context.approval.bindingFingerprint,

      liveExecution:
        false,
    };
  }

  if (
    !context.evaluation.valid ||
    context.evaluation.invalidated ||
    context.evaluation.signal ===
      "none"
  ) {
    return {
      botId:
        context.bot.id,

      decision:
        "no-signal",

      account:
        context.account,

      reason:
        "Strategy evaluation does not authorize a paper action.",

      approvalReviewId:
        context.approval.id,

      approvalBotId:
        context.approval.botId,

      approvalStrategyId:
        context.approval.strategyId,

      approvalBindingFingerprint:
        context.approval.bindingFingerprint,

      liveExecution:
        false,
    };
  }

  const orderId =
    `bot-${context.bot.id}-${context.account.orders.length + 1}`;

  const execution =
    executePaperOrder(
      context.account,
      {
        id:
          orderId,

        symbol:
          context.bot.symbol,

        side:
          resolveOrderSide(
            context
          ),

        quantity:
          context.market.quantity,

        marketPrice:
          context.market.marketPrice,

        feePercent:
          0.10,
      },
      context.bot.risk
    );

  if (
    !execution.riskApproved
  ) {
    return {
      botId:
        context.bot.id,

      decision:
        "risk-rejected",

      account:
        context.account,

      reason:
        execution.reason,

      orderId,

      approvalReviewId:
        context.approval.id,

      approvalBotId:
        context.approval.botId,

      approvalStrategyId:
        context.approval.strategyId,

      approvalBindingFingerprint:
        context.approval.bindingFingerprint,

      liveExecution:
        false,
    };
  }

  if (
    !execution.accepted ||
    !execution.fill
  ) {
    return {
      botId:
        context.bot.id,

      decision:
        "paper-rejected",

      account:
        context.account,

      reason:
        execution.reason,

      orderId,

      approvalReviewId:
        context.approval.id,

      approvalBotId:
        context.approval.botId,

      approvalStrategyId:
        context.approval.strategyId,

      approvalBindingFingerprint:
        context.approval.bindingFingerprint,

      liveExecution:
        false,
    };
  }

  return {
    botId:
      context.bot.id,

    decision:
      "paper-filled",

    account:
      execution.fill.state,

    reason:
      execution.reason,

    orderId,

    liveExecution:
      false,
  };
}

export default runBotRuntimeStep;
