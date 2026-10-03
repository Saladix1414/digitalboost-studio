import {
  applyDbxConsumptionFailureRecovery,
} from "../recovery/applyFailure";

import {
  beginDbxConsumptionAttempt,
  completeDbxConsumptionAttempt,
  failDbxConsumptionAttempt,
} from "../recovery/stateMachine";

import {
  postReservedDbxConsumption,
} from "../reservedPosting";

import {
  mapDbxConsumptionErrorToFailureCode,
} from "./failureMapper";

import type {
  DbxConsumptionOrchestrationInput,
  DbxConsumptionOrchestrationResult,
} from "./types";

export function orchestrateDbxConsumption(
  input:
    DbxConsumptionOrchestrationInput
): DbxConsumptionOrchestrationResult {
  if (
    input.recovery.status ===
      "COMPLETED"
  ) {
    const replay =
      postReservedDbxConsumption({
        ledger:
          input.ledger,

        holdStore:
          input.holdStore,

        registry:
          input.registry,

        intent:
          input.intent,

        binding:
          input.binding,

        verifiedAt:
          input.now,
      });

    return {
      status:
        "COMPLETED",

      ledger:
        replay.ledger,

      holdStore:
        replay.holdStore,

      registry:
        replay.registry,

      recovery:
        input.recovery,

      record:
        replay.record,

      idempotentReplay:
        true,

      authoritative:
        false,
    };
  }

  const processing =
    beginDbxConsumptionAttempt(
      input.recovery,
      input.now
    );

  try {
    const posted =
      postReservedDbxConsumption({
        ledger:
          input.ledger,

        holdStore:
          input.holdStore,

        registry:
          input.registry,

        intent:
          input.intent,

        binding:
          input.binding,

        verifiedAt:
          input.now,
      });

    const completed =
      completeDbxConsumptionAttempt(
        processing,
        posted.record.transactionId,
        input.now
      );

    return {
      status:
        "COMPLETED",

      ledger:
        posted.ledger,

      holdStore:
        posted.holdStore,

      registry:
        posted.registry,

      recovery:
        completed,

      record:
        posted.record,

      idempotentReplay:
        posted.idempotentReplay,

      authoritative:
        false,
    };
  } catch (
    error
  ) {
    const code =
      mapDbxConsumptionErrorToFailureCode(
        error
      );

    const failed =
      failDbxConsumptionAttempt(
        processing,
        code,
        input.now
      );

    const recoveryEffect =
      applyDbxConsumptionFailureRecovery({
        holdStore:
          input.holdStore,

        binding:
          input.binding,

        state:
          failed,

        now:
          input.now,
      });

    return {
      status:
        failed.status,

      ledger:
        input.ledger,

      holdStore:
        recoveryEffect.holdStore,

      registry:
        input.registry,

      recovery:
        failed,

      record:
        null,

      idempotentReplay:
        false,

      authoritative:
        false,
    };
  }
}
