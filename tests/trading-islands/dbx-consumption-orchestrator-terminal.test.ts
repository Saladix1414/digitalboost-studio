import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionRecoveryState,
} from "../../src/trading/dbx/consumption/recovery/stateMachine";

import {
  orchestrateDbxConsumption,
} from "../../src/trading/dbx/consumption/orchestration/orchestrator";

test(
  "invalid binding becomes terminal failure and releases hold",
  () => {
    const recovery =
      createDbxConsumptionRecoveryState({
        id:
          "terminal-recovery",

        consumptionIntentId:
          "terminal-intent",

        holdId:
          "terminal-hold",

        createdAt:
          "2026-10-02T20:20:00.000Z",
      });

    const result =
      orchestrateDbxConsumption({
        ledger: {
          id:
            "terminal-ledger",

          currency:
            "DBX",

          accounts:
            [],

          transactions:
            [],

          systemOfRecord:
            "DBX_LEDGER",

          governanceAuthority:
            false,
        },

        holdStore: {
          holds: [
            {
              id:
                "terminal-hold",

              idempotencyKey:
                "terminal-hold-key",

              accountId:
                "user-a",

              amountMinor:
                1_000_000,

              purpose:
                "SERVICE",

              reference:
                "service-a",

              status:
                "ACTIVE",

              createdAt:
                "2026-10-02T20:19:00.000Z",

              expiresAt:
                null,

              capturedTransactionId:
                null,

              releasedAt:
                null,

              authoritative:
                false,
            },
          ],
        },

        registry: {
          records:
            [],
        },

        intent: {
          id:
            "terminal-intent",

          idempotencyKey:
            "terminal-intent-key",

          userAccountId:
            "user-b",

          destinationAccountId:
            "service-account",

          amountMinor:
            1_000_000,

          purpose:
            "SERVICE",

          serviceReference:
            "service-a",

          createdAt:
            "2026-10-02T20:20:00.000Z",

          authoritative:
            false,
        },

        binding: {
          id:
            "terminal-binding",

          consumptionIntentId:
            "terminal-intent",

          holdId:
            "terminal-hold",

          userAccountId:
            "user-b",

          amountMinor:
            1_000_000,

          checks: [
            {
              code:
                "ACCOUNT_MATCH",

              passed:
                false,
            },
          ],

          verified:
            false,

          createdAt:
            "2026-10-02T20:19:30.000Z",

          authoritative:
            false,
        },

        recovery,

        now:
          "2026-10-02T20:20:30.000Z",
      });

    assert.equal(
      result.status,
      "TERMINAL_FAILURE"
    );

    assert.equal(
      result.recovery
        .lastFailureCode,
      "BINDING_INVALID"
    );

    assert.equal(
      result.holdStore
        .holds[0]
        .status,
      "RELEASED"
    );
  }
);
