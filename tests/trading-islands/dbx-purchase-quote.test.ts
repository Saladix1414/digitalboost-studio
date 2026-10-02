import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxQuote,
  isDbxQuoteExpired,
} from "../../src/trading/dbx/purchase/quote";

import {
  dbxFiatQuoteFixture,
} from "../../src/trading/dbx/purchase/fixtures";

test(
  "DBX quote preserves deterministic price binding",
  () => {
    const quote =
      createDbxQuote(
        dbxFiatQuoteFixture
      );

    assert.equal(
      quote.dbxAmountMinor,
      100_000_000
    );

    assert.equal(
      quote.externalAmountMinor,
      10_00
    );

    assert.equal(
      quote.authoritative,
      false
    );
  }
);

test(
  "DBX quote expires deterministically",
  () => {
    const quote =
      createDbxQuote(
        dbxFiatQuoteFixture
      );

    assert.equal(
      isDbxQuoteExpired(
        quote,
        "2026-10-02T12:16:00.000Z"
      ),
      true
    );
  }
);
