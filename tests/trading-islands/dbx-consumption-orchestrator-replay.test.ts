import assert from "node:assert/strict";
import test from "node:test";

import {
  orchestrateDbxConsumption,
} from "../../src/trading/dbx/consumption/orchestration/orchestrator";

test(
  "completed orchestration replay does not create second debit",
  () => {
    const transactionId =
      "dbx-consumption:replay-intent";

    const result =
      orchestrateDbxConsumption({
        ledger: {
          id:
            "replay-ledger",

          currency:
            "DBX",

          accounts:
            [],

          transactions: [
            {
              id:
                transactionId,

              idempotencyKey:
                "dbx-ledger-consumption:replay-key",

              kind:
                "FEE",

              reference:
                "dbx-consumption|intent=replay-intent|purpose=SERVICE|service=replay-service",

              entries:
                [],

              createdAt:
                "2026-10-02T20:30:00.000Z",

              reversalOf:
                null,

              metadata:
                {},

              status:
                "POSTED",

              immutable:
                true,

              systemOfRecord:
                "DBX_LEDGER",

              governanceAuthority:
                false,
            },
          ],

          systemOfRecord:
            "DBX_LEDGER",

          governanceAuthority:
            false,
        },

        holdStore: {
          holds: [
            {
              id:
                "replay-hold",

              idempotencyKey:
                "replay-hold-key",

              accountId:
                "replay-user",

              amountMinor:
                1_000_000,

              purpose:
                "SERVICE",

              reference:
                "replay-service",

              status:
                "CAPTURED",

              createdAt:
                "2026-10-02T20:29:00.000Z",

              expiresAt:
                null,

              capturedTransactionId:
                transactionId,

              releasedAt:
                null,

              authoritative:
                false,
            },
          ],
        },

        registry: {
          records: [
            {
              id:
                "replay-record",

              intentId:
                "replay-intent",

              idempotencyKey:
                "replay-key",

              userAccountId:
                "replay-user",

              destinationAccountId:
                "replay-service-account",

              amountMinor:
                1_000_000,

              purpose:
                "SERVICE",

              transactionId,

              status:
                "POSTED",

              postedAt:
                "2026-10-02T20:30:00.000Z",

              systemOfRecord:
                "DBX_LEDGER",

              governanceAuthority:
                false,
            },
          ],
        },

        intent: {
          id:
            "replay-intent",

          idempotencyKey:
            "replay-key",

          userAccountId:
            "replay-user",

          destinationAccountId:
            "replay-service-account",

          amountMinor:
            1_000_000,

          purpose:
            "SERVICE",

          serviceReference:
            "replay-service",

          createdAt:
            "2026-10-02T20:30:00.000Z",

          authoritative:
            false,
        },

        binding: {
          id:
            "replay-binding",

          consumptionIntentId:
            "replay-intent",

          holdId:
            "replay-hold",

          userAccountId:
            "replay-user",

          amountMinor:
            1_000_000,

          checks:
            [],

          verified:
            true,

          createdAt:
            "2026-10-02T20:29:30.000Z",

          authoritative:
            false,
        },

        recovery: {
          id:
            "replay-recovery",

          consumptionIntentId:
            "replay-intent",

          holdId:
            "replay-hold",

          status:
            "COMPLETED",

          attempt:
            1,

          lastFailureCode:
            null,

          lastFailureClass:
            null,

          transactionId,

          createdAt:
            "2026-10-02T20:29:00.000Z",

          updatedAt:
            "2026-10-02T20:30:00.000Z",

          authoritative:
            false,
        },

        now:
          "2026-10-02T20:31:00.000Z",
      });

    assert.equal(
      result.status,
      "COMPLETED"
    );

    assert.equal(
      result.idempotentReplay,
      true
    );

    assert.equal(
      result.ledger
        .transactions.length,
      1
    );

    assert.equal(
      result.registry
        .records.length,
      1
    );
  }
);
