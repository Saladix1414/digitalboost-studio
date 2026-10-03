export type DbxConsumptionRecoveryStatus =
  | "READY"
  | "PROCESSING"
  | "RETRY_PENDING"
  | "COMPLETED"
  | "TERMINAL_FAILURE";

export type DbxConsumptionFailureClass =
  | "RETRYABLE"
  | "TERMINAL";

export type DbxConsumptionFailureCode =
  | "LEDGER_TEMPORARY_FAILURE"
  | "DEPENDENCY_TEMPORARY_FAILURE"
  | "CONCURRENCY_CONFLICT"
  | "HOLD_EXPIRED"
  | "BINDING_INVALID"
  | "INSUFFICIENT_BALANCE"
  | "POLICY_REJECTED"
  | "CANCELLED";

export type DbxConsumptionRecoveryState = {
  readonly id: string;

  readonly consumptionIntentId: string;
  readonly holdId: string;

  readonly status:
    DbxConsumptionRecoveryStatus;

  readonly attempt:
    number;

  readonly lastFailureCode:
    DbxConsumptionFailureCode | null;

  readonly lastFailureClass:
    DbxConsumptionFailureClass | null;

  readonly transactionId:
    string | null;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;

  readonly authoritative:
    false;
};
