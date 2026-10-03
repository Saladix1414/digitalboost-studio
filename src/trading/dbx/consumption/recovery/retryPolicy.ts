import type {
  DbxConsumptionRecoveryState,
} from "./types";

export type DbxConsumptionRetryPolicy = {
  readonly maxAttempts:
    number;

  readonly authoritative:
    false;
};

export function assertDbxConsumptionRetryAllowed(
  state:
    DbxConsumptionRecoveryState,

  policy:
    DbxConsumptionRetryPolicy
) {
  if (
    !Number.isSafeInteger(
      policy.maxAttempts
    ) ||
    policy.maxAttempts <= 0
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RETRY_POLICY_INVALID"
    );
  }

  if (
    state.status !==
    "RETRY_PENDING"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RETRY_NOT_PENDING"
    );
  }

  if (
    state.attempt >=
    policy.maxAttempts
  ) {
    throw new Error(
      "DBX_CONSUMPTION_RETRY_LIMIT_REACHED"
    );
  }

  return {
    allowed:
      true as const,

    nextAttempt:
      state.attempt + 1,

    authoritative:
      false as const,
  };
}
