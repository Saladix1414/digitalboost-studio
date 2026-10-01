import type {
  StrategyValidationIssue,
  StrategyValidationResult,
  TradingStrategy,
} from "./types";

function issue(
  field: string,
  message: string
): StrategyValidationIssue {
  return {
    field,
    message,
  };
}

export function validateStrategy(
  strategy: TradingStrategy
): StrategyValidationResult {
  const issues:
    StrategyValidationIssue[] = [];

  if (
    strategy.name.trim().length === 0
  ) {
    issues.push(
      issue(
        "name",
        "Strategy name is required."
      )
    );
  }

  if (
    strategy.entryConditions.length === 0
  ) {
    issues.push(
      issue(
        "entryConditions",
        "At least one entry condition is required."
      )
    );
  }

  if (
    strategy.risk.maxPositionPercent <= 0 ||
    strategy.risk.maxPositionPercent > 100
  ) {
    issues.push(
      issue(
        "risk.maxPositionPercent",
        "Max position percent must be between 0 and 100."
      )
    );
  }

  if (
    strategy.risk.stopLossPercent <= 0
  ) {
    issues.push(
      issue(
        "risk.stopLossPercent",
        "Stop loss percent must be greater than zero."
      )
    );
  }

  if (
    strategy.risk.takeProfitPercent <= 0
  ) {
    issues.push(
      issue(
        "risk.takeProfitPercent",
        "Take profit percent must be greater than zero."
      )
    );
  }

  if (
    strategy.executionMode !==
    "paper-only"
  ) {
    issues.push(
      issue(
        "executionMode",
        "Strategy execution must remain paper-only."
      )
    );
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
