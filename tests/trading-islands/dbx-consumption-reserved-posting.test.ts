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
  createDbxHold,
  createDbxHoldStore,
} from "../../src/trading/dbx/ledger/holds";

import {
  createDbxConsumptionIntent,
} from "../../src/trading/dbx/consumption/intent";

import {
  evaluateDbxConsumptionHoldBinding,
} from "../../src/trading/dbx/consumption/holdBinding";

import {
  createDbxConsumptionRegistry,
} from "../../src/trading/dbx/consumption/registry";

import {
  postReservedDbxConsumption,
} from "../../src/trading/dbx/consumption/reservedPosting";

function buildFundedLedger() {
  let ledger =
    createDbxLedger(
      "dbx-consumption-test-ledger",
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
      {
        id:
          "dbx-user-funding-001",

        idempotencyKey:
          "dbx-user-funding-key-001",

        kind:
          "TRANSFER",

        reference:
          "consumption-test-user-funding",

        entries: [
          {
            id:
              "dbx-user-funding-debit",

            accountId:
              "dbx-platform-treasury",

            side:
              "DEBIT",

            amountMinor:
              100_000_000,
          },

          {
            id:
              "dbx-user-funding-credit",

            accountId:
              "dbx-user-001",

            side:
              "CREDIT",

            amountMinor:
              100_000_000,
          },
        ],

        createdAt:
          "2026-10-02T18:00:00.000Z",

        reversalOf:
          null,

        metadata: {
          purpose:
            "31c10b-test-funding",
        },
      }
    ).ledger;

  return ledger;
}

test(
  "reserved consumption posts ledger and captures exact hold",
  () => {
    const ledger =
      buildFundedLedger();

    const intent =
      createDbxConsumptionIntent({
        id:
          "reserved-consumption-001",

        idempotencyKey:
          "reserved-consumption-key-001",

        userAccountId:
          "dbx-user-001",

        destinationAccountId:
          "dbx-platform-treasury",

        amountMinor:
          5_000_000,

        purpose:
          "AI_RUNTIME",

        serviceReference:
          "ai-session-001",

        createdAt:
          "2026-10-02T18:05:00.000Z",
      });

    const holdResult =
      createDbxHold(
        ledger,
        createDbxHoldStore(),
        {
          id:
            "consumption-hold-001",

          idempotencyKey:
            "consumption-hold-key-001",

          accountId:
            "dbx-user-001",

          amountMinor:
            5_000_000,

          purpose:
            "AI_RUNTIME",

          reference:
            "ai-session-001",

          createdAt:
            "2026-10-02T18:04:00.000Z",

          expiresAt:
            null,
        }
      );

    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "consumption-binding-001",

        intent,

        hold: {
          id:
            holdResult.hold.id,

          accountId:
            holdResult.hold.accountId,

          amountMinor:
            holdResult.hold.amountMinor,

          purpose:
            holdResult.hold.purpose,

          reference:
            holdResult.hold.reference,

          status:
            holdResult.hold.status,

          authoritative:
            false,
        },

        createdAt:
          "2026-10-02T18:04:30.000Z",
      });

    const result =
      postReservedDbxConsumption({
        ledger,

        holdStore:
          holdResult.store,

        registry:
          createDbxConsumptionRegistry(),

        intent,

        binding,

        verifiedAt:
          "2026-10-02T18:05:00.000Z",
      });

    assert.equal(
      result.idempotentReplay,
      false
    );

    assert.equal(
      result.record.status,
      "POSTED"
    );

    const captured =
      result.holdStore.holds.find(
        hold =>
          hold.id ===
          "consumption-hold-001"
      );

    assert.equal(
      captured?.status,
      "CAPTURED"
    );

    assert.equal(
      captured
        ?.capturedTransactionId,
      result.record.transactionId
    );

    assert.equal(
      result.ledger.transactions.some(
        transaction =>
          transaction.id ===
          result.record.transactionId
      ),
      true
    );
  }
);
