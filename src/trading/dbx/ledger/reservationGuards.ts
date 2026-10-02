import type {
  DbxHoldStore,
  DbxLedger,
} from "./types";

import {
  calculateDbxSpendableBalance,
} from "./holds";

export function assertDbxAvailableBalance(
  ledger:
    DbxLedger,
  holds:
    DbxHoldStore,
  accountId:
    string,
  requiredMinor:
    number
) {
  if (
    !Number.isSafeInteger(
      requiredMinor
    ) ||
    requiredMinor <= 0
  ) {
    throw new Error(
      "DBX_RESERVATION_INVALID_REQUIRED_AMOUNT"
    );
  }

  const balance =
    calculateDbxSpendableBalance(
      ledger,
      holds,
      accountId
    );

  if (
    balance.availableMinor <
      requiredMinor
  ) {
    throw new Error(
      "DBX_RESERVATION_INSUFFICIENT_AVAILABLE_BALANCE"
    );
  }

  return balance;
}

export function assertDbxNoDoubleSpend(
  ledger:
    DbxLedger,
  holds:
    DbxHoldStore,
  accountId:
    string
) {
  const balance =
    calculateDbxSpendableBalance(
      ledger,
      holds,
      accountId
    );

  if (
    balance.availableMinor < 0
  ) {
    throw new Error(
      "DBX_RESERVATION_DOUBLE_SPEND_DETECTED"
    );
  }

  return {
    safe:
      true as const,

    ...balance,
  };
}
