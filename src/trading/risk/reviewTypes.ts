import type {
  TradingBot,
} from "../bots";

import type {
  TradingStrategy,
} from "../strategy";

export type RiskReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export type RiskReviewCheckId =
  | "strategy-valid"
  | "paper-only"
  | "order-limit"
  | "position-limit"
  | "cash-reserve"
  | "risk-reward";

export type RiskReviewCheck = {
  readonly id:
    RiskReviewCheckId;

  readonly passed:
    boolean;

  readonly message:
    string;
};

export type RiskReview = {
  readonly id:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly status:
    RiskReviewStatus;

  readonly checks:
    readonly RiskReviewCheck[];

  readonly approvedFor:
    "paper-only";

  readonly authoritative:
    true;
};

export type RiskReviewInput = {
  readonly bot:
    TradingBot;

  readonly strategy:
    TradingStrategy;
};

export type RiskReviewDecision = {
  readonly review:
    RiskReview;

  readonly approved:
    boolean;
};
