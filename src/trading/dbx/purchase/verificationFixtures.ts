import type {
  DbxFiatVerificationPolicy,
  DbxUsdtVerificationPolicy,
} from "./types";

export const dbxFiatVerificationPolicyFixture:
  DbxFiatVerificationPolicy = {
    id:
      "dbx-fiat-verification-policy-v1",

    allowedCurrencies: [
      "USD",
      "ARS",
    ],

    allowedProviderRefs: [
      "provider:fixture",
    ],

    requireSettlementReference:
      true,

    version:
      "1",

    authoritative:
      false,
  };

export const dbxUsdtVerificationPolicyFixture:
  DbxUsdtVerificationPolicy = {
    id:
      "dbx-usdt-verification-policy-v1",

    chainRef:
      "chain:polygon",

    tokenRef:
      "token:usdt",

    recipientRef:
      "wallet:digitalboost:treasury",

    minimumConfirmations:
      12,

    version:
      "1",

    authoritative:
      false,
  };
