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

export type DbxPaymentEvidenceKind =
  | "FIAT"
  | "USDT";

export type DbxFiatPaymentEvidence = {
  readonly id:
    string;

  readonly kind:
    "FIAT";

  readonly purchaseIntentId:
    string;

  readonly quoteId:
    string;

  readonly providerRef:
    string;

  readonly settlementRef:
    string;

  readonly externalCurrency:
    "USD" | "ARS";

  readonly externalAmountMinor:
    number;

  readonly observedAt:
    string;

  readonly immutable:
    true;

  readonly authoritative:
    false;
};

export type DbxUsdtPaymentEvidence = {
  readonly id:
    string;

  readonly kind:
    "USDT";

  readonly purchaseIntentId:
    string;

  readonly quoteId:
    string;

  readonly chainRef:
    string;

  readonly tokenRef:
    string;

  readonly recipientRef:
    string;

  readonly txHash:
    string;

  readonly blockRef:
    string;

  readonly externalAmountMinor:
    number;

  readonly observedAt:
    string;

  readonly immutable:
    true;

  readonly authoritative:
    false;
};

export type DbxPaymentEvidence =
  | DbxFiatPaymentEvidence
  | DbxUsdtPaymentEvidence;

export type DbxPaymentEvidenceStore = {
  readonly evidence:
    readonly DbxPaymentEvidence[];
};

export type DbxPaymentVerificationStatus =
  | "VERIFIED"
  | "REJECTED";

export type DbxPaymentVerificationCheckCode =
  | "PURCHASE_BINDING"
  | "QUOTE_BINDING"
  | "RAIL_BINDING"
  | "AMOUNT_BINDING"
  | "CURRENCY_BINDING"
  | "PROVIDER_BINDING"
  | "SETTLEMENT_REFERENCE"
  | "CHAIN_BINDING"
  | "TOKEN_BINDING"
  | "RECIPIENT_BINDING"
  | "TRANSACTION_HASH"
  | "BLOCK_REFERENCE"
  | "CONFIRMATION_POLICY";

export type DbxPaymentVerificationCheck = {
  readonly code:
    DbxPaymentVerificationCheckCode;

  readonly passed:
    boolean;

  readonly message:
    string;

  readonly authoritative:
    false;
};

export type DbxFiatVerificationPolicy = {
  readonly id:
    string;

  readonly allowedCurrencies:
    readonly ("USD" | "ARS")[];

  readonly allowedProviderRefs:
    readonly string[];

  readonly requireSettlementReference:
    true;

  readonly version:
    string;

  readonly authoritative:
    false;
};

export type DbxUsdtVerificationPolicy = {
  readonly id:
    string;

  readonly chainRef:
    string;

  readonly tokenRef:
    string;

  readonly recipientRef:
    string;

  readonly minimumConfirmations:
    number;

  readonly version:
    string;

  readonly authoritative:
    false;
};

export type DbxPaymentVerification = {
  readonly id:
    string;

  readonly evidenceId:
    string;

  readonly purchaseIntentId:
    string;

  readonly quoteId:
    string;

  readonly status:
    DbxPaymentVerificationStatus;

  readonly policyId:
    string;

  readonly policyVersion:
    string;

  readonly checks:
    readonly DbxPaymentVerificationCheck[];

  readonly verifiedAt:
    string;

  readonly authoritative:
    false;
};

export type DbxIssuanceAuthorizationStatus =
  | "AUTHORIZED"
  | "REJECTED";

export type DbxIssuanceAuthorizationCheckCode =
  | "PURCHASE_STATUS"
  | "PURCHASE_BINDING"
  | "QUOTE_BINDING"
  | "VERIFICATION_BINDING"
  | "VERIFICATION_STATUS"
  | "ACCOUNT_BINDING"
  | "DBX_AMOUNT_BINDING"
  | "POLICY_LIMIT"
  | "POLICY_ENABLED";

export type DbxIssuanceAuthorizationCheck = {
  readonly code:
    DbxIssuanceAuthorizationCheckCode;

  readonly passed:
    boolean;

  readonly message:
    string;

  readonly authoritative:
    false;
};

export type DbxIssuancePolicy = {
  readonly id:
    string;

  readonly version:
    string;

  readonly enabled:
    boolean;

  readonly minimumDbxMinor:
    number;

  readonly maximumDbxMinor:
    number;

  readonly issuanceAccountRef:
    string;

  readonly authoritative:
    false;
};

export type DbxIssuanceAuthorization = {
  readonly id:
    string;

  readonly idempotencyKey:
    string;

  readonly purchaseIntentId:
    string;

  readonly quoteId:
    string;

  readonly verificationId:
    string;

  readonly destinationAccountRef:
    string;

  readonly issuanceAccountRef:
    string;

  readonly dbxAmountMinor:
    number;

  readonly policyId:
    string;

  readonly policyVersion:
    string;

  readonly status:
    DbxIssuanceAuthorizationStatus;

  readonly checks:
    readonly DbxIssuanceAuthorizationCheck[];

  readonly authorizedAt:
    string;

  readonly ledgerPosted:
    false;

  readonly authoritative:
    false;
};

export type DbxIssuanceAuthorizationStore = {
  readonly authorizations:
    readonly DbxIssuanceAuthorization[];
};

export type DbxIssuancePostingStatus =
  | "POSTED";

export type DbxIssuancePostingRecord = {
  readonly id:
    string;

  readonly authorizationId:
    string;

  readonly purchaseIntentId:
    string;

  readonly quoteId:
    string;

  readonly verificationId:
    string;

  readonly transactionId:
    string;

  readonly ledgerIdempotencyKey:
    string;

  readonly issuanceAccountRef:
    string;

  readonly destinationAccountRef:
    string;

  readonly dbxAmountMinor:
    number;

  readonly status:
    DbxIssuancePostingStatus;

  readonly postedAt:
    string;

  readonly systemOfRecord:
    "DBX_LEDGER";

  readonly governanceAuthority:
    false;
};

export type DbxIssuancePostingRegistry = {
  readonly records:
    readonly DbxIssuancePostingRecord[];
};
