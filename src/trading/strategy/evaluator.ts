import {
  validateStrategy,
} from "./validator";

import type {
  IndicatorSnapshot,
} from "../indicators";

import type {
  StrategyComparator,
  StrategyCondition,
  StrategyLogicOperator,
  StrategyOperand,
  TradingStrategy,
} from "./types";

import type {
  StrategyConditionResult,
  StrategyEvaluation,
  StrategyEvaluationContext,
  StrategyRuleGroupResult,
} from "./evaluation-types";

function resolveOperand(
  operand:
    StrategyOperand,

  snapshot:
    IndicatorSnapshot
): number {
  if (
    operand.kind ===
    "value"
  ) {
    return operand.value;
  }

  return snapshot[
    operand.indicator
  ];
}

function compareValues(
  comparator:
    StrategyComparator,

  currentLeft:
    number,

  currentRight:
    number,

  previousLeft?:
    number,

  previousRight?:
    number
): boolean {
  switch (
    comparator
  ) {
    case "above":
    case "greater_than":
      return (
        currentLeft >
        currentRight
      );

    case "below":
    case "less_than":
      return (
        currentLeft <
        currentRight
      );

    case "crosses_above":
      if (
        previousLeft ===
          undefined ||
        previousRight ===
          undefined
      ) {
        return false;
      }

      return (
        previousLeft <=
          previousRight &&
        currentLeft >
          currentRight
      );

    case "crosses_below":
      if (
        previousLeft ===
          undefined ||
        previousRight ===
          undefined
      ) {
        return false;
      }

      return (
        previousLeft >=
          previousRight &&
        currentLeft <
          currentRight
      );
  }
}

function evaluateCondition(
  condition:
    StrategyCondition,

  context:
    StrategyEvaluationContext
): StrategyConditionResult {
  const leftValue =
    resolveOperand(
      condition.left,
      context.current
    );

  const rightValue =
    resolveOperand(
      condition.right,
      context.current
    );

  const previousLeftValue =
    context.previous
      ? resolveOperand(
          condition.left,
          context.previous
        )
      : undefined;

  const previousRightValue =
    context.previous
      ? resolveOperand(
          condition.right,
          context.previous
        )
      : undefined;

  return {
    conditionId:
      condition.id,

    condition,

    matched:
      compareValues(
        condition.comparator,
        leftValue,
        rightValue,
        previousLeftValue,
        previousRightValue
      ),

    leftValue,
    rightValue,

    previousLeftValue,
    previousRightValue,
  };
}

function aggregateResults(
  logic:
    StrategyLogicOperator,

  results:
    readonly StrategyConditionResult[]
): boolean {
  if (
    results.length === 0
  ) {
    return false;
  }

  if (
    logic ===
    "and"
  ) {
    return results.every(
      (
        result
      ) =>
        result.matched
    );
  }

  return results.some(
    (
      result
    ) =>
      result.matched
  );
}

function evaluateGroup(
  conditions:
    readonly StrategyCondition[],

  logic:
    StrategyLogicOperator,

  context:
    StrategyEvaluationContext
): StrategyRuleGroupResult {
  const results =
    conditions.map(
      (
        condition
      ) =>
        evaluateCondition(
          condition,
          context
        )
    );

  return {
    logic,

    matched:
      aggregateResults(
        logic,
        results
      ),

    results,
  };
}

export function evaluateStrategy(
  strategy:
    TradingStrategy,

  context:
    StrategyEvaluationContext
): StrategyEvaluation {
  const validation =
    validateStrategy(
      strategy
    );

  const entry =
    evaluateGroup(
      strategy.entryConditions,
      strategy.entryLogic,
      context
    );

  const invalidation =
    evaluateGroup(
      strategy.invalidationConditions,
      strategy.invalidationLogic,
      context
    );

  const valid =
    validation.valid;

  const invalidated =
    valid &&
    invalidation.matched;

  const entryMatched =
    valid &&
    entry.matched;

  const signal =
    entryMatched &&
    !invalidated
      ? strategy.side
      : "none";

  return {
    strategyId:
      strategy.id,

    valid,

    entry,
    invalidation,

    entryMatched,
    invalidated,

    signal,

    executable:
      false,
  };
}

export const strategyEvaluator = {
  evaluate:
    evaluateStrategy,
} as const;

export default strategyEvaluator;
