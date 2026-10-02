import type {
  DbxPaymentVerification,
  DbxPurchaseIntent,
} from "./types";

export function applyDbxPaymentVerification(
  intent:
    DbxPurchaseIntent,
  verification:
    DbxPaymentVerification,
  updatedAt:
    string
): DbxPurchaseIntent {
  if (
    verification
      .purchaseIntentId !==
    intent.id
  ) {
    throw new Error(
      "DBX_PAYMENT_VERIFICATION_PURCHASE_MISMATCH"
    );
  }

  if (
    intent.status !==
      "PAYMENT_DETECTED"
  ) {
    throw new Error(
      "DBX_PURCHASE_NOT_PAYMENT_DETECTED"
    );
  }

  return {
    ...intent,

    status:
      verification.status ===
        "VERIFIED"
        ? "PAYMENT_VERIFIED"
        : "REJECTED",

    updatedAt,

    authoritative:
      false,
  };
}
