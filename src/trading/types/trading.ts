export type MarketSymbol =
  | "BTC"
  | "ETH"
  | "SOL";

export type MarketAsset = {
  readonly symbol: MarketSymbol;
  readonly name: string;
  readonly pair: `${MarketSymbol}/USDT`;
  readonly price: number;
  readonly change24h: number;
  readonly volume24h: number;
  readonly high24h: number;
  readonly low24h: number;
};

export type PortfolioPosition = {
  readonly symbol: MarketSymbol;
  readonly amount: number;
  readonly value: number;
  readonly allocation: number;
  readonly pnl: number;
};

export type PaperBotState =
  | "running"
  | "paused"
  | "stopped";

export type PaperBotSummary = {
  readonly id: string;
  readonly name: string;
  readonly symbol: MarketSymbol;
  readonly strategy: string;
  readonly state: PaperBotState;
  readonly pnl: number;
  readonly trades: number;
};

export type OverviewActivity = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly time: string;
  readonly tone:
    | "neutral"
    | "info"
    | "positive"
    | "warning"
    | "negative";
};

export type TradingTimeframe =
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "4h"
  | "1d";

export type Candle = {
  readonly time: string;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
};

export type MarketCandleSeries = {
  readonly symbol: MarketSymbol;
  readonly timeframe: TradingTimeframe;
  readonly candles: readonly Candle[];
};

export type PaperOrderSide =
  | "buy"
  | "sell";

export type PaperOrderType =
  | "market"
  | "limit";

export type PaperPosition = {
  readonly id: string;
  readonly symbol: MarketSymbol;
  readonly side: PaperOrderSide;
  readonly quantity: number;
  readonly entryPrice: number;
  readonly markPrice: number;
  readonly pnl: number;
};

export type PaperOrder = {
  readonly id: string;
  readonly symbol: MarketSymbol;
  readonly side: PaperOrderSide;
  readonly type: PaperOrderType;
  readonly quantity: number;
  readonly price: number;
  readonly status:
    | "preview"
    | "open"
    | "cancelled";
};
