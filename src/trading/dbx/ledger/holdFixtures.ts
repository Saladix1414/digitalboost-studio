export const dbxMarketplaceHoldFixture = {
  id:
    "dbx-hold-marketplace-001",

  idempotencyKey:
    "idem-dbx-hold-marketplace-001",

  accountId:
    "dbx-creator-001",

  amountMinor:
    10_000_000,

  purpose:
    "MARKETPLACE" as const,

  reference:
    "marketplace-order:001",

  createdAt:
    "2026-10-02T11:00:00.000Z",

  expiresAt:
    "2026-10-02T11:15:00.000Z",
};

export const dbxBotRuntimeHoldFixture = {
  id:
    "dbx-hold-bot-001",

  idempotencyKey:
    "idem-dbx-hold-bot-001",

  accountId:
    "dbx-creator-001",

  amountMinor:
    5_000_000,

  purpose:
    "BOT_RUNTIME" as const,

  reference:
    "bot-runtime:001",

  createdAt:
    "2026-10-02T11:01:00.000Z",

  expiresAt:
    "2026-10-02T11:31:00.000Z",
};
