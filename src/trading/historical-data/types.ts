import type {
  Candle,
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

export type HistoricalWindow =
  | 20
  | 50
  | 100
  | 200;

export type HistoricalSeriesRequest = {
  readonly symbol: MarketSymbol;
  readonly timeframe: TradingTimeframe;
  readonly window: HistoricalWindow;
};

export type HistoricalSeries = {
  readonly symbol: MarketSymbol;
  readonly timeframe: TradingTimeframe;
  readonly window: HistoricalWindow;
  readonly candles: readonly Candle[];
};

export type HistoricalDataSource = {
  getSeries(
    request: HistoricalSeriesRequest
  ): HistoricalSeries;
};
