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
