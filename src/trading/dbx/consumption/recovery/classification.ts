import type {
  DbxConsumptionFailureClass,
  DbxConsumptionFailureCode,
} from "./types";

export function classifyDbxConsumptionFailure(
  code:
    DbxConsumptionFailureCode
): DbxConsumptionFailureClass {
  switch (code) {
    case "LEDGER_TEMPORARY_FAILURE":
    case "DEPENDENCY_TEMPORARY_FAILURE":
    case "CONCURRENCY_CONFLICT":
      return "RETRYABLE";

    case "HOLD_EXPIRED":
    case "BINDING_INVALID":
    case "INSUFFICIENT_BALANCE":
    case "POLICY_REJECTED":
    case "CANCELLED":
      return "TERMINAL";
  }
}
