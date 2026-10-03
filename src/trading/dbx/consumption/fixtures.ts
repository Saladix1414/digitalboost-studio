import {
  createDbxConsumptionIntent,
} from "./intent";

export const dbxAiRuntimeConsumptionFixture =
  createDbxConsumptionIntent({
    id:
      "consumption-ai-runtime-001",

    idempotencyKey:
      "consumption-ai-runtime-key-001",

    userAccountId:
      "user-001",

    destinationAccountId:
      "platform-revenue",

    amountMinor:
      2_500_000,

    purpose:
      "AI_RUNTIME",

    serviceReference:
      "ai-runtime-session-fixture",

    createdAt:
      "2026-10-02T16:00:00.000Z",
  });

export const dbxHostingConsumptionFixture =
  createDbxConsumptionIntent({
    id:
      "consumption-hosting-001",

    idempotencyKey:
      "consumption-hosting-key-001",

    userAccountId:
      "user-001",

    destinationAccountId:
      "platform-revenue",

    amountMinor:
      1_500_000,

    purpose:
      "HOSTING",

    serviceReference:
      "hosting-fixture",

    createdAt:
      "2026-10-02T16:05:00.000Z",
  });
