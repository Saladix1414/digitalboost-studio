import type {
  DbxConsumptionAuditTrace,
  DbxConsumptionTraceEventType,
} from "./types";

export function findDbxConsumptionTraceEvents(
  trace:
    DbxConsumptionAuditTrace,

  eventType:
    DbxConsumptionTraceEventType
) {
  return trace.events.filter(
    event =>
      event.eventType ===
      eventType
  );
}

export function getDbxConsumptionTraceSummary(
  trace:
    DbxConsumptionAuditTrace
) {
  const latest =
    trace.events[
      trace.events.length - 1
    ] ?? null;

  return {
    traceId:
      trace.id,

    consumptionIntentId:
      trace.consumptionIntentId,

    eventCount:
      trace.events.length,

    latestEventType:
      latest?.eventType ?? null,

    latestAttempt:
      latest?.attempt ?? null,

    latestTransactionId:
      latest?.transactionId ?? null,

    observable:
      true as const,

    authoritative:
      false as const,
  };
}
