import type {
  DbxIssuanceAuthorization,
  DbxIssuanceAuthorizationCheck,
  DbxIssuancePolicy,
  DbxPaymentVerification,
  DbxPurchaseIntent,
  DbxQuote,
} from "./types";

import {
  validateDbxIssuancePolicy,
} from "./issuancePolicy";

export function authorizeDbxIssuance(
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote,
  verification:
    DbxPaymentVerification,
  policy:
    DbxIssuancePolicy,
  input: {
    readonly id:
      string;

    readonly idempotencyKey:
      string;

    readonly authorizedAt:
      string;
  }
): DbxIssuanceAuthorization {
  validateDbxIssuancePolicy(
    policy
  );

  const checks:
    DbxIssuanceAuthorizationCheck[] =
      [
        {
          code:
            "PURCHASE_STATUS",

          passed:
            intent.status ===
            "PAYMENT_VERIFIED",

          message:
            "Purchase must be PAYMENT_VERIFIED.",

          authoritative:
            false,
        },

        {
          code:
            "PURCHASE_BINDING",

          passed:
            verification
              .purchaseIntentId ===
            intent.id,

          message:
            "Verification must belong to purchase.",

          authoritative:
            false,
        },

        {
          code:
            "QUOTE_BINDING",

          passed:
            verification.quoteId ===
              quote.id &&
            intent.quoteId ===
              quote.id,

          message:
            "Purchase and verification must bind to quote.",

          authoritative:
            false,
        },

        {
          code:
            "VERIFICATION_BINDING",

          passed:
            verification.id
              .trim()
              .length > 0,

          message:
            "Verification reference must be present.",

          authoritative:
            false,
        },

        {
          code:
            "VERIFICATION_STATUS",

          passed:
            verification.status ===
            "VERIFIED",

          message:
            "Payment verification must be VERIFIED.",

          authoritative:
            false,
        },

        {
          code:
            "ACCOUNT_BINDING",

          passed:
            intent.accountRef
              .trim()
              .length > 0,

          message:
            "Destination DBX account must be present.",

          authoritative:
            false,
        },

        {
          code:
            "DBX_AMOUNT_BINDING",

          passed:
            quote.dbxAmountMinor ===
            intent.requestedDbxMinor,

          message:
            "Quoted DBX must equal requested DBX.",

          authoritative:
            false,
        },

        {
          code:
            "POLICY_LIMIT",

          passed:
            quote.dbxAmountMinor >=
              policy.minimumDbxMinor &&
            quote.dbxAmountMinor <=
              policy.maximumDbxMinor,

          message:
            "DBX amount must satisfy issuance limits.",

          authoritative:
            false,
        },

        {
          code:
            "POLICY_ENABLED",

          passed:
            policy.enabled,

          message:
            "Issuance policy must be enabled.",

          authoritative:
            false,
        },
      ];

  const authorized =
    checks.every(
      (check) =>
        check.passed
    );

  return {
    id:
      input.id,

    idempotencyKey:
      input.idempotencyKey,

    purchaseIntentId:
      intent.id,

    quoteId:
      quote.id,

    verificationId:
      verification.id,

    destinationAccountRef:
      intent.accountRef,

    issuanceAccountRef:
      policy.issuanceAccountRef,

    dbxAmountMinor:
      quote.dbxAmountMinor,

    policyId:
      policy.id,

    policyVersion:
      policy.version,

    status:
      authorized
        ? "AUTHORIZED"
        : "REJECTED",

    checks,

    authorizedAt:
      input.authorizedAt,

    ledgerPosted:
      false,

    authoritative:
      false,
  };
}
