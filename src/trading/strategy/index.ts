export {
  mockStrategies,
} from "./fixtures";

export {
  validateStrategy,
} from "./validator";

export {
  assessStrategy,
} from "./engine";

export type {
  StrategySide,
  StrategyIndicator,
  StrategyComparator,
  StrategyOperand,
  StrategyLogicOperator,
  StrategyCondition,
  StrategyRiskIntent,
  TradingStrategy,
  StrategyValidationIssue,
  StrategyValidationResult,
} from "./types";

export type {
  StrategyAssessment,
} from "./engine";

export {
  evaluateStrategy,
  strategyEvaluator,
} from "./evaluator";

export type {
  StrategySignal,
  StrategyEvaluationContext,
  StrategyConditionResult,
  StrategyRuleGroupResult,
  StrategyEvaluation,
  StrategyEvaluator,
} from "./evaluation-types";

export {
  evaluateStrategyHistory,
} from "./historical-evaluator";

export type {
  HistoricalStrategyPoint,
  HistoricalStrategyEvaluation,
} from "./historical-evaluator";
