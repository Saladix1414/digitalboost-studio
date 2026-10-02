import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDbxAccountBalance,
  calculateDbxLedgerInvariant,
} from "../../src/trading/dbx/ledger/balance";

import {
  createDbxLedger,
  postDbxLedgerTransaction,
} from "../../src/trading/dbx/ledger/ledger";

import {
  dbxCreatorRewardFixture,
  dbxLedgerAccountFixtures,
  dbxOpeningIssuanceFixture,
} from "../../src/trading/dbx/ledger/fixtures";

test(
  "DBX balances are reconstructed from ledger entries",
  () => {
    let ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      ).ledger;

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxCreatorRewardFixture
      ).ledger;

    const creator =
      calculateDbxAccountBalance(
        ledger,
        "dbx-creator-001"
      );

    const treasury =
      calculateDbxAccountBalance(
        ledger,
        "dbx-platform-treasury"
      );

    assert.equal(
      creator.balanceMinor,
      25_000_000
    );

    assert.equal(
      treasury.balanceMinor,
      975_000_000
    );

    assert.equal(
      creator.derivedFromLedger,
      true
    );
  }
);

test(
  "global DBX double-entry invariant remains zero",
  () => {
    let ledger =
      createDbxLedger(
        "digitalboost-dbx-ledger",
        dbxLedgerAccountFixtures
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      ).ledger;

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxCreatorRewardFixture
      ).ledger;

    const invariant =
      calculateDbxLedgerInvariant(
        ledger
      );

    assert.equal(
      invariant.balanced,
      true
    );

    assert.equal(
      invariant.debitMinor,
      invariant.creditMinor
    );

    assert.equal(
      invariant.netMinor,
      0
    );
  }
);
