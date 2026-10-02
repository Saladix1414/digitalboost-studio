import assert from "node:assert/strict";
import test from "node:test";

import {
  authorizeDbxIssuance,
} from "../../src/trading/dbx/purchase/issuanceAuthorization";

import {
  dbxIssuancePolicyFixture,
} from "../../src/trading/dbx/purchase/issuanceFixtures";

const intent = {
  id:
    "purchase-1",

  userRef:
    "user-1",

  accountRef:
    "dbx-user-001",

  rail:
    "FIAT" as const,

  requestedDbxMinor:
    100_000_000,

  quoteId:
    "quote-1",

  idempotencyKey:
    "purchase-key",

  status:
    "PAYMENT_VERIFIED" as const,

  createdAt:
    "2026-10-02T12:00:00.000Z",

  updatedAt:
    "2026-10-02T12:08:00.000Z",

  authoritative:
    false as const,
};

const quote = {
  id:
    "quote-1",

  rail:
    "FIAT" as const,

  externalCurrency:
    "USD" as const,

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
    false as const,
};

const verification = {
  id:
    "verification-1",

  evidenceId:
    "evidence-1",

  purchaseIntentId:
    "purchase-1",

  quoteId:
    "quote-1",

  status:
    "VERIFIED" as const,

  policyId:
    "payment-policy-1",

  policyVersion:
    "1",

  checks:
    [],

  verifiedAt:
    "2026-10-02T12:08:00.000Z",

  authoritative:
    false as const,
};

test(
  "verified payment can be authorized for exact DBX issuance",
  () => {
    const result =
      authorizeDbxIssuance(
        intent,
        quote,
        verification,
        dbxIssuancePolicyFixture,
        {
          id:
            "issuance-auth-1",

          idempotencyKey:
            "idem-issuance-1",

          authorizedAt:
            "2026-10-02T12:09:00.000Z",
        }
      );

    assert.equal(
      result.status,
      "AUTHORIZED"
    );

    assert.equal(
      result.dbxAmountMinor,
      100_000_000
    );

    assert.equal(
      result.destinationAccountRef,
      "dbx-user-001"
    );

    assert.equal(
      result.issuanceAccountRef,
      "dbx-system-issuance"
    );

    assert.equal(
      result.ledgerPosted,
      false
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "rejected payment verification cannot authorize issuance",
  () => {
    const result =
      authorizeDbxIssuance(
        intent,
        quote,
        {
          ...verification,

          status:
            "REJECTED",
        },
        dbxIssuancePolicyFixture,
        {
          id:
            "issuance-auth-2",

          idempotencyKey:
            "idem-issuance-2",

          authorizedAt:
            "2026-10-02T12:09:00.000Z",
        }
      );

    assert.equal(
      result.status,
      "REJECTED"
    );
  }
);

test(
  "disabled issuance policy rejects issuance",
  () => {
    const result =
      authorizeDbxIssuance(
        intent,
        quote,
        verification,
        {
          ...dbxIssuancePolicyFixture,

          enabled:
            false,
        },
        {
          id:
            "issuance-auth-3",

          idempotencyKey:
            "idem-issuance-3",

          authorizedAt:
            "2026-10-02T12:09:00.000Z",
        }
      );

    assert.equal(
      result.status,
      "REJECTED"
    );
  }
);
