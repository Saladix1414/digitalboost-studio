import type {
  DbxFiatPaymentEvidence,
  DbxPurchaseIntent,
  DbxQuote,
} from "./types";

export function createDbxFiatPaymentEvidence(
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote,
  input: {
    readonly id:
      string;

    readonly providerRef:
      string;

    readonly settlementRef:
      string;

    readonly externalAmountMinor:
      number;

    readonly observedAt:
      string;
  }
): DbxFiatPaymentEvidence {
  if (
    intent.rail !==
      "FIAT"
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_RAIL_MISMATCH"
    );
  }

  if (
    quote.rail !==
      "FIAT"
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_QUOTE_RAIL_MISMATCH"
    );
  }

  if (
    intent.quoteId !==
      quote.id
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_QUOTE_BINDING_FAILED"
    );
  }

  if (
    quote.externalCurrency !==
      "USD" &&
    quote.externalCurrency !==
      "ARS"
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_INVALID_FIAT_CURRENCY"
    );
  }

  if (
    input.externalAmountMinor !==
      quote.externalAmountMinor
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_AMOUNT_MISMATCH"
    );
  }

  if (
    input.providerRef.trim()
      .length === 0 ||
    input.settlementRef.trim()
      .length === 0
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_REFERENCE_REQUIRED"
    );
  }

  return {
    id:
      input.id,

    kind:
      "FIAT",

    purchaseIntentId:
      intent.id,

    quoteId:
      quote.id,

    providerRef:
      input.providerRef,

    settlementRef:
      input.settlementRef,

    externalCurrency:
      quote.externalCurrency,

    externalAmountMinor:
      input.externalAmountMinor,

    observedAt:
      input.observedAt,

    immutable:
      true,

    authoritative:
      false,
  };
}
