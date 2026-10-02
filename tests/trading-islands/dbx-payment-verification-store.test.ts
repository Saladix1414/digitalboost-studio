import assert from "node:assert/strict";
import test from "node:test";

import {
  addDbxPaymentVerification,
  createDbxPaymentVerificationStore,
} from "../../src/trading/dbx/purchase/verificationStore";

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
    "policy-1",

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
  "payment evidence can be verified only once",
  () => {
    const store =
      addDbxPaymentVerification(
        createDbxPaymentVerificationStore(),
        verification
      );

    assert.throws(
      () =>
        addDbxPaymentVerification(
          store,
          {
            ...verification,

            id:
              "verification-2",
          }
        ),

      /DBX_PAYMENT_VERIFICATION_EVIDENCE_ALREADY_PROCESSED/
    );
  }
);
