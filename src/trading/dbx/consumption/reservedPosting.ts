import type {
  DbxHoldStore,
  DbxLedger,
} from "../ledger/types";

import {
  captureDbxHold,
} from "../ledger/holdLifecycle";

import {
  buildDbxConsumptionLedgerTransaction,
} from "./ledgerTransaction";

import {
  evaluateDbxConsumptionHoldBinding,
} from "./holdBinding";

import {
  bindDbxConsumptionToHold,
} from "./reservedConsumption";

import {
  postDbxConsumption,
} from "./posting";

import type {
  DbxConsumptionHoldBinding,
} from "./holdBindingTypes";

import type {
  DbxConsumptionIntent,
  DbxConsumptionPostingRecord,
  DbxConsumptionRegistry,
} from "./types";

export type DbxReservedConsumptionResult = {
  readonly ledger:
    DbxLedger;

  readonly holdStore:
    DbxHoldStore;

  readonly registry:
    DbxConsumptionRegistry;

  readonly record:
    DbxConsumptionPostingRecord;

  readonly idempotentReplay:
    boolean;
};

function findConsumptionRecord(
  registry:
    DbxConsumptionRegistry,
  intentId:
    string
) {
  return registry.records.find(
    record =>
      record.intentId ===
      intentId
  );
}

export function postReservedDbxConsumption(
  input: {
    readonly ledger:
      DbxLedger;

    readonly holdStore:
      DbxHoldStore;

    readonly registry:
      DbxConsumptionRegistry;

    readonly intent:
      DbxConsumptionIntent;

    readonly binding:
      DbxConsumptionHoldBinding;

    readonly verifiedAt:
      string;
  }
): DbxReservedConsumptionResult {
  const expectedTransaction =
    buildDbxConsumptionLedgerTransaction(
      input.intent
    );

  const currentHold =
    input.holdStore.holds.find(
      hold =>
        hold.id ===
        input.binding.holdId
    );

  if (!currentHold) {
    throw new Error(
      "DBX_CONSUMPTION_HOLD_NOT_FOUND"
    );
  }

  /*
   * Exact retry after a successful posting + capture.
   *
   * The ledger, registry and hold must all point to the
   * same deterministic transaction before replay is accepted.
   */
  if (
    currentHold.status ===
      "CAPTURED"
  ) {
    if (
      currentHold
        .capturedTransactionId !==
      expectedTransaction.id
    ) {
      throw new Error(
        "DBX_CONSUMPTION_HOLD_CAPTURE_CONFLICT"
      );
    }

    const existingRecord =
      findConsumptionRecord(
        input.registry,
        input.intent.id
      );

    if (
      !existingRecord ||
      existingRecord.transactionId !==
        expectedTransaction.id
    ) {
      throw new Error(
        "DBX_CONSUMPTION_CAPTURE_REGISTRY_INCONSISTENT"
      );
    }

    const ledgerTransaction =
      input.ledger.transactions.find(
        transaction =>
          transaction.id ===
          expectedTransaction.id
      );

    if (!ledgerTransaction) {
      throw new Error(
        "DBX_CONSUMPTION_CAPTURE_LEDGER_INCONSISTENT"
      );
    }

    return {
      ledger:
        input.ledger,

      holdStore:
        input.holdStore,

      registry:
        input.registry,

      record:
        existingRecord,

      idempotentReplay:
        true,
    };
  }

  if (
    currentHold.status !==
      "ACTIVE"
  ) {
    throw new Error(
      "DBX_CONSUMPTION_HOLD_NOT_ACTIVE"
    );
  }

  /*
   * Never trust only the old binding snapshot.
   * Re-evaluate the actual hold immediately before posting.
   */
  const currentBinding =
    evaluateDbxConsumptionHoldBinding({
      id:
        input.binding.id,

      intent:
        input.intent,

      hold: {
        id:
          currentHold.id,

        accountId:
          currentHold.accountId,

        amountMinor:
          currentHold.amountMinor,

        purpose:
          currentHold.purpose,

        reference:
          currentHold.reference,

        status:
          currentHold.status,

        authoritative:
          false,
      },

      createdAt:
        input.verifiedAt,
    });

  bindDbxConsumptionToHold(
    input.intent,
    currentBinding
  );

  /*
   * Canonical DBX posting occurs first.
   *
   * All existing domain functions are immutable/pure:
   * no caller-visible state is changed until this function
   * successfully returns the complete next state.
   */
  const posting =
    postDbxConsumption(
      input.ledger,
      input.registry,
      input.intent
    ) as {
      readonly ledger:
        DbxLedger;

      readonly registry:
        DbxConsumptionRegistry;

      readonly record:
        DbxConsumptionPostingRecord;
    };

  if (
    posting.record.transactionId !==
      expectedTransaction.id
  ) {
    throw new Error(
      "DBX_CONSUMPTION_TRANSACTION_ID_MISMATCH"
    );
  }

  const captured =
    captureDbxHold(
      input.holdStore,
      currentHold.id,
      posting.record.transactionId
    );

  return {
    ledger:
      posting.ledger,

    holdStore:
      captured.store,

    registry:
      posting.registry,

    record:
      posting.record,

    idempotentReplay:
      false,
  };
}
