import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxLedger,
  postDbxLedgerTransaction,
} from "../../src/trading/dbx/ledger/ledger";

import {
  createDbxHold,
  createDbxHoldStore,
} from "../../src/trading/dbx/ledger/holds";

import {
  assertDbxAvailableBalance,
  assertDbxNoDoubleSpend,
} from "../../src/trading/dbx/ledger/reservationGuards";

import {
  dbxCreatorRewardFixture,
  dbxLedgerAccountFixtures,
  dbxOpeningIssuanceFixture,
} from "../../src/trading/dbx/ledger/fixtures";

import {
  dbxBotRuntimeHoldFixture,
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
  "multiple holds consume only available DBX",
  () => {
    const ledger =
      createFundedLedger();

    let store =
      createDbxHoldStore();

    store =
      createDbxHold(
        ledger,
        store,
        dbxMarketplaceHoldFixture
      ).store;

    store =
      createDbxHold(
        ledger,
        store,
        dbxBotRuntimeHoldFixture
      ).store;

    const balance =
      assertDbxAvailableBalance(
        ledger,
        store,
        "dbx-creator-001",
        10_000_000
      );

    assert.equal(
      balance.reservedMinor,
      15_000_000
    );

    assert.equal(
      balance.availableMinor,
      10_000_000
    );
  }
);

test(
  "third reservation cannot exceed remaining available DBX",
  () => {
    const ledger =
      createFundedLedger();

    let store =
      createDbxHoldStore();

    store =
      createDbxHold(
        ledger,
        store,
        dbxMarketplaceHoldFixture
      ).store;

    store =
      createDbxHold(
        ledger,
        store,
        dbxBotRuntimeHoldFixture
      ).store;

    assert.throws(
      () =>
        createDbxHold(
          ledger,
          store,
          {
            id:
              "dbx-hold-third",

            idempotencyKey:
              "idem-third",

            accountId:
              "dbx-creator-001",

            amountMinor:
              11_000_000,

            purpose:
              "SERVICE",

            reference:
              "service:001",

            createdAt:
              "2026-10-02T11:02:00.000Z",

            expiresAt:
              null,
          }
        ),

      /DBX_HOLD_INSUFFICIENT_AVAILABLE_BALANCE/
    );
  }
);

test(
  "double-spend invariant remains safe",
  () => {
    const ledger =
      createFundedLedger();

    const result =
      assertDbxNoDoubleSpend(
        ledger,
        createDbxHoldStore(),
        "dbx-creator-001"
      );

    assert.equal(
      result.safe,
      true
    );

    assert.equal(
      result.availableMinor >= 0,
      true
    );
  }
);
