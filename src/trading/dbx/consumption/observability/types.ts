export type DbxConsumptionTraceEventType =
  | "ATTEMPT_STARTED"
  | "LEDGER_POSTED"
  | "HOLD_CAPTURED"
  | "COMPLETED"
  | "ATTEMPT_FAILED"
  | "RETRY_PENDING"
  | "HOLD_RELEASED"
  | "TERMINAL_FAILURE";

export type DbxConsumptionTraceEvent = {
  readonly id: string;

  readonly eventType:
    DbxConsumptionTraceEventType;

  readonly consumptionIntentId:
    string;

  readonly recoveryId:
    string;

  readonly holdId:
    string;

  readonly attempt:
    number;

  readonly transactionId:
    string | null;

  readonly failureCode:
    string | null;

  readonly occurredAt:
    string;

  readonly sequence:
    number;

  readonly authoritative:
    false;
};

export type DbxConsumptionAuditTrace = {
  readonly id: string;

  readonly consumptionIntentId:
    string;

  readonly events:
    readonly DbxConsumptionTraceEvent[];

  readonly observable:
    true;

  readonly authoritative:
    false;
};
