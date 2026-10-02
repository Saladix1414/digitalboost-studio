import type {
  DbxLedger,
  DbxLedgerTransactionDraft,
  DbxLedgerValidationIssue,
  DbxLedgerValidationResult,
} from "./types";

function hasText(
  value:
    string
): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function validateDbxLedgerTransaction(
  ledger:
    DbxLedger,
  transaction:
    DbxLedgerTransactionDraft
): DbxLedgerValidationResult {
  const issues:
    DbxLedgerValidationIssue[] =
      [];

  if (!hasText(transaction.id)) {
    issues.push({
      code:
        "EMPTY_TRANSACTION_ID",

      message:
        "Transaction id is required.",
    });
  }

  if (
    !hasText(
      transaction.idempotencyKey
    )
  ) {
    issues.push({
      code:
        "EMPTY_IDEMPOTENCY_KEY",

      message:
        "Idempotency key is required.",
    });
  }

  if (
    !hasText(
      transaction.reference
    )
  ) {
    issues.push({
      code:
        "EMPTY_REFERENCE",

      message:
        "Business reference is required.",
    });
  }

  if (
    transaction.entries.length <
      2
  ) {
    issues.push({
      code:
        "INSUFFICIENT_ENTRIES",

      message:
        "A DBX transaction requires at least two ledger entries.",
    });
  }

  const entryIds =
    new Set<string>();

  for (
    const entry of
    transaction.entries
  ) {
    if (
      entryIds.has(
        entry.id
      )
    ) {
      issues.push({
        code:
          "DUPLICATE_ENTRY_ID",

        message:
          `Duplicate ledger entry ${entry.id}.`,
      });
    }

    entryIds.add(
      entry.id
    );

    const account =
      ledger.accounts.find(
        (candidate) =>
          candidate.id ===
          entry.accountId
      );

    if (!account) {
      issues.push({
        code:
          "UNKNOWN_ACCOUNT",

        message:
          `Unknown DBX account ${entry.accountId}.`,
      });

      continue;
    }

    if (
      account.status !==
        "ACTIVE"
    ) {
      issues.push({
        code:
          "ACCOUNT_NOT_ACTIVE",

        message:
          `DBX account ${entry.accountId} is not active.`,
      });
    }

    if (
      !Number.isSafeInteger(
        entry.amountMinor
      ) ||
      entry.amountMinor <= 0
    ) {
      issues.push({
        code:
          "INVALID_AMOUNT",

        message:
          "DBX amounts must be positive safe integers in minor units.",
      });
    }
  }

  const totalDebitsMinor =
    transaction.entries
      .filter(
        (entry) =>
          entry.side ===
          "DEBIT"
      )
      .reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.amountMinor,
        0
      );

  const totalCreditsMinor =
    transaction.entries
      .filter(
        (entry) =>
          entry.side ===
          "CREDIT"
      )
      .reduce(
        (
          total,
          entry
        ) =>
          total +
          entry.amountMinor,
        0
      );

  if (
    totalDebitsMinor !==
      totalCreditsMinor
  ) {
    issues.push({
      code:
        "UNBALANCED_TRANSACTION",

      message:
        "Every DBX transaction must have equal debits and credits.",
    });
  }

  return {
    valid:
      issues.length === 0,

    totalDebitsMinor,

    totalCreditsMinor,

    issues,
  };
}
