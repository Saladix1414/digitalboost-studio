import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyDbxFiatPayment,
} from "../../src/trading/dbx/purchase/fiatVerification";

import {
  dbxFiatVerificationPolicyFixture,
} from "../../src/trading/dbx/purchase/verificationFixtures";

test(
  "FIAT evidence verifies when all policy checks pass",
  () => {
    const result =
      verifyDbxFiatPayment(
        {
          id:
            "evidence-fiat-1",

          kind:
            "FIAT",

          purchaseIntentId:
            "purchase-1",

          quoteId:
            "quote-1",

          providerRef:
            "provider:fixture",

          settlementRef:
            "settlement-1",

          externalCurrency:
            "USD",

          externalAmountMinor:
            1000,

          observedAt:
            "2026-10-02T12:07:00.000Z",

          immutable:
            true,

          authoritative:
            false,
        },
        {
          id:
            "purchase-1",

          userRef:
            "user-1",

          accountRef:
            "dbx-user-001",

          rail:
            "FIAT",

          requestedDbxMinor:
            100_000_000,

          quoteId:
            "quote-1",

          idempotencyKey:
            "purchase-key",

          status:
            "PAYMENT_DETECTED",

          createdAt:
            "2026-10-02T12:00:00.000Z",

          updatedAt:
            "2026-10-02T12:07:00.000Z",

          authoritative:
            false,
        },
        {
          id:
            "quote-1",

          rail:
            "FIAT",

          externalCurrency:
            "USD",

          externalAmountMinor:
            1000,

          dbxAmountMinor:
            100_000_000,

          rateNumerator:
            1000,

          rateDenominator:
            100_000_000,

          createdAt:
            "2026-10-02T12:00:00.000Z",

          expiresAt:
            "2026-10-02T12:15:00.000Z",

          policyVersion:
            "v1",

          authoritative:
            false,
        },
        dbxFiatVerificationPolicyFixture,
        {
          id:
            "verification-fiat-1",

          verifiedAt:
            "2026-10-02T12:08:00.000Z",
        }
      );

    assert.equal(
      result.status,
      "VERIFIED"
    );

    assert.equal(
      result.checks.every(
        (check) =>
          check.passed
      ),
      true
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "FIAT evidence from unauthorized provider is rejected",
  () => {
    const result =
      verifyDbxFiatPayment(
        {
          id:
            "evidence-fiat-2",

          kind:
            "FIAT",

          purchaseIntentId:
            "purchase-1",

          quoteId:
            "quote-1",

          providerRef:
            "provider:unknown",

          settlementRef:
            "settlement-1",

          externalCurrency:
            "USD",

          externalAmountMinor:
            1000,

          observedAt:
            "2026-10-02T12:07:00.000Z",

          immutable:
            true,

          authoritative:
            false,
        },
        {
          id:
            "purchase-1",

          userRef:
            "user-1",

          accountRef:
            "dbx-user-001",

          rail:
            "FIAT",

          requestedDbxMinor:
            100_000_000,

          quoteId:
            "quote-1",

          idempotencyKey:
            "purchase-key",

          status:
            "PAYMENT_DETECTED",

          createdAt:
            "2026-10-02T12:00:00.000Z",

          updatedAt:
            "2026-10-02T12:07:00.000Z",

          authoritative:
            false,
        },
        {
          id:
            "quote-1",

          rail:
            "FIAT",

          externalCurrency:
            "USD",

          externalAmountMinor:
            1000,

          dbxAmountMinor:
            100_000_000,

          rateNumerator:
            1000,

          rateDenominator:
            100_000_000,

          createdAt:
            "2026-10-02T12:00:00.000Z",

          expiresAt:
            "2026-10-02T12:15:00.000Z",

          policyVersion:
            "v1",

          authoritative:
            false,
        },
        dbxFiatVerificationPolicyFixture,
        {
          id:
            "verification-fiat-2",

          verifiedAt:
            "2026-10-02T12:08:00.000Z",
        }
      );

    assert.equal(
      result.status,
      "REJECTED"
    );
  }
);
