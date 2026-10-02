import type {
  DbxPaymentVerification,
  DbxPaymentVerificationCheck,
  DbxPurchaseIntent,
  DbxQuote,
  DbxUsdtPaymentEvidence,
  DbxUsdtVerificationPolicy,
} from "./types";

export function verifyDbxUsdtPayment(
  evidence:
    DbxUsdtPaymentEvidence,
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote,
  policy:
    DbxUsdtVerificationPolicy,
  input: {
    readonly id:
      string;

    readonly confirmations:
      number;

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
              "USDT" &&
            quote.rail ===
              "USDT" &&
            evidence.kind ===
              "USDT",

          message:
            "USDT verification requires USDT rail.",

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
            quote
              .externalCurrency ===
            "USDT",

          message:
            "USDT verification requires USDT quote currency.",

          authoritative:
            false,
        },

        {
          code:
            "CHAIN_BINDING",

          passed:
            evidence.chainRef ===
            policy.chainRef,

          message:
            "Payment chain must match verification policy.",

          authoritative:
            false,
        },

        {
          code:
            "TOKEN_BINDING",

          passed:
            evidence.tokenRef ===
            policy.tokenRef,

          message:
            "Payment token must match verification policy.",

          authoritative:
            false,
        },

        {
          code:
            "RECIPIENT_BINDING",

          passed:
            evidence
              .recipientRef ===
            policy
              .recipientRef,

          message:
            "Payment recipient must match verification policy.",

          authoritative:
            false,
        },

        {
          code:
            "TRANSACTION_HASH",

          passed:
            evidence
              .txHash
              .trim()
              .length > 0,

          message:
            "Transaction hash must be present.",

          authoritative:
            false,
        },

        {
          code:
            "BLOCK_REFERENCE",

          passed:
            evidence
              .blockRef
              .trim()
              .length > 0,

          message:
            "Block reference must be present.",

          authoritative:
            false,
        },

        {
          code:
            "CONFIRMATION_POLICY",

          passed:
            Number.isSafeInteger(
              input.confirmations
            ) &&
            input.confirmations >=
              policy.minimumConfirmations,

          message:
            "Observed confirmations must satisfy policy.",

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
