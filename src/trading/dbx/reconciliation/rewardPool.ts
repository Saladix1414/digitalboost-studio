import type {
  DbxLedger,
} from "../ledger/types";

import type {
  DbxRewardPoolRegistry,
} from "../rewardPool/types";

import type {
  DbxReconciliationIssue,
} from "./types";

export function reconcileDbxRewardPool(
  ledger:
    DbxLedger,

  registry:
    DbxRewardPoolRegistry
) {
  const issues:
    DbxReconciliationIssue[] =
      [];

  for (
    const record
    of registry.records
  ) {
    const exists =
      ledger.transactions.some(
        transaction =>
          transaction.id ===
          record.transactionId
      );

    if (!exists) {
      issues.push({
        code:
          "REWARD_POOL_TRANSACTION_MISSING",

        severity:
          "ERROR",

        reference:
          record.id,

        message:
          `Reward Pool transaction ${record.transactionId} is absent from DBX Ledger.`,

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
