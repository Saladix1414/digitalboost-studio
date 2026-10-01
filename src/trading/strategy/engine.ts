import {
  validateStrategy,
} from "./validator";

import type {
  StrategyValidationResult,
  TradingStrategy,
} from "./types";

export type StrategyAssessment = {
  readonly strategy:
    TradingStrategy;

  readonly validation:
    StrategyValidationResult;

  readonly deployable:
    false;
};

export function assessStrategy(
  strategy: TradingStrategy
): StrategyAssessment {
  return {
    strategy,

    validation:
      validateStrategy(
        strategy
      ),

    deployable:
      false,
  };
}
