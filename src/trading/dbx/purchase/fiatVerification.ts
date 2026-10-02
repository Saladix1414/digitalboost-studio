import type {
  DbxFiatPaymentEvidence,
  DbxFiatVerificationPolicy,
  DbxPaymentVerification,
  DbxPaymentVerificationCheck,
  DbxPurchaseIntent,
  DbxQuote,
} from "./types";

export function verifyDbxFiatPayment(
  evidence:
    DbxFiatPaymentEvidence,
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote,
  policy:
    DbxFiatVerificationPolicy,
  input: {
    readonly id:
      string;

    readonly verifiedAt:
      string;
  }
): DbxPaymentVerification {
  const checks:
    DbxPaymentVerificationCheck[] =
      [
        {
          code:
            "PURCHASE_BINDING",

          passed:
            evidence.purchaseIntentId ===
            intent.id,

          message:
            "Evidence must belong to purchase intent.",

          authoritative:
            false,
        },

        {
          code:
            "QUOTE_BINDING",

          passed:
            evidence.quoteId ===
              quote.id &&
            intent.quoteId ===
              quote.id,

          message:
            "Evidence and intent must bind to same quote.",

          authoritative:
            false,
        },

        {
          code:
            "RAIL_BINDING",

          passed:
            intent.rail ===
              "FIAT" &&
            quote.rail ===
              "FIAT" &&
            evidence.kind ===
              "FIAT",

          message:
            "FIAT verification requires FIAT rail.",

          authoritative:
            false,
        },

        {
          code:
            "AMOUNT_BINDING",

          passed:
            evidence
              .externalAmountMinor ===
            quote
              .externalAmountMinor,

          message:
            "Observed amount must equal quoted amount.",

          authoritative:
            false,
        },

        {
          code:
            "CURRENCY_BINDING",

          passed:
            evidence
              .externalCurrency ===
              quote
                .externalCurrency &&
            policy.allowedCurrencies
              .includes(
                evidence.externalCurrency
              ),

          message:
            "Currency must match quote and policy.",

          authoritative:
            false,
        },

        {
          code:
            "PROVIDER_BINDING",

          passed:
            policy.allowedProviderRefs
              .includes(
                evidence.providerRef
              ),

          message:
            "Provider must be allowed by policy.",

          authoritative:
            false,
        },

        {
          code:
            "SETTLEMENT_REFERENCE",

          passed:
            !policy
              .requireSettlementReference ||
            evidence
              .settlementRef
              .trim()
              .length > 0,

          message:
            "Settlement reference must be present.",

          authoritative:
            false,
        },
      ];

  const verified =
    checks.every(
      (check) =>
        check.passed
    );

  return {
    id:
      input.id,

    evidenceId:
      evidence.id,

    purchaseIntentId:
      intent.id,

    quoteId:
      quote.id,

    status:
      verified
        ? "VERIFIED"
        : "REJECTED",

    policyId:
      policy.id,

    policyVersion:
      policy.version,

    checks,

    verifiedAt:
      input.verifiedAt,

    authoritative:
      false,
  };
}
