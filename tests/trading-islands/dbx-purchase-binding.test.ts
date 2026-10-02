import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxPurchaseIntent,
  createDbxPurchaseStore,
} from "../../src/trading/dbx/purchase/intent";

import {
  createDbxQuote,
} from "../../src/trading/dbx/purchase/quote";

import {
  bindQuoteToPurchaseIntent,
} from "../../src/trading/dbx/purchase/bindQuote";

import {
  dbxFiatQuoteFixture,
  dbxPurchaseIntentFixture,
  dbxUsdtQuoteFixture,
} from "../../src/trading/dbx/purchase/fixtures";

test(
  "matching quote binds to purchase intent",
  () => {
    const created =
      createDbxPurchaseIntent(
        createDbxPurchaseStore(),
        dbxPurchaseIntentFixture
      );

    const quote =
      createDbxQuote(
        dbxFiatQuoteFixture
      );

    const bound =
      bindQuoteToPurchaseIntent(
        created.intent,
        quote,
        "2026-10-02T12:05:00.000Z"
      );

    assert.equal(
      bound.status,
      "QUOTED"
    );

    assert.equal(
      bound.quoteId,
      quote.id
    );
  }
);

test(
  "quote payment rail mismatch is rejected",
  () => {
    const created =
      createDbxPurchaseIntent(
        createDbxPurchaseStore(),
        dbxPurchaseIntentFixture
      );

    const quote =
      createDbxQuote(
        dbxUsdtQuoteFixture
      );

    assert.throws(
      () =>
        bindQuoteToPurchaseIntent(
          created.intent,
          quote,
          "2026-10-02T12:05:00.000Z"
        ),

      /DBX_PURCHASE_QUOTE_RAIL_MISMATCH/
    );
  }
);

test(
  "expired quote cannot bind",
  () => {
    const created =
      createDbxPurchaseIntent(
        createDbxPurchaseStore(),
        dbxPurchaseIntentFixture
      );

    const quote =
      createDbxQuote(
        dbxFiatQuoteFixture
      );

    assert.throws(
      () =>
        bindQuoteToPurchaseIntent(
          created.intent,
          quote,
          "2026-10-02T12:16:00.000Z"
        ),

      /DBX_PURCHASE_QUOTE_EXPIRED/
    );
  }
);
