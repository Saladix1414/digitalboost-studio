import type {
  DbxHold,
  DbxHoldPurpose,
  DbxHoldStore,
  DbxLedger,
} from "./types";

import {
  calculateDbxAccountBalance,
} from "./balance";

function assertPositiveSafeInteger(
  amountMinor:
    number
) {
  if (
    !Number.isSafeInteger(
      amountMinor
    ) ||
    amountMinor <= 0
  ) {
    throw new Error(
      "DBX_HOLD_INVALID_AMOUNT"
    );
  }
}

export function createDbxHoldStore():
  DbxHoldStore {
  return {
    holds:
      [],
  };
}

export function calculateReservedDbx(
  store:
    DbxHoldStore,
  accountId:
    string
): number {
  return store.holds
    .filter(
      (hold) =>
        hold.accountId ===
          accountId &&
        hold.status ===
          "ACTIVE"
    )
    .reduce(
      (
        total,
        hold
      ) =>
        total +
        hold.amountMinor,
      0
    );
}

export function calculateDbxSpendableBalance(
  ledger:
    DbxLedger,
  store:
    DbxHoldStore,
  accountId:
    string
) {
  const ledgerBalance =
    calculateDbxAccountBalance(
      ledger,
      accountId
    );

  const reservedMinor =
    calculateReservedDbx(
      store,
      accountId
    );

  return {
    accountId,

    ledgerBalanceMinor:
      ledgerBalance.balanceMinor,

    reservedMinor,

    availableMinor:
      ledgerBalance.balanceMinor -
      reservedMinor,

    currency:
      "DBX" as const,

    derived:
      true as const,

    authoritative:
      false as const,
  };
}

export function createDbxHold(
  ledger:
    DbxLedger,
  store:
    DbxHoldStore,
  input: {
    readonly id:
      string;

    readonly idempotencyKey:
      string;

    readonly accountId:
      string;

    readonly amountMinor:
      number;

    readonly purpose:
      DbxHoldPurpose;

    readonly reference:
      string;

    readonly createdAt:
      string;

    readonly expiresAt:
      string | null;
  }
): {
  readonly store:
    DbxHoldStore;

  readonly hold:
    DbxHold;

  readonly idempotentReplay:
    boolean;
} {
  assertPositiveSafeInteger(
    input.amountMinor
  );

  const existing =
    store.holds.find(
      (hold) =>
        hold.idempotencyKey ===
        input.idempotencyKey
    );

  if (existing) {
    const same =
      existing.id ===
        input.id &&
      existing.accountId ===
        input.accountId &&
      existing.amountMinor ===
        input.amountMinor &&
      existing.purpose ===
        input.purpose &&
      existing.reference ===
        input.reference &&
      existing.expiresAt ===
        input.expiresAt;

    if (!same) {
      throw new Error(
        "DBX_HOLD_IDEMPOTENCY_CONFLICT"
      );
    }

    return {
      store,

      hold:
        existing,

      idempotentReplay:
        true,
    };
  }

  const duplicateId =
    store.holds.some(
      (hold) =>
        hold.id ===
        input.id
    );

  if (duplicateId) {
    throw new Error(
      "DBX_HOLD_DUPLICATE_ID"
    );
  }

  const spendable =
    calculateDbxSpendableBalance(
      ledger,
      store,
      input.accountId
    );

  if (
    spendable.availableMinor <
      input.amountMinor
  ) {
    throw new Error(
      "DBX_HOLD_INSUFFICIENT_AVAILABLE_BALANCE"
    );
  }

  const hold:
    DbxHold = {
      id:
        input.id,

      idempotencyKey:
        input.idempotencyKey,

      accountId:
        input.accountId,

      amountMinor:
        input.amountMinor,

      purpose:
        input.purpose,

      reference:
        input.reference,

      status:
        "ACTIVE",

      createdAt:
        input.createdAt,

      expiresAt:
        input.expiresAt,

      capturedTransactionId:
        null,

      releasedAt:
        null,

      authoritative:
        false,
    };

  return {
    store: {
      holds: [
        ...store.holds,
        hold,
      ],
    },

    hold,

    idempotentReplay:
      false,
  };
}
