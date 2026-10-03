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

import {
  reconcileDbxEconomy,
} from "../../src/trading/dbx/reconciliation/reconcile";

test(
  "healthy DBX economy reconciles cleanly",
  () => {
    let ledger =
      createDbxLedger(
        "reconciliation-ledger",
        dbxLedgerAccountFixtures
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      ).ledger;

    const report =
      reconcileDbxEconomy({
        id:
          "reconciliation-001",

        ledger,

        holdStore: {
          holds:
            [],
        },

        consumptionRegistry: {
          records:
            [],
        },

        marketplaceRegistry: {
          results:
            [],
        },

        rewardPoolRegistry: {
          records:
            [],
        },

        reconciledAt:
          "2026-10-02T22:00:00.000Z",
      });

    assert.equal(
      report.healthy,
      true
    );

    assert.equal(
      report.issues.length,
      0
    );

    assert.equal(
      report.accountingSystemOfRecord,
      "DBX_LEDGER"
    );

    assert.equal(
      report.authoritative,
      false
    );
  }
);
