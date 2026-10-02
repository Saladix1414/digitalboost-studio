import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDbxIssuanceAuthorization,
} from "../../src/trading/dbx/purchase/applyIssuanceAuthorization";

test(
  "authorized issuance advances purchase to ISSUANCE_AUTHORIZED",
  () => {
    const updated =
      applyDbxIssuanceAuthorization(
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
            "issuance-1",

          idempotencyKey:
            "issuance-key",

          purchaseIntentId:
            "purchase-1",

          quoteId:
            "quote-1",

          verificationId:
            "verification-1",

          destinationAccountRef:
            "dbx-user-001",

          issuanceAccountRef:
            "dbx-system-issuance",

          dbxAmountMinor:
            100_000_000,

          policyId:
            "issuance-policy",

          policyVersion:
            "1",

          status:
            "AUTHORIZED",

          checks:
            [],

          authorizedAt:
            "2026-10-02T12:09:00.000Z",

          ledgerPosted:
            false,

          authoritative:
            false,
        },
        "2026-10-02T12:09:00.000Z"
      );

    assert.equal(
      updated.status,
      "ISSUANCE_AUTHORIZED"
    );
  }
);
