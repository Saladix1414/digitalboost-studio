export const dbxFiatQuoteFixture = {
  id:
    "dbx-quote-fiat-001",

  rail:
    "FIAT" as const,

  externalCurrency:
    "USD" as const,

  externalAmountMinor:
    10_00,

  dbxAmountMinor:
    100_000_000,

  rateNumerator:
    10_00,

  rateDenominator:
    100_000_000,

  createdAt:
    "2026-10-02T12:00:00.000Z",

  expiresAt:
    "2026-10-02T12:15:00.000Z",

  policyVersion:
    "dbx-purchase-policy-v1",
};

export const dbxUsdtQuoteFixture = {
  id:
    "dbx-quote-usdt-001",

  rail:
    "USDT" as const,

  externalCurrency:
    "USDT" as const,

  externalAmountMinor:
    10_000_000,

  dbxAmountMinor:
    100_000_000,

  rateNumerator:
    10_000_000,

  rateDenominator:
    100_000_000,

  createdAt:
    "2026-10-02T12:00:00.000Z",

  expiresAt:
    "2026-10-02T12:15:00.000Z",

  policyVersion:
    "dbx-purchase-policy-v1",
};

export const dbxPurchaseIntentFixture = {
  id:
    "dbx-purchase-001",

  userRef:
    "user:001",

  accountRef:
    "dbx-user-001",

  rail:
    "FIAT" as const,

  requestedDbxMinor:
    100_000_000,

  idempotencyKey:
    "idem-dbx-purchase-001",

  createdAt:
    "2026-10-02T12:00:00.000Z",
};
