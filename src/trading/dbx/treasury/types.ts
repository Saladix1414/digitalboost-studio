export type DbxEconomicAllocationRole =
  | "CREATOR"
  | "PLATFORM_REVENUE"
  | "TREASURY"
  | "INFRASTRUCTURE"
  | "REWARD_POOL";

export type DbxEconomicAllocation = {
  readonly accountId:
    string;

  readonly role:
    DbxEconomicAllocationRole;

  readonly amountMinor:
    number;
};

export type DbxFeePolicyAllocation = {
  readonly role:
    DbxEconomicAllocationRole;

  readonly basisPoints:
    number;

  readonly accountId:
    string;
};

export type DbxFeePolicy = {
  readonly id:
    string;

  readonly version:
    string;

  readonly enabled:
    boolean;

  readonly allocations:
    readonly DbxFeePolicyAllocation[];

  readonly authoritative:
    false;
};

export type DbxTreasuryAllocationPlan = {
  readonly id:
    string;

  readonly policyId:
    string;

  readonly policyVersion:
    string;

  readonly settlementReference:
    string;

  readonly totalAmountMinor:
    number;

  readonly allocations:
    readonly DbxEconomicAllocation[];

  readonly createdAt:
    string;

  readonly authoritative:
    false;
};
