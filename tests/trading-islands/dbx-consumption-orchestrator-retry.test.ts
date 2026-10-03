import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionRecoveryState,
} from "../../src/trading/dbx/consumption/recovery/stateMachine";

import {
  orchestrateDbxConsumption,
} from "../../src/trading/dbx/consumption/orchestration/orchestrator";

test(
  "temporary dependency failure keeps hold active",
  () => {
    const recovery =
      createDbxConsumptionRecoveryState({
        id:
          "retry-recovery",

        consumptionIntentId:
          "retry-intent",

        holdId:
          "retry-hold",

        createdAt:
          "2026-10-02T20:10:00.000Z",
      });

    const result =
      orchestrateDbxConsumption({
        ledger: {
          id:
            "invalid-ledger",

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
                "retry-hold",

              idempotencyKey:
                "retry-hold-key",

              accountId:
                "missing-user",

              amountMinor:
                1_000_000,

              purpose:
                "SERVICE",

              reference:
                "retry-service",

              status:
                "ACTIVE",

              createdAt:
                "2026-10-02T20:09:00.000Z",

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
            "retry-intent",

          idempotencyKey:
            "retry-intent-key",

          userAccountId:
            "missing-user",

          destinationAccountId:
            "missing-service",

          amountMinor:
            1_000_000,

          purpose:
            "SERVICE",

          serviceReference:
            "retry-service",

          createdAt:
            "2026-10-02T20:10:00.000Z",

          authoritative:
            false,
        },

        binding: {
          id:
            "retry-binding",

          consumptionIntentId:
            "retry-intent",

          holdId:
            "retry-hold",

          userAccountId:
            "missing-user",

          amountMinor:
            1_000_000,

          checks: [
            {
              code:
                "HOLD_ACTIVE",

              passed:
                true,
            },

            {
              code:
                "ACCOUNT_MATCH",

              passed:
                true,
            },

            {
              code:
                "AMOUNT_MATCH",

              passed:
                true,
            },

            {
              code:
                "REFERENCE_MATCH",

              passed:
                true,
            },

            {
              code:
                "PURPOSE_COMPATIBLE",

              passed:
                true,
            },
          ],

          verified:
            true,

          createdAt:
            "2026-10-02T20:09:30.000Z",

          authoritative:
            false,
        },

        recovery,

        now:
          "2026-10-02T20:10:30.000Z",
      });

    assert.equal(
      result.status,
      "RETRY_PENDING"
    );

    assert.equal(
      result.recovery
        .lastFailureClass,
      "RETRYABLE"
    );

    assert.equal(
      result.holdStore
        .holds[0]
        .status,
      "ACTIVE"
    );

    assert.equal(
      result.registry
        .records.length,
      0
    );
  }
);
