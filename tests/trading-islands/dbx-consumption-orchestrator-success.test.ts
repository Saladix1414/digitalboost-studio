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
  createDbxConsumptionRecoveryState,
} from "../../src/trading/dbx/consumption/recovery/stateMachine";

import {
  orchestrateDbxConsumption,
} from "../../src/trading/dbx/consumption/orchestration/orchestrator";

test(
  "orchestrator completes reserved economic consumption",
  () => {
    let ledger =
      createDbxLedger(
        "orchestrator-ledger",
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
            "orchestrator-user-fund",

          idempotencyKey:
            "orchestrator-user-fund-key",

          kind:
            "TRANSFER",

          reference:
            "orchestrator-user-funding",

          entries: [
            {
              id:
                "orchestrator-fund-debit",

              accountId:
                "dbx-platform-treasury",

              side:
                "DEBIT",

              amountMinor:
                50_000_000,
            },

            {
              id:
                "orchestrator-fund-credit",

              accountId:
                "dbx-user-001",

              side:
                "CREDIT",

              amountMinor:
                50_000_000,
            },
          ],

          createdAt:
            "2026-10-02T20:00:00.000Z",

          reversalOf:
            null,

          metadata: {
            purpose:
              "31c10d-fixture",
          },
        }
      ).ledger;

    const intent =
      createDbxConsumptionIntent({
        id:
          "orchestrator-consumption-1",

        idempotencyKey:
          "orchestrator-consumption-key-1",

        userAccountId:
          "dbx-user-001",

        destinationAccountId:
          "dbx-platform-treasury",

        amountMinor:
          3_000_000,

        purpose:
          "AI_RUNTIME",

        serviceReference:
          "orchestrator-ai-session",

        createdAt:
          "2026-10-02T20:02:00.000Z",
      });

    const hold =
      createDbxHold(
        ledger,
        createDbxHoldStore(),
        {
          id:
            "orchestrator-hold-1",

          idempotencyKey:
            "orchestrator-hold-key-1",

          accountId:
            "dbx-user-001",

          amountMinor:
            3_000_000,

          purpose:
            "AI_RUNTIME",

          reference:
            "orchestrator-ai-session",

          createdAt:
            "2026-10-02T20:01:00.000Z",

          expiresAt:
            null,
        }
      );

    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "orchestrator-binding-1",

        intent,

        hold: {
          id:
            hold.hold.id,

          accountId:
            hold.hold.accountId,

          amountMinor:
            hold.hold.amountMinor,

          purpose:
            hold.hold.purpose,

          reference:
            hold.hold.reference,

          status:
            hold.hold.status,

          authoritative:
            false,
        },

        createdAt:
          "2026-10-02T20:01:30.000Z",
      });

    const recovery =
      createDbxConsumptionRecoveryState({
        id:
          "orchestrator-recovery-1",

        consumptionIntentId:
          intent.id,

        holdId:
          hold.hold.id,

        createdAt:
          "2026-10-02T20:01:40.000Z",
      });

    const result =
      orchestrateDbxConsumption({
        ledger,

        holdStore:
          hold.store,

        registry:
          createDbxConsumptionRegistry(),

        intent,

        binding,

        recovery,

        now:
          "2026-10-02T20:02:00.000Z",
      });

    assert.equal(
      result.status,
      "COMPLETED"
    );

    assert.equal(
      result.recovery.status,
      "COMPLETED"
    );

    assert.equal(
      result.holdStore
        .holds[0]
        .status,
      "CAPTURED"
    );

    assert.equal(
      result.registry
        .records.length,
      1
    );

    assert.equal(
      result.record
        ?.transactionId,
      result.recovery
        .transactionId
    );
  }
);
