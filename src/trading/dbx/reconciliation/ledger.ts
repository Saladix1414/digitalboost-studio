import type {
  DbxLedger,
} from "../ledger/types";

import type {
  DbxReconciliationIssue,
} from "./types";

export function reconcileDbxLedger(
  ledger:
    DbxLedger
) {
  const issues:
    DbxReconciliationIssue[] =
      [];

  const transactionIds =
    new Set<string>();

  let globalDebit =
    0;

  let globalCredit =
    0;

  for (
    const transaction
    of ledger.transactions
  ) {
    if (
      transactionIds.has(
        transaction.id
      )
    ) {
      issues.push({
        code:
          "LEDGER_DUPLICATE_TRANSACTION_ID",

        severity:
          "ERROR",

        reference:
          transaction.id,

        message:
          "Duplicate DBX ledger transaction id.",

        authoritative:
          false,
      });
    }

    transactionIds.add(
      transaction.id
    );

    let debit =
      0;

    let credit =
      0;

    for (
      const entry
      of transaction.entries
    ) {
      if (
        entry.side ===
        "DEBIT"
      ) {
        debit +=
          entry.amountMinor;
      } else {
        credit +=
          entry.amountMinor;
      }
    }

    globalDebit +=
      debit;

    globalCredit +=
      credit;

    if (
      debit !== credit
    ) {
      issues.push({
        code:
          "LEDGER_TRANSACTION_UNBALANCED",

        severity:
          "ERROR",

        reference:
          transaction.id,

        message:
          `Transaction debits ${debit} do not equal credits ${credit}.`,

        authoritative:
          false,
      });
    }
  }

  if (
    globalDebit !==
    globalCredit
  ) {
    issues.push({
      code:
        "LEDGER_GLOBAL_IMBALANCE",

      severity:
        "ERROR",

      reference:
        ledger.id,

      message:
        `Global debits ${globalDebit} do not equal credits ${globalCredit}.`,

      authoritative:
        false,
    });
  }

  return {
    checked:
      ledger.transactions.length,

    totalDebitMinor:
      globalDebit,

    totalCreditMinor:
      globalCredit,

    issues,

    authoritative:
      false as const,
  };
}
