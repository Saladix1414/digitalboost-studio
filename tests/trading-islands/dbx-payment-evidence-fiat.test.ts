import assert from "node:assert/strict";
import test from "node:test";

import {
  bindQuoteToPurchaseIntent,
} from "../../src/trading/dbx/purchase/bindQuote";

import {
  createDbxFiatPaymentEvidence,
} from "../../src/trading/dbx/purchase/fiatEvidence";

import {
  createDbxPurchaseIntent,
  createDbxPurchaseStore,
} from "../../src/trading/dbx/purchase/intent";

import {
  createDbxQuote,
} from "../../src/trading/dbx/purchase/quote";

import {
  dbxFiatQuoteFixture,
  dbxPurchaseIntentFixture,
} from "../../src/trading/dbx/purchase/fixtures";

import {
  dbxFiatPaymentEvidenceFixture,
} from "../../src/trading/dbx/purchase/evidenceFixtures";

function fixture() {
  const created =
    createDbxPurchaseIntent(
      createDbxPurchaseStore(),
      dbxPurchaseIntentFixture
    );

  const quote =
    createDbxQuote(
      dbxFiatQuoteFixture
    );

  const intent =
    bindQuoteToPurchaseIntent(
      created.intent,
      quote,
      "2026-10-02T12:05:00.000Z"
    );

  return {
    intent,
    quote,
  };
}

test(
  "FIAT evidence binds purchase quote and exact amount",
  () => {
    const {
      intent,
      quote,
    } = fixture();

    const evidence =
      createDbxFiatPaymentEvidence(
        intent,
        quote,
        dbxFiatPaymentEvidenceFixture
      );

    assert.equal(
      evidence.kind,
      "FIAT"
    );

    assert.equal(
      evidence.purchaseIntentId,
      intent.id
    );

    assert.equal(
      evidence.externalAmountMinor,
      quote.externalAmountMinor
    );

    assert.equal(
      evidence.immutable,
      true
    );

    assert.equal(
      evidence.authoritative,
      false
    );
  }
);

test(
  "FIAT evidence rejects amount mismatch",
  () => {
    const {
      intent,
      quote,
    } = fixture();

    assert.throws(
      () =>
        createDbxFiatPaymentEvidence(
          intent,
          quote,
          {
            ...dbxFiatPaymentEvidenceFixture,

            externalAmountMinor:
              999,
          }
        ),

      /DBX_PAYMENT_EVIDENCE_AMOUNT_MISMATCH/
    );
  }
);
