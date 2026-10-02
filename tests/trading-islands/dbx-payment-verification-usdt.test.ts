import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyDbxUsdtPayment,
} from "../../src/trading/dbx/purchase/usdtVerification";

import {
  dbxUsdtVerificationPolicyFixture,
} from "../../src/trading/dbx/purchase/verificationFixtures";

const evidence = {
  id:
    "evidence-usdt-1",

  kind:
    "USDT" as const,

  purchaseIntentId:
    "purchase-usdt-1",

  quoteId:
    "quote-usdt-1",

  chainRef:
    "chain:polygon",

  tokenRef:
    "token:usdt",

  recipientRef:
    "wallet:digitalboost:treasury",

  txHash:
    "0xpayment-usdt",

  blockRef:
    "block:polygon:100",

  externalAmountMinor:
    10_000_000,

  observedAt:
    "2026-10-02T12:07:00.000Z",

  immutable:
    true as const,

  authoritative:
    false as const,
};

const intent = {
  id:
    "purchase-usdt-1",

  userRef:
    "user-1",

  accountRef:
    "dbx-user-001",

  rail:
    "USDT" as const,

  requestedDbxMinor:
    100_000_000,

  quoteId:
    "quote-usdt-1",

  idempotencyKey:
    "purchase-usdt-key",

  status:
    "PAYMENT_DETECTED" as const,

  createdAt:
    "2026-10-02T12:00:00.000Z",

  updatedAt:
    "2026-10-02T12:07:00.000Z",

  authoritative:
    false as const,
};

const quote = {
  id:
    "quote-usdt-1",

  rail:
    "USDT" as const,

  externalCurrency:
    "USDT" as const,

  externalAmountMinor:
    10_000_000,

  dbxAmountMinor:
    100_000_000,

  rateNumerator:
    10_000_000,

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

test(
  "USDT evidence verifies when all payment bindings pass",
  () => {
    const result =
      verifyDbxUsdtPayment(
        evidence,
        intent,
        quote,
        dbxUsdtVerificationPolicyFixture,
        {
          id:
            "verification-usdt-1",

          confirmations:
            12,

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
  }
);

test(
  "USDT evidence below confirmation threshold is rejected",
  () => {
    const result =
      verifyDbxUsdtPayment(
        evidence,
        intent,
        quote,
        dbxUsdtVerificationPolicyFixture,
        {
          id:
            "verification-usdt-2",

          confirmations:
            3,

          verifiedAt:
            "2026-10-02T12:08:00.000Z",
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
            "CONFIRMATION_POLICY" &&
          check.passed ===
            false
      ),
      true
    );
  }
);

test(
  "wrong USDT recipient is rejected",
  () => {
    const result =
      verifyDbxUsdtPayment(
        {
          ...evidence,

          recipientRef:
            "wallet:attacker",
        },
        intent,
        quote,
        dbxUsdtVerificationPolicyFixture,
        {
          id:
            "verification-usdt-3",

          confirmations:
            20,

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
