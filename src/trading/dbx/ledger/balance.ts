import type {
  DbxLedger,
  DbxLedgerAccountBalance,
} from "./types";

export function calculateDbxAccountBalance(
  ledger:
    DbxLedger,
  accountId:
    string
): DbxLedgerAccountBalance {
  const account =
    ledger.accounts.find(
      (candidate) =>
        candidate.id ===
        accountId
    );

  if (!account) {
    throw new Error(
      "DBX_LEDGER_ACCOUNT_NOT_FOUND"
    );
  }

  let debitMinor =
    0;

  let creditMinor =
    0;

  for (
    const transaction of
    ledger.transactions
  ) {
    for (
      const entry of
      transaction.entries
    ) {
      if (
        entry.accountId !==
          accountId
      ) {
        continue;
      }

      if (
        entry.side ===
          "DEBIT"
      ) {
        debitMinor +=
          entry.amountMinor;
      } else {
        creditMinor +=
          entry.amountMinor;
      }
    }
  }

  return {
    accountId,

    debitMinor,

    creditMinor,

    balanceMinor:
      creditMinor -
      debitMinor,

    currency:
      "DBX",

    derivedFromLedger:
      true,

    governanceAuthority:
      false,
  };
}

export function calculateDbxLedgerInvariant(
  ledger:
    DbxLedger
) {
  let debitMinor =
    0;

  let creditMinor =
    0;

  for (
    const transaction of
    ledger.transactions
  ) {
    for (
      const entry of
      transaction.entries
    ) {
      if (
        entry.side ===
          "DEBIT"
      ) {
        debitMinor +=
          entry.amountMinor;
      } else {
        creditMinor +=
          entry.amountMinor;
      }
    }
  }

  return {
    debitMinor,

    creditMinor,

    balanced:
      debitMinor ===
      creditMinor,

    netMinor:
      creditMinor -
      debitMinor,

    systemOfRecord:
      "DBX_LEDGER" as const,

    governanceAuthority:
      false as const,
  };
}
