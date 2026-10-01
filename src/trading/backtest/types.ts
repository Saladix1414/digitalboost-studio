import type {
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

export type BacktestSide =
  | "long"
  | "short";

export type BacktestTrade = {
  readonly id: string;
  readonly side: BacktestSide;

  readonly entryIndex: number;
  readonly exitIndex: number;

  readonly entryPrice: number;
  readonly exitPrice: number;

  readonly quantity: number;

  readonly grossPnl: number;
  readonly returnPercent: number;
};

export type BacktestEquityPoint = {
  readonly index: number;
  readonly equity: number;
};

export type BacktestMetrics = {
  readonly initialCapital: number;
  readonly finalCapital: number;

  readonly netPnl: number;
  readonly returnPercent: number;

  readonly totalTrades: number;
  readonly winningTrades: number;
  readonly losingTrades: number;

  readonly winRatePercent: number;
  readonly maxDrawdownPercent: number;
};

export type BacktestResult = {
  readonly strategyId: string;

  readonly symbol:
    MarketSymbol;

  readonly timeframe:
    TradingTimeframe;

  readonly trades:
    readonly BacktestTrade[];

  readonly equityCurve:
    readonly BacktestEquityPoint[];

  readonly metrics:
    BacktestMetrics;

  readonly executionMode:
    "simulation-only";
};
