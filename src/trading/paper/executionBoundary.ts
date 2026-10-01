import {
  evaluatePaperRisk,
} from "../risk";

import {
  fillPaperMarketOrder,
} from "./engine";

import type {
  PaperRiskLimits,
} from "../risk";

import type {
  MarketSymbol,
} from "../types/trading";

import type {
  PaperAccountState,
  PaperFillResult,
  PaperOrderSide,
} from "./types";

export type PaperExecutionRequest = {
  readonly id: string;

  readonly symbol:
    MarketSymbol;

  readonly side:
    PaperOrderSide;

  readonly quantity:
    number;

  readonly marketPrice:
    number;

  readonly feePercent?:
    number;
};

export type PaperExecutionBoundaryResult = {
  readonly accepted:
    boolean;

  readonly riskApproved:
    boolean;

  readonly reason:
    string;

  readonly fill?:
    PaperFillResult;
};

export function executePaperOrder(
  account:
    PaperAccountState,

  request:
    PaperExecutionRequest,

  limits:
    PaperRiskLimits
): PaperExecutionBoundaryResult {
  const riskDecision =
    evaluatePaperRisk({
      account,

      intent: {
        symbol:
          request.symbol,

        side:
          request.side,

        quantity:
          request.quantity,

        marketPrice:
          request.marketPrice,
      },

      limits,
    });

  if (
    !riskDecision.approved
  ) {
    return {
      accepted:
        false,

      riskApproved:
        false,

      reason:
        riskDecision.reason,
    };
  }

  const fill =
    fillPaperMarketOrder(
      account,
      {
        id:
          request.id,

        symbol:
          request.symbol,

        side:
          request.side,

        quantity:
          request.quantity,

        marketPrice:
          request.marketPrice,

        feePercent:
          request.feePercent,
      }
    );

  return {
    accepted:
      fill.accepted,

    riskApproved:
      true,

    reason:
      fill.accepted
        ? "Paper execution accepted."
        : fill.reason ??
          "Paper execution rejected.",

    fill,
  };
}
