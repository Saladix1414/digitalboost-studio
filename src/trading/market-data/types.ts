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
