import type {
  MarketSymbol,
} from "../types/trading";

import type {
  PaperAccountState,
  PaperFillResult,
  PaperLedgerEntry,
  PaperOrder,
  PaperOrderSide,
  PaperPosition,
} from "./types";

function createLedgerEntry(
  state:
    PaperAccountState,

  kind:
    PaperLedgerEntry["kind"],

  amount:
    number,

  balanceAfter:
    number,

  note:
    string
): PaperLedgerEntry {
  return {
    id:
      `paper-ledger-${state.ledger.length + 1}`,

    kind,
    amount,
    balanceAfter,
    note,
  };
}

function updatePosition(
  positions:
    readonly PaperPosition[],

  symbol:
    MarketSymbol,

  side:
    PaperOrderSide,

  quantity:
    number,

  fillPrice:
    number
): readonly PaperPosition[] {
  const existing =
    positions.find(
      (
        position
      ) =>
        position.symbol ===
        symbol
    );

  if (
    side ===
    "buy"
  ) {
    if (
      !existing
    ) {
      return [
        ...positions,
        {
          symbol,
          quantity,
          averageEntryPrice:
            fillPrice,
          markPrice:
            fillPrice,
          unrealizedPnl:
            0,
        },
      ];
    }

    const totalQuantity =
      existing.quantity +
      quantity;

    const averageEntryPrice =
      totalQuantity > 0
        ? (
            existing.quantity *
              existing.averageEntryPrice +
            quantity *
              fillPrice
          ) /
          totalQuantity
        : fillPrice;

    return positions.map(
      (
        position
      ) =>
        position.symbol ===
        symbol
          ? {
              ...position,
              quantity:
                totalQuantity,
              averageEntryPrice,
              markPrice:
                fillPrice,
              unrealizedPnl:
                (
                  fillPrice -
                  averageEntryPrice
                ) *
                totalQuantity,
            }
          : position
    );
  }

  if (
    !existing ||
    existing.quantity <
      quantity
  ) {
    return positions;
  }

  const remaining =
    existing.quantity -
    quantity;

  if (
    remaining ===
    0
  ) {
    return positions.filter(
      (
        position
      ) =>
        position.symbol !==
        symbol
    );
  }

  return positions.map(
    (
      position
    ) =>
      position.symbol ===
      symbol
        ? {
            ...position,
            quantity:
              remaining,
            markPrice:
              fillPrice,
            unrealizedPnl:
              (
                fillPrice -
                position.averageEntryPrice
              ) *
              remaining,
          }
        : position
  );
}

export function createPaperAccount(
  initialCash =
    10_000
): PaperAccountState {
  return {
    cash:
      initialCash,

    positions: [],
    orders: [],

    ledger: [
      {
        id:
          "paper-ledger-1",

        kind:
          "deposit",

        amount:
          initialCash,

        balanceAfter:
          initialCash,

        note:
          "Initial paper capital",
      },
    ],
  };
}

export function fillPaperMarketOrder(
  state:
    PaperAccountState,

  input: {
    readonly id:
      string;

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
  }
): PaperFillResult {
  if (
    input.quantity <= 0 ||
    input.marketPrice <= 0
  ) {
    return {
      state,

      accepted:
        false,

      reason:
        "Quantity and market price must be greater than zero.",

      order: {
        id:
          input.id,
        symbol:
          input.symbol,
        side:
          input.side,
        quantity:
          input.quantity,
        requestedPrice:
          input.marketPrice,
        status:
          "cancelled",
      },
    };
  }

  const feePercent =
    Math.max(
      0,
      input.feePercent ??
        0
    );

  const notional =
    input.quantity *
    input.marketPrice;

  const fee =
    notional *
    feePercent /
    100;

  if (
    input.side ===
    "buy" &&
    state.cash <
      notional + fee
  ) {
    return {
      state,

      accepted:
        false,

      reason:
        "Insufficient paper cash.",

      order: {
        id:
          input.id,
        symbol:
          input.symbol,
        side:
          input.side,
        quantity:
          input.quantity,
        requestedPrice:
          input.marketPrice,
        status:
          "cancelled",
      },
    };
  }

  const existing =
    state.positions.find(
      (
        position
      ) =>
        position.symbol ===
        input.symbol
    );

  if (
    input.side ===
      "sell" &&
    (
      !existing ||
      existing.quantity <
        input.quantity
    )
  ) {
    return {
      state,

      accepted:
        false,

      reason:
        "Insufficient paper position.",

      order: {
        id:
          input.id,
        symbol:
          input.symbol,
        side:
          input.side,
        quantity:
          input.quantity,
        requestedPrice:
          input.marketPrice,
        status:
          "cancelled",
      },
    };
  }

  const cashDelta =
    input.side ===
    "buy"
      ? -(notional + fee)
      : notional - fee;

  const cash =
    state.cash +
    cashDelta;

  const order:
    PaperOrder = {
      id:
        input.id,

      symbol:
        input.symbol,

      side:
        input.side,

      quantity:
        input.quantity,

      requestedPrice:
        input.marketPrice,

      filledPrice:
        input.marketPrice,

      status:
        "filled",
    };

  const tradeEntry =
    createLedgerEntry(
      state,
      "trade",
      cashDelta,
      cash,
      `${input.side.toUpperCase()} ${input.quantity} ${input.symbol}`
    );

  const feeEntry =
    fee > 0
      ? {
          id:
            `paper-ledger-${state.ledger.length + 2}`,

          kind:
            "fee" as const,

          amount:
            -fee,

          balanceAfter:
            cash,

          note:
            `Paper fee for ${input.id}`,
        }
      : null;

  return {
    accepted:
      true,

    order,

    state: {
      cash,

      positions:
        updatePosition(
          state.positions,
          input.symbol,
          input.side,
          input.quantity,
          input.marketPrice
        ),

      orders: [
        ...state.orders,
        order,
      ],

      ledger: [
        ...state.ledger,
        tradeEntry,
        ...(feeEntry
          ? [
              feeEntry,
            ]
          : []),
      ],
    },
  };
}
