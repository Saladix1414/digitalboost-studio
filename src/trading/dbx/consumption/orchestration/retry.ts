import {
  assertDbxConsumptionRetryAllowed,
} from "../recovery/retryPolicy";

import type {
  DbxConsumptionRetryPolicy,
} from "../recovery/retryPolicy";

import type {
  DbxConsumptionOrchestrationInput,
} from "./types";

import {
  orchestrateDbxConsumption,
} from "./orchestrator";

export function retryDbxConsumption(
  input:
    DbxConsumptionOrchestrationInput,

  policy:
    DbxConsumptionRetryPolicy
) {
  assertDbxConsumptionRetryAllowed(
    input.recovery,
    policy
  );

  return orchestrateDbxConsumption(
    input
  );
}
