import type {
  MarketSymbol,
} from "../types/trading";

export type PaperOrderSide =
  | "buy"
  | "sell";

export type PaperOrderStatus =
  | "pending"
  | "filled"
  | "cancelled";

export type PaperOrder = {
  readonly id: string;

  readonly symbol:
    MarketSymbol;

  readonly side:
    PaperOrderSide;

  readonly quantity:
    number;

  readonly requestedPrice:
    number;

  readonly filledPrice?:
    number;

  readonly status:
    PaperOrderStatus;
};

export type PaperPosition = {
  readonly symbol:
    MarketSymbol;

  readonly quantity:
    number;

  readonly averageEntryPrice:
    number;

  readonly markPrice:
    number;

  readonly unrealizedPnl:
    number;
};

export type PaperLedgerEntry = {
  readonly id: string;

  readonly kind:
    | "deposit"
    | "trade"
    | "fee";

  readonly amount:
    number;

  readonly balanceAfter:
    number;

  readonly note:
    string;
};

export type PaperAccountState = {
  readonly cash:
    number;

  readonly positions:
    readonly PaperPosition[];

  readonly orders:
    readonly PaperOrder[];

  readonly ledger:
    readonly PaperLedgerEntry[];
};

export type PaperFillResult = {
  readonly state:
    PaperAccountState;

  readonly order:
    PaperOrder;

  readonly accepted:
    boolean;

  readonly reason?:
    string;
};
