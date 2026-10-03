import type {
  DbxLedger,
} from "../ledger/types";

import type {
  DbxConsumptionRegistry,
} from "../consumption/types";

import type {
  DbxReconciliationIssue,
} from "./types";

export function reconcileDbxConsumption(
  ledger:
    DbxLedger,

  registry:
    DbxConsumptionRegistry
) {
  const issues:
    DbxReconciliationIssue[] =
      [];

  for (
    const record
    of registry.records
  ) {
    const transaction =
      ledger.transactions.find(
        candidate =>
          candidate.id ===
          record.transactionId
      );

    if (!transaction) {
      issues.push({
        code:
          "CONSUMPTION_TRANSACTION_MISSING",

        severity:
          "ERROR",

        reference:
          record.id,

        message:
          `Consumption transaction ${record.transactionId} is absent from DBX Ledger.`,

        authoritative:
          false,
      });
    }
  }

  return {
    checked:
      registry.records.length,

    issues,

    authoritative:
      false as const,
  };
}
