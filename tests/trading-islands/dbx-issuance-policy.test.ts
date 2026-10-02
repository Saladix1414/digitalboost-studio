import assert from "node:assert/strict";
import test from "node:test";

import {
  authorizeDbxIssuance,
} from "../../src/trading/dbx/purchase/issuanceAuthorization";

import {
  dbxIssuancePolicyFixture,
} from "../../src/trading/dbx/purchase/issuanceFixtures";

test(
  "issuance above policy maximum is rejected",
  () => {
    const amount =
      20_000_000_000;

    const result =
      authorizeDbxIssuance(
        {
          id:
            "purchase-large",

          userRef:
            "user-1",

          accountRef:
            "dbx-user-001",

          rail:
            "FIAT",

          requestedDbxMinor:
            amount,

          quoteId:
            "quote-large",

          idempotencyKey:
            "purchase-large-key",

          status:
            "PAYMENT_VERIFIED",

          createdAt:
            "2026-10-02T12:00:00.000Z",

          updatedAt:
            "2026-10-02T12:08:00.000Z",

          authoritative:
            false,
        },
        {
          id:
            "quote-large",

          rail:
            "FIAT",

          externalCurrency:
            "USD",

          externalAmountMinor:
            200_00,

          dbxAmountMinor:
            amount,

          rateNumerator:
            200_00,

          rateDenominator:
            amount,

          createdAt:
            "2026-10-02T12:00:00.000Z",

          expiresAt:
            "2026-10-02T12:15:00.000Z",

          policyVersion:
            "v1",

          authoritative:
            false,
        },
        {
          id:
            "verification-large",

          evidenceId:
            "evidence-large",

          purchaseIntentId:
            "purchase-large",

          quoteId:
            "quote-large",

          status:
            "VERIFIED",

          policyId:
            "payment-policy",

          policyVersion:
            "1",

          checks:
            [],

          verifiedAt:
            "2026-10-02T12:08:00.000Z",

          authoritative:
            false,
        },
        dbxIssuancePolicyFixture,
        {
          id:
            "issuance-large",

          idempotencyKey:
            "issuance-large-key",

          authorizedAt:
            "2026-10-02T12:09:00.000Z",
        }
      );

    assert.equal(
      result.status,
      "REJECTED"
    );

    assert.equal(
      result.checks.some(
        (check) =>
          check.code ===
            "POLICY_LIMIT" &&
          check.passed ===
            false
      ),
      true
    );
  }
);
