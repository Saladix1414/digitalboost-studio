import type {
  DbxHoldStore,
  DbxLedger,
} from "../../ledger/types";

import type {
  DbxConsumptionHoldBinding,
} from "../holdBindingTypes";

import type {
  DbxConsumptionIntent,
  DbxConsumptionPostingRecord,
  DbxConsumptionRegistry,
} from "../types";

import type {
  DbxConsumptionRecoveryState,
} from "../recovery/types";

export type DbxConsumptionOrchestrationInput = {
  readonly ledger:
    DbxLedger;

  readonly holdStore:
    DbxHoldStore;

  readonly registry:
    DbxConsumptionRegistry;

  readonly intent:
    DbxConsumptionIntent;

  readonly binding:
    DbxConsumptionHoldBinding;

  readonly recovery:
    DbxConsumptionRecoveryState;

  readonly now:
    string;
};

export type DbxConsumptionOrchestrationSuccess = {
  readonly status:
    "COMPLETED";

  readonly ledger:
    DbxLedger;

  readonly holdStore:
    DbxHoldStore;

  readonly registry:
    DbxConsumptionRegistry;

  readonly recovery:
    DbxConsumptionRecoveryState;

  readonly record:
    DbxConsumptionPostingRecord;

  readonly idempotentReplay:
    boolean;

  readonly authoritative:
    false;
};

export type DbxConsumptionOrchestrationFailure = {
  readonly status:
    "RETRY_PENDING" |
    "TERMINAL_FAILURE";

  readonly ledger:
    DbxLedger;

  readonly holdStore:
    DbxHoldStore;

  readonly registry:
    DbxConsumptionRegistry;

  readonly recovery:
    DbxConsumptionRecoveryState;

  readonly record:
    null;

  readonly idempotentReplay:
    false;

  readonly authoritative:
    false;
};

export type DbxConsumptionOrchestrationResult =
  | DbxConsumptionOrchestrationSuccess
  | DbxConsumptionOrchestrationFailure;
