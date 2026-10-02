import type {
  DbxPurchaseIntent,
} from "./types";

export function completeDbxPurchase(
  intent:
    DbxPurchaseIntent,
  completedAt:
    string
): DbxPurchaseIntent {
  if (
    intent.status !==
      "LEDGER_POSTED"
  ) {
    throw new Error(
      "DBX_PURCHASE_NOT_LEDGER_POSTED"
    );
  }

  return {
    ...intent,

    status:
      "COMPLETED",

    updatedAt:
      completedAt,

    authoritative:
      false,
  };
}
