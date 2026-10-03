import type {
  DbxConsumptionAuditTrace,
  DbxConsumptionTraceEvent,
  DbxConsumptionTraceEventType,
} from "./types";

export function createDbxConsumptionAuditTrace(
  consumptionIntentId:
    string
): DbxConsumptionAuditTrace {
  if (
    consumptionIntentId.trim()
      .length === 0
  ) {
    throw new Error(
      "DBX_CONSUMPTION_TRACE_INTENT_REQUIRED"
    );
  }

  return {
    id:
      `dbx-consumption-trace:${consumptionIntentId}`,

    consumptionIntentId,

    events:
      [],

    observable:
      true,

    authoritative:
      false,
  };
}

export function appendDbxConsumptionTraceEvent(
  trace:
    DbxConsumptionAuditTrace,

  input: {
    readonly eventType:
      DbxConsumptionTraceEventType;

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
  }
): DbxConsumptionAuditTrace {
  if (
    !Number.isSafeInteger(
      input.attempt
    ) ||
    input.attempt < 0
  ) {
    throw new Error(
      "DBX_CONSUMPTION_TRACE_ATTEMPT_INVALID"
    );
  }

  const sequence =
    trace.events.length + 1;

  const event:
    DbxConsumptionTraceEvent = {
    id: [
      trace.id,
      input.recoveryId,
      input.attempt,
      input.eventType,
      sequence,
    ].join(":"),

    eventType:
      input.eventType,

    consumptionIntentId:
      trace.consumptionIntentId,

    recoveryId:
      input.recoveryId,

    holdId:
      input.holdId,

    attempt:
      input.attempt,

    transactionId:
      input.transactionId,

    failureCode:
      input.failureCode,

    occurredAt:
      input.occurredAt,

    sequence,

    authoritative:
      false,
  };

  return {
    ...trace,

    events: [
      ...trace.events,
      event,
    ],

    observable:
      true,

    authoritative:
      false,
  };
}
