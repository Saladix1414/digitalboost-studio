import type {
  DbxLedger,
} from "../ledger/types";

import type {
  DbxMarketplaceSettlementRegistry,
} from "../settlement/types";

import type {
  DbxReconciliationIssue,
} from "./types";

export function reconcileDbxMarketplaceSettlements(
  ledger:
    DbxLedger,

  registry:
    DbxMarketplaceSettlementRegistry
) {
  const issues:
    DbxReconciliationIssue[] =
      [];

  for (
    const result
    of registry.results
  ) {
    const exists =
      ledger.transactions.some(
        transaction =>
          transaction.id ===
          result.transactionId
      );

    if (!exists) {
      issues.push({
        code:
          "SETTLEMENT_TRANSACTION_MISSING",

        severity:
          "ERROR",

        reference:
          result.marketplaceOrderId,

        message:
          `Marketplace settlement transaction ${result.transactionId} is absent from DBX Ledger.`,

        authoritative:
          false,
      });
    }
  }

  return {
    checked:
      registry.results.length,

    issues,

    authoritative:
      false as const,
  };
}
