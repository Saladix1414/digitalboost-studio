import type {
  Candle,
  MarketAsset,
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

export type MarketDataMode =
  | "local-fixture";

export type MarketDataSnapshot = {
  readonly mode: MarketDataMode;
  readonly updatedAt: string;
  readonly markets: readonly MarketAsset[];
};

export type MarketDataSource = {
  readonly mode: MarketDataMode;

  getHealth(): MarketDataHealth;

  getSnapshot(): MarketDataSnapshot;

  getMarkets(): readonly MarketAsset[];

  getMarket(
    symbol: MarketSymbol
  ): MarketAsset | undefined;

  getCandles(
    symbol: MarketSymbol,
    timeframe: TradingTimeframe
  ): readonly Candle[];
};

export type MarketDataStatus =
  | "loading"
  | "ready"
  | "stale"
  | "error";

export type MarketDataHealth = {
  readonly status: MarketDataStatus;
  readonly sourceLabel: string;
  readonly lastUpdatedAt: string;
  readonly message?: string;
};
