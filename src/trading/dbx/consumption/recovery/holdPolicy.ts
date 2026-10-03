import type {
  DbxConsumptionRecoveryState,
} from "./types";

export type DbxConsumptionHoldRecoveryAction =
  | "KEEP_ACTIVE"
  | "RELEASE"
  | "CAPTURED";

export function resolveDbxConsumptionHoldRecoveryAction(
  state:
    DbxConsumptionRecoveryState
): DbxConsumptionHoldRecoveryAction {
  switch (
    state.status
  ) {
    case "READY":
    case "PROCESSING":
    case "RETRY_PENDING":
      return "KEEP_ACTIVE";

    case "TERMINAL_FAILURE":
      return "RELEASE";

    case "COMPLETED":
      return "CAPTURED";
  }
}
