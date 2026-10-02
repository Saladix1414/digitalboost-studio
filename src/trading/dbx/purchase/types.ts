export type DbxPaymentRail =
  | "FIAT"
  | "USDT";

export type DbxExternalCurrency =
  | "USD"
  | "ARS"
  | "USDT";

export type DbxPurchaseStatus =
  | "CREATED"
  | "QUOTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_DETECTED"
  | "PAYMENT_VERIFIED"
  | "ISSUANCE_AUTHORIZED"
  | "LEDGER_POSTED"
  | "COMPLETED"
  | "EXPIRED"
  | "FAILED"
  | "REJECTED"
  | "REFUNDED"
  | "REVERSED";

export type DbxQuote = {
  readonly id:
    string;

  readonly rail:
    DbxPaymentRail;

  readonly externalCurrency:
    DbxExternalCurrency;

  readonly externalAmountMinor:
    number;

  readonly dbxAmountMinor:
    number;

  readonly rateNumerator:
    number;

  readonly rateDenominator:
    number;

  readonly createdAt:
    string;

  readonly expiresAt:
    string;

  readonly policyVersion:
    string;

  readonly authoritative:
    false;
};

export type DbxPurchaseIntent = {
  readonly id:
    string;

  readonly userRef:
    string;

  readonly accountRef:
    string;

  readonly rail:
    DbxPaymentRail;

  readonly requestedDbxMinor:
    number;

  readonly quoteId:
    string | null;

  readonly idempotencyKey:
    string;

  readonly status:
    DbxPurchaseStatus;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;

  readonly authoritative:
    false;
};

export type DbxPurchaseStore = {
  readonly intents:
    readonly DbxPurchaseIntent[];

  readonly quotes:
    readonly DbxQuote[];
};
