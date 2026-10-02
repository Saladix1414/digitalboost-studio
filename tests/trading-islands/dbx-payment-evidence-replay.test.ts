import assert from "node:assert/strict";
import test from "node:test";

import {
  addDbxPaymentEvidence,
  createDbxPaymentEvidenceStore,
} from "../../src/trading/dbx/purchase/evidenceStore";

test(
  "FIAT external settlement cannot be replayed",
  () => {
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
        "2026-10-02T12:00:00.000Z",

      immutable:
        true as const,

      authoritative:
        false as const,
    };

    const store =
      addDbxPaymentEvidence(
        createDbxPaymentEvidenceStore(),
        evidence
      );

    assert.throws(
      () =>
        addDbxPaymentEvidence(
          store,
          {
            ...evidence,

            id:
              "evidence-2",

            purchaseIntentId:
              "purchase-2",
          }
        ),

      /DBX_PAYMENT_EVIDENCE_REPLAY_DETECTED/
    );
  }
);

test(
  "USDT transaction hash cannot be replayed on same chain",
  () => {
    const evidence = {
      id:
        "evidence-usdt-1",

      kind:
        "USDT" as const,

      purchaseIntentId:
        "purchase-1",

      quoteId:
        "quote-1",

      chainRef:
        "chain:polygon",

      tokenRef:
        "token:usdt",

      recipientRef:
        "wallet:treasury",

      txHash:
        "0xpayment",

      blockRef:
        "block:1",

      externalAmountMinor:
        1_000_000,

      observedAt:
        "2026-10-02T12:00:00.000Z",

      immutable:
        true as const,

      authoritative:
        false as const,
    };

    const store =
      addDbxPaymentEvidence(
        createDbxPaymentEvidenceStore(),
        evidence
      );

    assert.throws(
      () =>
        addDbxPaymentEvidence(
          store,
          {
            ...evidence,

            id:
              "evidence-usdt-2",

            purchaseIntentId:
              "purchase-2",
          }
        ),

      /DBX_PAYMENT_EVIDENCE_REPLAY_DETECTED/
    );
  }
);
