import type {
  DbxConsumptionOrchestrationInput,
  DbxConsumptionOrchestrationResult,
} from "../orchestration/types";

import {
  appendDbxConsumptionTraceEvent,
  createDbxConsumptionAuditTrace,
} from "./trace";

import type {
  DbxConsumptionAuditTrace,
} from "./types";

export function createDbxConsumptionAttemptTrace(
  input:
    DbxConsumptionOrchestrationInput
): DbxConsumptionAuditTrace {
  return appendDbxConsumptionTraceEvent(
    createDbxConsumptionAuditTrace(
      input.intent.id
    ),
    {
      eventType:
        "ATTEMPT_STARTED",

      recoveryId:
        input.recovery.id,

      holdId:
        input.binding.holdId,

      attempt:
        input.recovery.attempt + 1,

      transactionId:
        null,

      failureCode:
        null,

      occurredAt:
        input.now,
    }
  );
}

export function appendDbxConsumptionOrchestrationResultTrace(
  trace:
    DbxConsumptionAuditTrace,

  result:
    DbxConsumptionOrchestrationResult,

  occurredAt:
    string
): DbxConsumptionAuditTrace {
  const recovery =
    result.recovery;

  let next =
    trace;

  if (
    result.status ===
    "COMPLETED"
  ) {
    next =
      appendDbxConsumptionTraceEvent(
        next,
        {
          eventType:
            "LEDGER_POSTED",

          recoveryId:
            recovery.id,

          holdId:
            recovery.holdId,

          attempt:
            recovery.attempt,

          transactionId:
            recovery.transactionId,

          failureCode:
            null,

          occurredAt,
        }
      );

    next =
      appendDbxConsumptionTraceEvent(
        next,
        {
          eventType:
            "HOLD_CAPTURED",

          recoveryId:
            recovery.id,

          holdId:
            recovery.holdId,

          attempt:
            recovery.attempt,

          transactionId:
            recovery.transactionId,

          failureCode:
            null,

          occurredAt,
        }
      );

    return appendDbxConsumptionTraceEvent(
      next,
      {
        eventType:
          "COMPLETED",

        recoveryId:
          recovery.id,

        holdId:
          recovery.holdId,

        attempt:
          recovery.attempt,

        transactionId:
          recovery.transactionId,

        failureCode:
          null,

        occurredAt,
      }
    );
  }

  next =
    appendDbxConsumptionTraceEvent(
      next,
      {
        eventType:
          "ATTEMPT_FAILED",

        recoveryId:
          recovery.id,

        holdId:
          recovery.holdId,

        attempt:
          recovery.attempt,

        transactionId:
          null,

        failureCode:
          recovery.lastFailureCode,

        occurredAt,
      }
    );

  if (
    result.status ===
    "RETRY_PENDING"
  ) {
    return appendDbxConsumptionTraceEvent(
      next,
      {
        eventType:
          "RETRY_PENDING",

        recoveryId:
          recovery.id,

        holdId:
          recovery.holdId,

        attempt:
          recovery.attempt,

        transactionId:
          null,

        failureCode:
          recovery.lastFailureCode,

        occurredAt,
      }
    );
  }

  next =
    appendDbxConsumptionTraceEvent(
      next,
      {
        eventType:
          "HOLD_RELEASED",

        recoveryId:
          recovery.id,

        holdId:
          recovery.holdId,

        attempt:
          recovery.attempt,

        transactionId:
          null,

        failureCode:
          recovery.lastFailureCode,

        occurredAt,
      }
    );

  return appendDbxConsumptionTraceEvent(
    next,
    {
      eventType:
        "TERMINAL_FAILURE",

      recoveryId:
        recovery.id,

      holdId:
        recovery.holdId,

      attempt:
        recovery.attempt,

      transactionId:
        null,

      failureCode:
        recovery.lastFailureCode,

      occurredAt,
    }
  );
}
