import assert from "node:assert/strict";
import test from "node:test";

import {
  assertDbxPaymentEvidenceBinding,
} from "../../src/trading/dbx/purchase/evidenceBinding";

test(
  "evidence binding validates purchase quote rail and amount",
  () => {
    const intent = {
      id:
        "purchase-1",

      userRef:
        "user-1",

      accountRef:
        "account-1",

      rail:
        "FIAT" as const,

      requestedDbxMinor:
        100_000_000,

      quoteId:
        "quote-1",

      idempotencyKey:
        "idem-1",

      status:
        "QUOTED" as const,

      createdAt:
        "2026-10-02T12:00:00.000Z",

      updatedAt:
        "2026-10-02T12:01:00.000Z",

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

    const evidence = {
      id:
        "evidence-1",

      kind:
        "FIAT" as const,

      purchaseIntentId:
        "purchase-1",

      quoteId:
        "quote-1",

      providerRef:
        "provider-1",

      settlementRef:
        "settlement-1",

      externalCurrency:
        "USD" as const,

      externalAmountMinor:
        1000,

      observedAt:
        "2026-10-02T12:02:00.000Z",

      immutable:
        true as const,

      authoritative:
        false as const,
    };

    const result =
      assertDbxPaymentEvidenceBinding(
        evidence,
        intent,
        quote
      );

    assert.equal(
      result.bound,
      true
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);
