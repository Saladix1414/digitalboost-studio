export type DbxSettlementPartyRole =
  | "BUYER"
  | "CREATOR"
  | "PLATFORM";

export type DbxSettlementAllocation = {
  readonly accountId:
    string;

  readonly role:
    Exclude<
      DbxSettlementPartyRole,
      "BUYER"
    >;

  readonly amountMinor:
    number;
};

export type DbxMarketplaceSettlementPlan = {
  readonly id:
    string;

  readonly idempotencyKey:
    string;

  readonly marketplaceOrderId:
    string;

  readonly holdId:
    string;

  readonly buyerAccountId:
    string;

  readonly totalAmountMinor:
    number;

  readonly allocations:
    readonly DbxSettlementAllocation[];

  readonly createdAt:
    string;

  readonly authoritative:
    false;
};

export type DbxMarketplaceSettlementResult = {
  readonly planId:
    string;

  readonly marketplaceOrderId:
    string;

  readonly transactionId:
    string;

  readonly status:
    "SETTLED";

  readonly settledAt:
    string;

  readonly systemOfRecord:
    "DBX_LEDGER";

  readonly governanceAuthority:
    false;
};

export type DbxMarketplaceSettlementRegistry = {
  readonly results:
    readonly DbxMarketplaceSettlementResult[];
};
