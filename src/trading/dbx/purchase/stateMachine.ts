import type {
  DbxPurchaseStatus,
} from "./types";

const transitions:
  Record<
    DbxPurchaseStatus,
    readonly DbxPurchaseStatus[]
  > = {
    CREATED: [
      "QUOTED",
      "FAILED",
      "REJECTED",
      "EXPIRED",
    ],

    QUOTED: [
      "PAYMENT_PENDING",
      "FAILED",
      "REJECTED",
      "EXPIRED",
    ],

    PAYMENT_PENDING: [
      "PAYMENT_DETECTED",
      "FAILED",
      "REJECTED",
      "EXPIRED",
    ],

    PAYMENT_DETECTED: [
      "PAYMENT_VERIFIED",
      "FAILED",
      "REJECTED",
    ],

    PAYMENT_VERIFIED: [
      "ISSUANCE_AUTHORIZED",
      "FAILED",
      "REJECTED",
    ],

    ISSUANCE_AUTHORIZED: [
      "LEDGER_POSTED",
      "FAILED",
    ],

    LEDGER_POSTED: [
      "COMPLETED",
      "REVERSED",
    ],

    COMPLETED: [
      "REFUNDED",
      "REVERSED",
    ],

    EXPIRED: [],
    FAILED: [],
    REJECTED: [],
    REFUNDED: [],
    REVERSED: [],
  };

export function canTransitionDbxPurchase(
  from:
    DbxPurchaseStatus,
  to:
    DbxPurchaseStatus
): boolean {
  return transitions[from]
    .includes(to);
}
