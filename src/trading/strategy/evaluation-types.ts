import type {
  IndicatorSnapshot,
} from "../indicators";

import type {
  StrategyCondition,
  StrategyLogicOperator,
  TradingStrategy,
} from "./types";

export type StrategySignal =
  | "long"
  | "short"
  | "none";

export type StrategyEvaluationContext = {
  readonly current:
    IndicatorSnapshot;

  readonly previous?:
    IndicatorSnapshot;
};

export type StrategyConditionResult = {
  readonly conditionId: string;

  readonly condition:
    StrategyCondition;

  readonly matched:
    boolean;

  readonly leftValue:
    number;

  readonly rightValue:
    number;

  readonly previousLeftValue?:
    number;

  readonly previousRightValue?:
    number;
};

export type StrategyRuleGroupResult = {
  readonly logic:
    StrategyLogicOperator;

  readonly matched:
    boolean;

  readonly results:
    readonly StrategyConditionResult[];
};

export type StrategyEvaluation = {
  readonly strategyId: string;

  readonly valid:
    boolean;

  readonly entry:
    StrategyRuleGroupResult;

  readonly invalidation:
    StrategyRuleGroupResult;

  readonly entryMatched:
    boolean;

  readonly invalidated:
    boolean;

  readonly signal:
    StrategySignal;

  readonly executable:
    false;
};

export type StrategyEvaluator = {
  evaluate(
    strategy:
      TradingStrategy,

    context:
      StrategyEvaluationContext
  ): StrategyEvaluation;
};
