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
  "DBX Ledger initializes as accounting system of record",
  () => {
    const ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    assert.equal(
      ledger.currency,
      "DBX"
    );

    assert.equal(
      ledger.systemOfRecord,
      "DBX_LEDGER"
    );

    assert.equal(
      ledger.governanceAuthority,
      false
    );

    assert.equal(
      ledger.transactions.length,
      0
    );
  }
);

test(
  "balanced DBX transaction posts atomically",
  () => {
    const ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    const result =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      );

    assert.equal(
      result.transaction.status,
      "POSTED"
    );

    assert.equal(
      result.transaction.immutable,
      true
    );

    assert.equal(
      result.ledger.transactions.length,
      1
    );

    assert.equal(
      result.idempotentReplay,
      false
    );
  }
);

test(
  "unbalanced DBX transaction cannot post",
  () => {
    const ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    assert.throws(
      () =>
        postDbxLedgerTransaction(
          ledger,
          {
            ...dbxOpeningIssuanceFixture,

            id:
              "dbx-unbalanced",

            idempotencyKey:
              "idem-unbalanced",

            entries: [
              {
                id:
                  "debit",

                accountId:
                  "dbx-system-issuance",

                side:
                  "DEBIT",

                amountMinor:
                  100,
              },

              {
                id:
                  "credit",

                accountId:
                  "dbx-platform-treasury",

                side:
                  "CREDIT",

                amountMinor:
                  99,
              },
            ],
          }
        ),

      /UNBALANCED_TRANSACTION/
    );

    assert.equal(
      ledger.transactions.length,
      0
    );
  }
);
