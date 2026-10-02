import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDbxPaymentVerification,
} from "../../src/trading/dbx/purchase/applyVerification";

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
    "PAYMENT_DETECTED" as const,

  createdAt:
    "2026-10-02T12:00:00.000Z",

  updatedAt:
    "2026-10-02T12:07:00.000Z",

  authoritative:
    false as const,
};

test(
  "verified payment advances purchase to PAYMENT_VERIFIED",
  () => {
    const updated =
      applyDbxPaymentVerification(
        intent,
        {
          id:
            "verification-1",

          evidenceId:
            "evidence-1",

          purchaseIntentId:
            "purchase-1",

          quoteId:
            "quote-1",

          status:
            "VERIFIED",

          policyId:
            "policy-1",

          policyVersion:
            "1",

          checks:
            [],

          verifiedAt:
            "2026-10-02T12:08:00.000Z",

          authoritative:
            false,
        },
        "2026-10-02T12:08:00.000Z"
      );

    assert.equal(
      updated.status,
      "PAYMENT_VERIFIED"
    );
  }
);

test(
  "rejected payment advances purchase to REJECTED",
  () => {
    const updated =
      applyDbxPaymentVerification(
        intent,
        {
          id:
            "verification-2",

          evidenceId:
            "evidence-2",

          purchaseIntentId:
            "purchase-1",

          quoteId:
            "quote-1",

          status:
            "REJECTED",

          policyId:
            "policy-1",

          policyVersion:
            "1",

          checks:
            [],

          verifiedAt:
            "2026-10-02T12:08:00.000Z",

          authoritative:
            false,
        },
        "2026-10-02T12:08:00.000Z"
      );

    assert.equal(
      updated.status,
      "REJECTED"
    );
  }
);
