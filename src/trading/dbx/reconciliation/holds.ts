import type {
  DbxHoldStore,
  DbxLedger,
} from "../ledger/types";

import {
  calculateDbxAccountBalance,
} from "../ledger/balance";

import {
  calculateReservedDbx,
} from "../ledger/holds";

import type {
  DbxReconciliationIssue,
} from "./types";

export function reconcileDbxHolds(
  ledger:
    DbxLedger,

  holdStore:
    DbxHoldStore
) {
  const issues:
    DbxReconciliationIssue[] =
      [];

  const accounts =
    new Set(
      ledger.accounts.map(
        account =>
          account.id
      )
    );

  const activeAccounts =
    new Set<string>();

  for (
    const hold
    of holdStore.holds
  ) {
    if (
      !accounts.has(
        hold.accountId
      )
    ) {
      issues.push({
        code:
          "HOLD_ACCOUNT_UNKNOWN",

        severity:
          "ERROR",

        reference:
          hold.id,

        message:
          `Hold references unknown account ${hold.accountId}.`,

        authoritative:
          false,
      });

      continue;
    }

    if (
      hold.status ===
      "ACTIVE"
    ) {
      activeAccounts.add(
        hold.accountId
      );
    }

    if (
      hold.status ===
      "CAPTURED"
    ) {
      if (
        !hold.capturedTransactionId
      ) {
        issues.push({
          code:
            "HOLD_CAPTURE_TRANSACTION_MISSING",

          severity:
            "ERROR",

          reference:
            hold.id,

          message:
            "Captured hold has no transaction reference.",

          authoritative:
            false,
        });

        continue;
      }

      const transaction =
        ledger.transactions.find(
          candidate =>
            candidate.id ===
            hold.capturedTransactionId
        );

      if (!transaction) {
        issues.push({
          code:
            "HOLD_CAPTURE_TRANSACTION_MISSING",

          severity:
            "ERROR",

          reference:
            hold.id,

          message:
            `Captured transaction ${hold.capturedTransactionId} is absent from ledger.`,

          authoritative:
            false,
        });

        continue;
      }

      const debit =
        transaction.entries.find(
          entry =>
            entry.accountId ===
              hold.accountId &&
            entry.side ===
              "DEBIT"
        );

      if (
        !debit ||
        debit.amountMinor !==
          hold.amountMinor
      ) {
        issues.push({
          code:
            "HOLD_CAPTURE_TRANSACTION_MISMATCH",

          severity:
            "ERROR",

          reference:
            hold.id,

          message:
            "Captured hold does not match ledger debit amount/account.",

          authoritative:
            false,
        });
      }
    }
  }

  for (
    const accountId
    of activeAccounts
  ) {
    const balance =
      calculateDbxAccountBalance(
        ledger,
        accountId
      );

    const reserved =
      calculateReservedDbx(
        holdStore,
        accountId
      );

    if (
      reserved >
      balance.balanceMinor
    ) {
      issues.push({
        code:
          "HOLD_ACTIVE_OVER_BALANCE",

        severity:
          "ERROR",

        reference:
          accountId,

        message:
          `Active reservations ${reserved} exceed ledger balance ${balance.balanceMinor}.`,

        authoritative:
          false,
      });
    }
  }

  return {
    checked:
      holdStore.holds.length,

    issues,

    authoritative:
      false as const,
  };
}
