import type {
  DbxPurchaseIntent,
  DbxQuote,
  DbxUsdtPaymentEvidence,
} from "./types";

export function createDbxUsdtPaymentEvidence(
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote,
  input: {
    readonly id:
      string;

    readonly chainRef:
      string;

    readonly tokenRef:
      string;

    readonly recipientRef:
      string;

    readonly txHash:
      string;

    readonly blockRef:
      string;

    readonly externalAmountMinor:
      number;

    readonly observedAt:
      string;
  }
): DbxUsdtPaymentEvidence {
  if (
    intent.rail !==
      "USDT"
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_RAIL_MISMATCH"
    );
  }

  if (
    quote.rail !==
      "USDT"
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
      "USDT"
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_INVALID_USDT_CURRENCY"
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

  const requiredRefs = [
    input.chainRef,
    input.tokenRef,
    input.recipientRef,
    input.txHash,
    input.blockRef,
  ];

  if (
    requiredRefs.some(
      (value) =>
        value.trim()
          .length === 0
    )
  ) {
    throw new Error(
      "DBX_PAYMENT_EVIDENCE_REFERENCE_REQUIRED"
    );
  }

  return {
    id:
      input.id,

    kind:
      "USDT",

    purchaseIntentId:
      intent.id,

    quoteId:
      quote.id,

    chainRef:
      input.chainRef,

    tokenRef:
      input.tokenRef,

    recipientRef:
      input.recipientRef,

    txHash:
      input.txHash,

    blockRef:
      input.blockRef,

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
