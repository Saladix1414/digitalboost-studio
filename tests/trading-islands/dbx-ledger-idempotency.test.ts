import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxLedger,
  postDbxLedgerTransaction,
} from "../../src/trading/dbx/ledger/ledger";

import {
  dbxLedgerAccountFixtures,
  dbxOpeningIssuanceFixture,
} from "../../src/trading/dbx/ledger/fixtures";

test(
  "same DBX idempotency request posts exactly once",
  () => {
    let ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    const first =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      );

    ledger =
      first.ledger;

    const replay =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      );

    assert.equal(
      replay.idempotentReplay,
      true
    );

    assert.equal(
      replay.ledger.transactions.length,
      1
    );
  }
);

test(
  "same idempotency key cannot represent different DBX movement",
  () => {
    const first =
      postDbxLedgerTransaction(
        createDbxLedger(
          "digitalboost-dbx-ledger",
          dbxLedgerAccountFixtures
        ),
        dbxOpeningIssuanceFixture
      );

    assert.throws(
      () =>
        postDbxLedgerTransaction(
          first.ledger,
          {
            ...dbxOpeningIssuanceFixture,

            reference:
              "different-economic-event",
          }
        ),

      /DBX_LEDGER_IDEMPOTENCY_CONFLICT/
    );
  }
);
