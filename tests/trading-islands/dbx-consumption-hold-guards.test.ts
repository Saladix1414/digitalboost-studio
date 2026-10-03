import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionIntent,
} from "../../src/trading/dbx/consumption/intent";

import {
  assertDbxConsumptionHoldBinding,
  evaluateDbxConsumptionHoldBinding,
} from "../../src/trading/dbx/consumption/holdBinding";

const intent =
  createDbxConsumptionIntent({
    id:
      "consumption-guard-1",

    idempotencyKey:
      "consumption-guard-key-1",

    userAccountId:
      "user-001",

    destinationAccountId:
      "platform-revenue",

    amountMinor:
      4_000_000,

    purpose:
      "BOT_RUNTIME",

    serviceReference:
      "bot-runtime-001",

    createdAt:
      "2026-10-02T17:10:00.000Z",
  });

test(
  "captured hold cannot authorize consumption",
  () => {
    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "binding-captured",

        intent,

        hold: {
          id:
            "hold-captured",

          accountId:
            "user-001",

          amountMinor:
            4_000_000,

          purpose:
            "BOT_RUNTIME",

          reference:
            "bot-runtime-001",

          status:
            "CAPTURED",

          authoritative:
            false,
        },

        createdAt:
          "2026-10-02T17:10:01.000Z",
      });

    assert.equal(
      binding.verified,
      false
    );

    assert.throws(
      () =>
        assertDbxConsumptionHoldBinding(
          binding
        ),

      /HOLD_ACTIVE/
    );
  }
);

test(
  "mismatched amount cannot authorize consumption",
  () => {
    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "binding-amount",

        intent,

        hold: {
          id:
            "hold-amount",

          accountId:
            "user-001",

          amountMinor:
            3_000_000,

          purpose:
            "BOT_RUNTIME",

          reference:
            "bot-runtime-001",

          status:
            "ACTIVE",

          authoritative:
            false,
        },

        createdAt:
          "2026-10-02T17:10:01.000Z",
      });

    assert.equal(
      binding.verified,
      false
    );

    assert.throws(
      () =>
        assertDbxConsumptionHoldBinding(
          binding
        ),

      /AMOUNT_MATCH/
    );
  }
);

test(
  "different user cannot consume another account hold",
  () => {
    const binding =
      evaluateDbxConsumptionHoldBinding({
        id:
          "binding-user",

        intent,

        hold: {
          id:
            "hold-user",

          accountId:
            "user-002",

          amountMinor:
            4_000_000,

          purpose:
            "BOT_RUNTIME",

          reference:
            "bot-runtime-001",

          status:
            "ACTIVE",

          authoritative:
            false,
        },

        createdAt:
          "2026-10-02T17:10:01.000Z",
      });

    assert.equal(
      binding.verified,
      false
    );

    assert.throws(
      () =>
        assertDbxConsumptionHoldBinding(
          binding
        ),

      /ACCOUNT_MATCH/
    );
  }
);
