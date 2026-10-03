export type DbxConsumptionPurpose =
  | "AI_RUNTIME"
  | "TOOL_USAGE"
  | "BOT_RUNTIME"
  | "HOSTING"
  | "SERVICE";

export type DbxConsumptionStatus =
  | "CREATED"
  | "POSTED";

export type DbxConsumptionIntent = {
  readonly id: string;
  readonly idempotencyKey: string;

  readonly userAccountId: string;
  readonly destinationAccountId: string;

  readonly amountMinor: number;

  readonly purpose:
    DbxConsumptionPurpose;

  readonly serviceReference: string;

  readonly createdAt: string;

  readonly authoritative: false;
};

export type DbxConsumptionPostingRecord = {
  readonly id: string;

  readonly intentId: string;
  readonly idempotencyKey: string;

  readonly userAccountId: string;
  readonly destinationAccountId: string;

  readonly amountMinor: number;

  readonly purpose:
    DbxConsumptionPurpose;

  readonly transactionId: string;

  readonly status: "POSTED";

  readonly postedAt: string;

  readonly systemOfRecord:
    "DBX_LEDGER";

  readonly governanceAuthority:
    false;
};

export type DbxConsumptionRegistry = {
  readonly records:
    readonly DbxConsumptionPostingRecord[];
};
