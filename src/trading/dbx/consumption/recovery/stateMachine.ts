import type {
  DbxConsumptionFailureCode,
  DbxConsumptionRecoveryState,
} from "./types";

import {
  classifyDbxConsumptionFailure,
} from "./classification";

export function createDbxConsumptionRecoveryState(
  input: {
    readonly id: string;

    readonly consumptionIntentId:
      string;

    readonly holdId:
      string;

    readonly createdAt:
      string;
  }
): DbxConsumptionRecoveryState {
  return {
    id:
      input.id,

    consumptionIntentId:
      input.consumptionIntentId,

    holdId:
      input.holdId,

    status:
      "READY",

    attempt:
      0,

    lastFailureCode:
      null,

    lastFailureClass:
      null,

    transactionId:
      null,

    createdAt:
      input.createdAt,

    updatedAt:
      input.createdAt,

    authoritative:
      false,
  };
}

export function beginDbxConsumptionAttempt(
  state:
    DbxConsumptionRecoveryState,

  now:
    string
): DbxConsumptionRecoveryState {
  if (
    state.status !== "READY" &&
    state.status !== "RETRY_PENDING"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RECOVERY_INVALID_START_STATE"
    );
  }

  return {
    ...state,

    status:
      "PROCESSING",

    attempt:
      state.attempt + 1,

    updatedAt:
      now,

    authoritative:
      false,
  };
}

export function failDbxConsumptionAttempt(
  state:
    DbxConsumptionRecoveryState,

  code:
    DbxConsumptionFailureCode,

  now:
    string
): DbxConsumptionRecoveryState {
  if (
    state.status !==
    "PROCESSING"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RECOVERY_NOT_PROCESSING"
    );
  }

  const failureClass =
    classifyDbxConsumptionFailure(
      code
    );

  return {
    ...state,

    status:
      failureClass === "RETRYABLE"
        ? "RETRY_PENDING"
        : "TERMINAL_FAILURE",

    lastFailureCode:
      code,

    lastFailureClass:
      failureClass,

    updatedAt:
      now,

    authoritative:
      false,
  };
}

export function completeDbxConsumptionAttempt(
  state:
    DbxConsumptionRecoveryState,

  transactionId:
    string,

  now:
    string
): DbxConsumptionRecoveryState {
  if (
    state.status !==
    "PROCESSING"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RECOVERY_NOT_PROCESSING"
    );
  }

  if (
    transactionId.trim().length ===
    0
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RECOVERY_TRANSACTION_REQUIRED"
    );
  }

  return {
    ...state,

    status:
      "COMPLETED",

    transactionId,

    lastFailureCode:
      null,

    lastFailureClass:
      null,

    updatedAt:
      now,

    authoritative:
      false,
  };
}
