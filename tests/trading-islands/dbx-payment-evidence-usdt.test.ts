import assert from "node:assert/strict";
import test from "node:test";

import {
  bindQuoteToPurchaseIntent,
} from "../../src/trading/dbx/purchase/bindQuote";

import {
  createDbxPurchaseIntent,
  createDbxPurchaseStore,
} from "../../src/trading/dbx/purchase/intent";

import {
  createDbxQuote,
} from "../../src/trading/dbx/purchase/quote";

import {
  createDbxUsdtPaymentEvidence,
} from "../../src/trading/dbx/purchase/usdtEvidence";

import {
  dbxUsdtQuoteFixture,
} from "../../src/trading/dbx/purchase/fixtures";

import {
  dbxUsdtPaymentEvidenceFixture,
} from "../../src/trading/dbx/purchase/evidenceFixtures";

const usdtIntentFixture = {
  id:
    "dbx-purchase-usdt-001",

  userRef:
    "user:001",

  accountRef:
    "dbx-user-001",

  rail:
    "USDT" as const,

  requestedDbxMinor:
    100_000_000,

  idempotencyKey:
    "idem-dbx-purchase-usdt-001",

  createdAt:
    "2026-10-02T12:00:00.000Z",
};

function fixture() {
  const created =
    createDbxPurchaseIntent(
      createDbxPurchaseStore(),
      usdtIntentFixture
    );

  const quote =
    createDbxQuote(
      dbxUsdtQuoteFixture
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
  "USDT evidence binds chain token recipient hash and amount",
  () => {
    const {
      intent,
      quote,
    } = fixture();

    const evidence =
      createDbxUsdtPaymentEvidence(
        intent,
        quote,
        dbxUsdtPaymentEvidenceFixture
      );

    assert.equal(
      evidence.kind,
      "USDT"
    );

    assert.equal(
      evidence.chainRef,
      "chain:polygon"
    );

    assert.equal(
      evidence.tokenRef,
      "token:usdt"
    );

    assert.equal(
      evidence.externalAmountMinor,
      quote.externalAmountMinor
    );

    assert.equal(
      evidence.authoritative,
      false
    );
  }
);
