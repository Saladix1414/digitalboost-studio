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
  releaseDbxConsumptionReservation,
} from "../../src/trading/dbx/consumption/reservationRelease";

test(
  "terminal cancellation releases active consumption reservation",
  () => {
    let ledger =
      createDbxLedger(
        "release-ledger",
        dbxLedgerAccountFixtures
      );

    ledger =
      postDbxLedgerTransaction(
        ledger,
        dbxOpeningIssuanceFixture
      ).ledger;

    const funded =
      postDbxLedgerTransaction(
        ledger,
        {
          id:
            "release-fund-user",

          idempotencyKey:
            "release-fund-user-key",

          kind:
            "TRANSFER",

          reference:
            "release-test-funding",

          entries: [
            {
              id:
                "release-fund-debit",

              accountId:
                "dbx-platform-treasury",

              side:
                "DEBIT",

              amountMinor:
                10_000_000,
            },

            {
              id:
                "release-fund-credit",

              accountId:
                "dbx-user-001",

              side:
                "CREDIT",

              amountMinor:
                10_000_000,
            },
          ],

          createdAt:
            "2026-10-02T18:30:00.000Z",

          reversalOf:
            null,

          metadata: {
            purpose:
              "31c10b-release-funding",
          },
        }
      );

    const hold =
      createDbxHold(
        funded.ledger,
        createDbxHoldStore(),
        {
          id:
            "release-hold",

          idempotencyKey:
            "release-hold-key",

          accountId:
            "dbx-user-001",

          amountMinor:
            2_000_000,

          purpose:
            "SERVICE",

          reference:
            "service-cancelled",

          createdAt:
            "2026-10-02T18:31:00.000Z",

          expiresAt:
            null,
        }
      );

    const binding = {
      id:
        "release-binding",

      consumptionIntentId:
        "release-intent",

      holdId:
        "release-hold",

      userAccountId:
        "dbx-user-001",

      amountMinor:
        2_000_000,

      checks: [],
      verified:
        true,

      createdAt:
        "2026-10-02T18:31:30.000Z",

      authoritative:
        false as const,
    };

    const released =
      releaseDbxConsumptionReservation({
        holdStore:
          hold.store,

        binding,

        releasedAt:
          "2026-10-02T18:32:00.000Z",
      });

    assert.equal(
      released.hold.status,
      "RELEASED"
    );

    const replay =
      releaseDbxConsumptionReservation({
        holdStore:
          released.holdStore,

        binding,

        releasedAt:
          "2026-10-02T18:33:00.000Z",
      });

    assert.equal(
      replay.idempotentReplay,
      true
    );
  }
);
