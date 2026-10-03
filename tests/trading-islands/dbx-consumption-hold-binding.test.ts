import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionIntent,
} from "../../src/trading/dbx/consumption/intent";

import {
  evaluateDbxConsumptionHoldBinding,
} from "../../src/trading/dbx/consumption/holdBinding";

import {
  bindDbxConsumptionToHold,
} from "../../src/trading/dbx/consumption/reservedConsumption";

test(
  "consumption binds to matching active hold",
  () => {
    const intent =
      createDbxConsumptionIntent({
        id:
          "consumption-hold-1",

        idempotencyKey:
          "consumption-hold-key-1",

        userAccountId:
          "user-001",

        destinationAccountId:
          "platform-revenue",

        amountMinor:
          3_000_000,

        purpose:
          "AI_RUNTIME",

        serviceReference:
          "runtime-session-001",

        createdAt:
          "2026-10-02T17:00:00.000Z",
      });

    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "binding-1",

        intent,

        hold: {
          id:
            "hold-001",

          accountId:
            "user-001",

          amountMinor:
            3_000_000,

          purpose:
            "AI_RUNTIME",

          reference:
            "runtime-session-001",

          status:
            "ACTIVE",

          authoritative:
            false,
        },

        createdAt:
          "2026-10-02T17:00:01.000Z",
      });

    assert.equal(
      binding.verified,
      true
    );

    const result =
      bindDbxConsumptionToHold(
        intent,
        binding
      );

    assert.equal(
      result.binding.holdId,
      "hold-001"
    );
  }
);
