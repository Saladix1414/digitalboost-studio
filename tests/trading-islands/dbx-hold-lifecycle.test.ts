import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxLedger,
  postDbxLedgerTransaction,
} from "../../src/trading/dbx/ledger/ledger";

import {
  calculateDbxSpendableBalance,
  createDbxHold,
  createDbxHoldStore,
} from "../../src/trading/dbx/ledger/holds";

import {
  captureDbxHold,
  expireDbxHold,
  releaseDbxHold,
} from "../../src/trading/dbx/ledger/holdLifecycle";

import {
  dbxCreatorRewardFixture,
  dbxLedgerAccountFixtures,
  dbxOpeningIssuanceFixture,
} from "../../src/trading/dbx/ledger/fixtures";

import {
  dbxMarketplaceHoldFixture,
} from "../../src/trading/dbx/ledger/holdFixtures";

function createFixture() {
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

  const created =
    createDbxHold(
      ledger,
      createDbxHoldStore(),
      dbxMarketplaceHoldFixture
    );

  return {
    ledger,
    store:
      created.store,
    hold:
      created.hold,
  };
}

test(
  "release restores available balance",
  () => {
    const fixture =
      createFixture();

    const released =
      releaseDbxHold(
        fixture.store,
        fixture.hold.id,
        "2026-10-02T11:05:00.000Z"
      );

    const balance =
      calculateDbxSpendableBalance(
        fixture.ledger,
        released.store,
        "dbx-creator-001"
      );

    assert.equal(
      released.hold.status,
      "RELEASED"
    );

    assert.equal(
      balance.reservedMinor,
      0
    );

    assert.equal(
      balance.availableMinor,
      25_000_000
    );
  }
);

test(
  "expired hold stops reserving DBX",
  () => {
    const fixture =
      createFixture();

    const expired =
      expireDbxHold(
        fixture.store,
        fixture.hold.id,
        "2026-10-02T11:16:00.000Z"
      );

    const balance =
      calculateDbxSpendableBalance(
        fixture.ledger,
        expired.store,
        "dbx-creator-001"
      );

    assert.equal(
      expired.hold.status,
      "EXPIRED"
    );

    assert.equal(
      balance.reservedMinor,
      0
    );
  }
);

test(
  "capture binds hold to ledger transaction reference",
  () => {
    const fixture =
      createFixture();

    const captured =
      captureDbxHold(
        fixture.store,
        fixture.hold.id,
        "dbx-tx-marketplace-001"
      );

    assert.equal(
      captured.hold.status,
      "CAPTURED"
    );

    assert.equal(
      captured.hold.capturedTransactionId,
      "dbx-tx-marketplace-001"
    );
  }
);
