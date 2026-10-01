import type {
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

export type TradingBotStatus =
  | "draft"
  | "validated"
  | "paper-running"
  | "paused"
  | "stopped";

export type TradingBotExecutionMode =
  | "paper-only";

export type TradingBotRiskProfile = {
  readonly maxOrderNotional:
    number;

  readonly maxPositionNotional:
    number;

  readonly minCashReserve:
    number;
};

export type TradingBot = {
  readonly id: string;

  readonly name: string;

  readonly strategyId:
    string;

  readonly symbol:
    MarketSymbol;

  readonly timeframe:
    TradingTimeframe;

  readonly status:
    TradingBotStatus;

  readonly executionMode:
    TradingBotExecutionMode;

  readonly risk:
    TradingBotRiskProfile;
};

export type TradingBotValidationIssue = {
  readonly field:
    string;

  readonly message:
    string;
};

export type TradingBotValidationResult = {
  readonly valid:
    boolean;

  readonly issues:
    readonly TradingBotValidationIssue[];
};

export type TradingBotAssessment = {
  readonly bot:
    TradingBot;

  readonly validation:
    TradingBotValidationResult;

  readonly canStartPaper:
    boolean;

  readonly liveDeployable:
    false;
};
