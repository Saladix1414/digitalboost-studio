import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxConsumptionIntent,
} from "../../src/trading/dbx/consumption/intent";

const purposes = [
  "AI_RUNTIME",
  "TOOL_USAGE",
  "BOT_RUNTIME",
  "HOSTING",
  "SERVICE",
] as const;

test(
  "supported DigitalBoost economic consumption purposes remain explicit",
  () => {
    for (
      const purpose
      of purposes
    ) {
      const intent =
        createDbxConsumptionIntent({
          id:
            `intent-${purpose}`,

          idempotencyKey:
            `key-${purpose}`,

          userAccountId:
            "user-001",

          destinationAccountId:
            "platform-revenue",

          amountMinor:
            1_000_000,

          purpose,

          serviceReference:
            `service-${purpose}`,

          createdAt:
            "2026-10-02T16:10:00.000Z",
        });

      assert.equal(
        intent.purpose,
        purpose
      );
    }
  }
);
