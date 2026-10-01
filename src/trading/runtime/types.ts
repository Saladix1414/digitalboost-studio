import type {
  TradingBot,
} from "../bots";

import type {
  PaperAccountState,
} from "../paper";

import type {
  StrategyEvaluation,
  TradingStrategy,
} from "../strategy";

import type {
  RiskReview,
} from "../risk";

export type BotRuntimeMarketInput = {
  readonly marketPrice:
    number;

  readonly quantity:
    number;
};

export type BotRuntimeContext = {
  readonly bot:
    TradingBot;

  readonly strategy:
    TradingStrategy;

  readonly account:
    PaperAccountState;

  readonly evaluation:
    StrategyEvaluation;

  readonly approval:
    RiskReview;

  readonly market:
    BotRuntimeMarketInput;
};

export type BotRuntimeDecision =
  | "inactive"
  | "approval-rejected"
  | "no-signal"
  | "risk-rejected"
  | "paper-filled"
  | "paper-rejected";

export type BotRuntimeResult = {
  readonly botId:
    string;

  readonly decision:
    BotRuntimeDecision;

  readonly account:
    PaperAccountState;

  readonly reason:
    string;

  readonly orderId?:
    string;

  readonly approvalReviewId:
    string;

  readonly approvalBotId:
    string;

  readonly approvalStrategyId:
    string;

  readonly approvalBindingFingerprint:
    string;

  readonly liveExecution:
    false;
};
