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
  "same hold request is idempotent",
  () => {
    const ledger =
      createFundedLedger();

    const first =
      createDbxHold(
        ledger,
        createDbxHoldStore(),
        dbxMarketplaceHoldFixture
      );

    const replay =
      createDbxHold(
        ledger,
        first.store,
        dbxMarketplaceHoldFixture
      );

    assert.equal(
      replay.idempotentReplay,
      true
    );

    assert.equal(
      replay.store.holds.length,
      1
    );
  }
);

test(
  "same hold idempotency key cannot change reservation",
  () => {
    const ledger =
      createFundedLedger();

    const first =
      createDbxHold(
        ledger,
        createDbxHoldStore(),
        dbxMarketplaceHoldFixture
      );

    assert.throws(
      () =>
        createDbxHold(
          ledger,
          first.store,
          {
            ...dbxMarketplaceHoldFixture,

            amountMinor:
              11_000_000,
          }
        ),

      /DBX_HOLD_IDEMPOTENCY_CONFLICT/
    );
  }
);
