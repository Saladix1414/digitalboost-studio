import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionIntent,
} from "../../src/trading/dbx/consumption/intent";

test(
  "creates economic DBX consumption intent",
  () => {
    const intent =
      createDbxConsumptionIntent({
        id:
          "consumption-1",

        idempotencyKey:
          "consumption-key-1",

        userAccountId:
          "user-001",

        destinationAccountId:
          "platform-revenue",

        amountMinor:
          2_000_000,

        purpose:
          "AI_RUNTIME",

        serviceReference:
          "runtime-001",

        createdAt:
          "2026-10-02T16:00:00.000Z",
      });

    assert.equal(
      intent.amountMinor,
      2_000_000
    );

    assert.equal(
      intent.purpose,
      "AI_RUNTIME"
    );

    assert.equal(
      intent.authoritative,
      false
    );
  }
);

test(
  "rejects invalid consumption amount",
  () => {
    assert.throws(
      () =>
        createDbxConsumptionIntent({
          id:
            "consumption-2",

          idempotencyKey:
            "consumption-key-2",

          userAccountId:
            "user-001",

          destinationAccountId:
            "platform-revenue",

          amountMinor:
            0,

          purpose:
            "SERVICE",

          serviceReference:
            "service-001",

          createdAt:
            "2026-10-02T16:00:00.000Z",
        }),

      /DBX_CONSUMPTION_INVALID_AMOUNT/
    );
  }
);

test(
  "rejects self transfer consumption",
  () => {
    assert.throws(
      () =>
        createDbxConsumptionIntent({
          id:
            "consumption-3",

          idempotencyKey:
            "consumption-key-3",

          userAccountId:
            "user-001",

          destinationAccountId:
            "user-001",

          amountMinor:
            1_000_000,

          purpose:
            "SERVICE",

          serviceReference:
            "service-002",

          createdAt:
            "2026-10-02T16:00:00.000Z",
        }),

      /DBX_CONSUMPTION_SELF_TRANSFER/
    );
  }
);
