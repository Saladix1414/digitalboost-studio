import {
  getMockCandles,
} from "../fixtures/candles";

import {
  mockMarkets,
} from "../fixtures/markets";

import type {
  MarketDataSnapshot,
  MarketDataSource,
} from "./types";

export const LOCAL_MARKET_UPDATED_AT =
  "2026-10-01T00:00:00Z";

export const localMarketData:
  MarketDataSource = {
    mode: "local-fixture",

    getSnapshot(): MarketDataSnapshot {
      return {
        mode:
          "local-fixture",
        updatedAt:
          LOCAL_MARKET_UPDATED_AT,
        markets:
          mockMarkets,
      };
    },

    getMarkets() {
      return mockMarkets;
    },

    getMarket(symbol) {
      return mockMarkets.find(
        (market) =>
          market.symbol ===
          symbol
      );
    },

    getCandles(
      symbol,
      timeframe
    ) {
      return getMockCandles(
        symbol,
        timeframe
      );
    },
  };

export default localMarketData;
