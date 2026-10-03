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

test(
  "completed reserved consumption safely replays without second debit",
  () => {
    let ledger =
      createDbxLedger(
        "replay-ledger",
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
            "replay-fund-user",

          idempotencyKey:
            "replay-fund-user-key",

          kind:
            "TRANSFER",

          reference:
            "replay-user-funding",

          entries: [
            {
              id:
                "replay-fund-debit",

              accountId:
                "dbx-platform-treasury",

              side:
                "DEBIT",

              amountMinor:
                50_000_000,
            },

            {
              id:
                "replay-fund-credit",

              accountId:
                "dbx-user-001",

              side:
                "CREDIT",

              amountMinor:
                50_000_000,
            },
          ],

          createdAt:
            "2026-10-02T18:20:00.000Z",

          reversalOf:
            null,

          metadata: {
            purpose:
              "31c10b-replay-funding",
          },
        }
      ).ledger;

    const intent =
      createDbxConsumptionIntent({
        id:
          "replay-consumption",

        idempotencyKey:
          "replay-consumption-key",

        userAccountId:
          "dbx-user-001",

        destinationAccountId:
          "dbx-platform-treasury",

        amountMinor:
          4_000_000,

        purpose:
          "BOT_RUNTIME",

        serviceReference:
          "bot-runtime-replay",

        createdAt:
          "2026-10-02T18:22:00.000Z",
      });

    const holdResult =
      createDbxHold(
        ledger,
        createDbxHoldStore(),
        {
          id:
            "replay-hold",

          idempotencyKey:
            "replay-hold-key",

          accountId:
            "dbx-user-001",

          amountMinor:
            4_000_000,

          purpose:
            "BOT_RUNTIME",

          reference:
            "bot-runtime-replay",

          createdAt:
            "2026-10-02T18:21:00.000Z",

          expiresAt:
            null,
        }
      );

    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "replay-binding",

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
          "2026-10-02T18:21:30.000Z",
      });

    const first =
      postReservedDbxConsumption({
        ledger,

        holdStore:
          holdResult.store,

        registry:
          createDbxConsumptionRegistry(),

        intent,

        binding,

        verifiedAt:
          "2026-10-02T18:22:00.000Z",
      });

    const countBefore =
      first.ledger.transactions.length;

    const replay =
      postReservedDbxConsumption({
        ledger:
          first.ledger,

        holdStore:
          first.holdStore,

        registry:
          first.registry,

        intent,

        binding,

        verifiedAt:
          "2026-10-02T18:23:00.000Z",
      });

    assert.equal(
      replay.idempotentReplay,
      true
    );

    assert.equal(
      replay.ledger.transactions.length,
      countBefore
    );

    assert.equal(
      replay.registry.records.length,
      1
    );

    assert.equal(
      replay.holdStore.holds[0]
        .status,
      "CAPTURED"
    );
  }
);
