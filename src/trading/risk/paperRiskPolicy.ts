import type {
  PaperRiskContext,
  PaperRiskDecision,
} from "./types";

export const defaultPaperRiskLimits = {
  maxOrderNotional:
    2_500,

  maxPositionNotional:
    4_000,

  minCashReserve:
    1_000,
} as const;

export function evaluatePaperRisk(
  context:
    PaperRiskContext
): PaperRiskDecision {
  const {
    account,
    intent,
    limits,
  } = context;

  const orderNotional =
    intent.quantity *
    intent.marketPrice;

  const currentPosition =
    account.positions.find(
      (
        position
      ) =>
        position.symbol ===
        intent.symbol
    );

  const currentPositionNotional =
    currentPosition
      ? currentPosition.quantity *
        intent.marketPrice
      : 0;

  const projectedPositionNotional =
    intent.side ===
    "buy"
      ? currentPositionNotional +
        orderNotional
      : Math.max(
          0,
          currentPositionNotional -
            orderNotional
        );

  const projectedCash =
    intent.side ===
    "buy"
      ? account.cash -
        orderNotional
      : account.cash +
        orderNotional;

  if (
    intent.quantity <= 0 ||
    intent.marketPrice <= 0
  ) {
    return {
      approved:
        false,

      reason:
        "Invalid paper order intent.",

      orderNotional,
      projectedCash,
      projectedPositionNotional,
    };
  }

  if (
    orderNotional >
    limits.maxOrderNotional
  ) {
    return {
      approved:
        false,

      reason:
        "Paper order exceeds max order notional.",

      orderNotional,
      projectedCash,
      projectedPositionNotional,
    };
  }

  if (
    intent.side ===
      "buy" &&
    projectedCash <
      limits.minCashReserve
  ) {
    return {
      approved:
        false,

      reason:
        "Paper order would breach minimum cash reserve.",

      orderNotional,
      projectedCash,
      projectedPositionNotional,
    };
  }

  if (
    projectedPositionNotional >
    limits.maxPositionNotional
  ) {
    return {
      approved:
        false,

      reason:
        "Paper position would exceed max position notional.",

      orderNotional,
      projectedCash,
      projectedPositionNotional,
    };
  }

  return {
    approved:
      true,

    reason:
      "Paper risk checks passed.",

    orderNotional,
    projectedCash,
    projectedPositionNotional,
  };
}
