import type {
  TradingBot,
} from "./types";

export const mockTradingBots:
  readonly TradingBot[] = [
    {
      id:
        "bot-btc-momentum-1",

      name:
        "BTC Momentum Paper Bot",

      strategyId:
        "btc-ema-momentum",

      symbol:
        "BTC",

      timeframe:
        "1h",

      status:
        "validated",

      executionMode:
        "paper-only",

      risk: {
        maxOrderNotional:
          2_500,

        maxPositionNotional:
          4_000,

        minCashReserve:
          1_000,
      },
    },
  ];
