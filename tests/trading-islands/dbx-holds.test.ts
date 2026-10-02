import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxLedger,
  postDbxLedgerTransaction,
} from "../../src/trading/dbx/ledger/ledger";

import {
  createDbxHold,
  createDbxHoldStore,
  calculateDbxSpendableBalance,
} from "../../src/trading/dbx/ledger/holds";

import {
  dbxCreatorRewardFixture,
  dbxLedgerAccountFixtures,
  dbxOpeningIssuanceFixture,
} from "../../src/trading/dbx/ledger/fixtures";

import {
  dbxMarketplaceHoldFixture,
} from "../../src/trading/dbx/ledger/holdFixtures";

function createFundedLedger() {
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

  return ledger;
}

test(
  "hold reduces available DBX but not ledger balance",
  () => {
    const ledger =
      createFundedLedger();

    const result =
      createDbxHold(
        ledger,
        createDbxHoldStore(),
        dbxMarketplaceHoldFixture
      );

    const balance =
      calculateDbxSpendableBalance(
        ledger,
        result.store,
        "dbx-creator-001"
      );

    assert.equal(
      balance.ledgerBalanceMinor,
      25_000_000
    );

    assert.equal(
      balance.reservedMinor,
      10_000_000
    );

    assert.equal(
      balance.availableMinor,
      15_000_000
    );

    assert.equal(
      result.hold.status,
      "ACTIVE"
    );
  }
);

test(
  "hold creation rejects overspending",
  () => {
    const ledger =
      createFundedLedger();

    assert.throws(
      () =>
        createDbxHold(
          ledger,
          createDbxHoldStore(),
          {
            ...dbxMarketplaceHoldFixture,

            id:
              "overspend-hold",

            idempotencyKey:
              "overspend-key",

            amountMinor:
              30_000_000,
          }
        ),

      /DBX_HOLD_INSUFFICIENT_AVAILABLE_BALANCE/
    );
  }
);
