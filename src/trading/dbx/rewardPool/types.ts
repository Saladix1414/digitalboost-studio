export type DbxEconomicRewardPurpose =
  | "CREATOR_INCENTIVE"
  | "MARKETPLACE_INCENTIVE"
  | "PLATFORM_PROGRAM"
  | "PROMOTION"
  | "OTHER";

export type DbxRewardPoolFundingIntent = {
  readonly id: string;
  readonly idempotencyKey: string;

  readonly sourceAccountId: string;
  readonly rewardPoolAccountId: string;

  readonly amountMinor: number;

  readonly reference: string;
  readonly createdAt: string;

  readonly authoritative: false;
};

export type DbxRewardDistributionIntent = {
  readonly id: string;
  readonly idempotencyKey: string;

  readonly rewardPoolAccountId: string;
  readonly recipientAccountId: string;

  readonly amountMinor: number;

  readonly purpose: DbxEconomicRewardPurpose;
  readonly reference: string;

  readonly createdAt: string;

  readonly authoritative: false;
};

export type DbxRewardPoolPostingStatus =
  | "FUNDED"
  | "DISTRIBUTED";

export type DbxRewardPoolPostingRecord = {
  readonly id: string;

  readonly intentId: string;
  readonly idempotencyKey: string;

  readonly transactionId: string;

  readonly status: DbxRewardPoolPostingStatus;

  readonly amountMinor: number;

  readonly sourceAccountId: string;
  readonly destinationAccountId: string;

  readonly postedAt: string;

  readonly systemOfRecord: "DBX_LEDGER";
  readonly governanceAuthority: false;
};

export type DbxRewardPoolRegistry = {
  readonly records:
    readonly DbxRewardPoolPostingRecord[];
};
