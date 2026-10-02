import type {
  DbxIssuancePostingRecord,
  DbxPurchaseIntent,
} from "./types";

export function applyDbxIssuanceLedgerPosting(
  intent:
    DbxPurchaseIntent,
  posting:
    DbxIssuancePostingRecord,
  updatedAt:
    string
): DbxPurchaseIntent {
  if (
    intent.status !==
      "ISSUANCE_AUTHORIZED"
  ) {
    throw new Error(
      "DBX_PURCHASE_NOT_ISSUANCE_AUTHORIZED"
    );
  }

  if (
    posting.purchaseIntentId !==
      intent.id
  ) {
    throw new Error(
      "DBX_LEDGER_POSTING_PURCHASE_MISMATCH"
    );
  }

  if (
    posting.status !==
      "POSTED"
  ) {
    throw new Error(
      "DBX_LEDGER_POSTING_NOT_POSTED"
    );
  }

  return {
    ...intent,

    status:
      "LEDGER_POSTED",

    updatedAt,

    authoritative:
      false,
  };
}
