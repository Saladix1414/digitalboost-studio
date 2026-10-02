export const dbxFiatPaymentEvidenceFixture = {
  id:
    "dbx-payment-evidence-fiat-001",

  providerRef:
    "provider:fixture",

  settlementRef:
    "settlement:fiat:001",

  externalAmountMinor:
    10_00,

  observedAt:
    "2026-10-02T12:07:00.000Z",
};

export const dbxUsdtPaymentEvidenceFixture = {
  id:
    "dbx-payment-evidence-usdt-001",

  chainRef:
    "chain:polygon",

  tokenRef:
    "token:usdt",

  recipientRef:
    "wallet:digitalboost:treasury",

  txHash:
    "0xfixture-usdt-payment-001",

  blockRef:
    "block:polygon:payment-001",

  externalAmountMinor:
    10_000_000,

  observedAt:
    "2026-10-02T12:07:00.000Z",
};
