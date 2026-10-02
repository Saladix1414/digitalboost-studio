import type {
  DbxPaymentEvidence,
  DbxPurchaseIntent,
  DbxQuote,
} from "./types";

export function assertDbxPaymentEvidenceBinding(
  evidence:
    DbxPaymentEvidence,
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote
) {
  if (
    evidence.purchaseIntentId !==
      intent.id
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_PURCHASE_BINDING_FAILED"
    );
  }

  if (
    evidence.quoteId !==
      quote.id
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_QUOTE_BINDING_FAILED"
    );
  }

  if (
    evidence.kind !==
      intent.rail
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_RAIL_MISMATCH"
    );
  }

  if (
    evidence.kind !==
      quote.rail
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_QUOTE_RAIL_MISMATCH"
    );
  }

  if (
    evidence.externalAmountMinor !==
      quote.externalAmountMinor
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_AMOUNT_MISMATCH"
    );
  }

  return {
    bound:
      true as const,

    purchaseIntentId:
      intent.id,

    quoteId:
      quote.id,

    rail:
      intent.rail,

    authoritative:
      false as const,
  };
}
