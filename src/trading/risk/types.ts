import type {
  MarketSymbol,
} from "../types/trading";

import type {
  PaperAccountState,
  PaperOrderSide,
} from "../paper";

export type PaperRiskIntent = {
  readonly symbol:
    MarketSymbol;

  readonly side:
    PaperOrderSide;

  readonly quantity:
    number;

  readonly marketPrice:
    number;
};

export type PaperRiskLimits = {
  readonly maxOrderNotional:
    number;

  readonly maxPositionNotional:
    number;

  readonly minCashReserve:
    number;
};

export type PaperRiskDecision = {
  readonly approved:
    boolean;

  readonly reason:
    string;

  readonly orderNotional:
    number;

  readonly projectedCash:
    number;

  readonly projectedPositionNotional:
    number;
};

export type PaperRiskContext = {
  readonly account:
    PaperAccountState;

  readonly intent:
    PaperRiskIntent;

  readonly limits:
    PaperRiskLimits;
};
