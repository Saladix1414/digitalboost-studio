import type {
  DbxIssuanceAuthorization,
  DbxPurchaseIntent,
} from "./types";

export function applyDbxIssuanceAuthorization(
  intent:
    DbxPurchaseIntent,
  authorization:
    DbxIssuanceAuthorization,
  updatedAt:
    string
): DbxPurchaseIntent {
  if (
    authorization
      .purchaseIntentId !==
    intent.id
  ) {
    throw new Error(
      "DBX_ISSUANCE_PURCHASE_MISMATCH"
    );
  }

  if (
    intent.status !==
      "PAYMENT_VERIFIED"
  ) {
    throw new Error(
      "DBX_PURCHASE_NOT_PAYMENT_VERIFIED"
    );
  }

  return {
    ...intent,

    status:
      authorization.status ===
        "AUTHORIZED"
        ? "ISSUANCE_AUTHORIZED"
        : "REJECTED",

    updatedAt,

    authoritative:
      false,
  };
}
