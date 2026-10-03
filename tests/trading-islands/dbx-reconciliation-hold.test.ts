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
  reconcileDbxHolds,
} from "../../src/trading/dbx/reconciliation/holds";

test(
  "captured hold detects missing ledger transaction",
  () => {
    let ledger =
      createDbxLedger(
        "hold-reconciliation-ledger",
        dbxLedgerAccountFixtures
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      ).ledger;

    const result =
      reconcileDbxHolds(
        ledger,
        {
          holds: [
            {
              id:
                "captured-hold-1",

              idempotencyKey:
                "captured-hold-key-1",

              accountId:
                "dbx-user-001",

              amountMinor:
                1_000_000,

              purpose:
                "SERVICE",

              reference:
                "service-001",

              status:
                "CAPTURED",

              createdAt:
                "2026-10-02T22:00:00.000Z",

              expiresAt:
                null,

              capturedTransactionId:
                "missing-transaction",

              releasedAt:
                null,

              authoritative:
                false,
            },
          ],
        }
      );

    assert.equal(
      result.issues.some(
        issue =>
          issue.code ===
          "HOLD_CAPTURE_TRANSACTION_MISSING"
      ),
      true
    );
  }
);
