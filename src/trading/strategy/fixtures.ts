import type {
  TradingStrategy,
} from "./types";

export const mockStrategies:
  readonly TradingStrategy[] = [
    {
      id:
        "btc-ema-rsi-long",

      name:
        "BTC EMA Momentum",

      symbol:
        "BTC",

      timeframe:
        "1h",

      side:
        "long",

      entryLogic:
        "and",

      entryConditions: [
        {
          id:
            "ema20-over-ema50",

          left: {
            kind:
              "indicator",

            indicator:
              "ema20",
          },

          comparator:
            "above",

          right: {
            kind:
              "indicator",

            indicator:
              "ema50",
          },
        },

        {
          id:
            "rsi-over-55",

          left: {
            kind:
              "indicator",

            indicator:
              "rsi14",
          },

          comparator:
            "greater_than",

          right: {
            kind:
              "value",

            value:
              55,
          },
        },
      ],

      invalidationLogic:
        "or",

      invalidationConditions: [
        {
          id:
            "rsi-below-40",

          left: {
            kind:
              "indicator",

            indicator:
              "rsi14",
          },

          comparator:
            "less_than",

          right: {
            kind:
              "value",

            value:
              40,
          },
        },
      ],

      risk: {
        maxPositionPercent:
          10,

        stopLossPercent:
          2,

        takeProfitPercent:
          4,
      },

      executionMode:
        "paper-only",
    },
  ];
