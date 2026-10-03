import {
  orchestrateDbxConsumption,
} from "../orchestration/orchestrator";

import type {
  DbxConsumptionOrchestrationInput,
} from "../orchestration/types";

import {
  appendDbxConsumptionOrchestrationResultTrace,
  createDbxConsumptionAttemptTrace,
} from "./orchestrationTrace";

export function orchestrateObservableDbxConsumption(
  input:
    DbxConsumptionOrchestrationInput
) {
  const startedTrace =
    createDbxConsumptionAttemptTrace(
      input
    );

  const result =
    orchestrateDbxConsumption(
      input
    );

  const trace =
    appendDbxConsumptionOrchestrationResultTrace(
      startedTrace,
      result,
      input.now
    );

  return {
    ...result,

    trace,
  };
}
