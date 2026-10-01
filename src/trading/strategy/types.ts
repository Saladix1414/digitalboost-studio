import type {
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

export type StrategySide =
  | "long"
  | "short";

export type StrategyIndicator =
  | "ema20"
  | "ema50"
  | "rsi14";

export type StrategyComparator =
  | "above"
  | "below"
  | "crosses_above"
  | "crosses_below"
  | "greater_than"
  | "less_than";

export type StrategyOperand =
  | {
      readonly kind: "indicator";
      readonly indicator:
        StrategyIndicator;
    }
  | {
      readonly kind: "value";
      readonly value: number;
    };

export type StrategyCondition = {
  readonly id: string;

  readonly left:
    StrategyOperand;

  readonly comparator:
    StrategyComparator;

  readonly right:
    StrategyOperand;
};

export type StrategyRiskIntent = {
  readonly maxPositionPercent:
    number;

  readonly stopLossPercent:
    number;

  readonly takeProfitPercent:
    number;
};

export type TradingStrategy = {
  readonly id: string;

  readonly name: string;

  readonly symbol:
    MarketSymbol;

  readonly timeframe:
    TradingTimeframe;

  readonly side:
    StrategySide;

  readonly entryConditions:
    readonly StrategyCondition[];

  readonly invalidationConditions:
    readonly StrategyCondition[];

  readonly risk:
    StrategyRiskIntent;

  readonly executionMode:
    "paper-only";
};

export type StrategyValidationIssue = {
  readonly field: string;
  readonly message: string;
};

export type StrategyValidationResult = {
  readonly valid: boolean;

  readonly issues:
    readonly StrategyValidationIssue[];
};
