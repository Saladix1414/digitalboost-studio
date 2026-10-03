import type {
  DbxConsumptionFailureCode,
} from "../recovery/types";

export function mapDbxConsumptionErrorToFailureCode(
  error:
    unknown
): DbxConsumptionFailureCode {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  if (
    message.includes(
      "DBX_LEDGER_IDEMPOTENCY_CONFLICT"
    ) ||
    message.includes(
      "DBX_CONSUMPTION_INTENT_CONFLICT"
    )
  ) {
    return "CONCURRENCY_CONFLICT";
  }

  if (
    message.includes(
      "DBX_HOLD_NOT_ACTIVE"
    ) ||
    message.includes(
      "DBX_CONSUMPTION_HOLD_NOT_ACTIVE"
    )
  ) {
    return "BINDING_INVALID";
  }

  if (
    message.includes(
      "HOLD_ACTIVE"
    ) ||
    message.includes(
      "ACCOUNT_MATCH"
    ) ||
    message.includes(
      "AMOUNT_MATCH"
    ) ||
    message.includes(
      "REFERENCE_MATCH"
    ) ||
    message.includes(
      "PURPOSE_COMPATIBLE"
    )
  ) {
    return "BINDING_INVALID";
  }

  if (
    message.includes(
      "INSUFFICIENT"
    )
  ) {
    return "INSUFFICIENT_BALANCE";
  }

  return "DEPENDENCY_TEMPORARY_FAILURE";
}
