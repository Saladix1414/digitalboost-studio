export type DbxReconciliationIssueCode =
  | "LEDGER_TRANSACTION_UNBALANCED"
  | "LEDGER_DUPLICATE_TRANSACTION_ID"
  | "LEDGER_GLOBAL_IMBALANCE"
  | "HOLD_ACCOUNT_UNKNOWN"
  | "HOLD_ACTIVE_OVER_BALANCE"
  | "HOLD_CAPTURE_TRANSACTION_MISSING"
  | "HOLD_CAPTURE_TRANSACTION_MISMATCH"
  | "CONSUMPTION_TRANSACTION_MISSING"
  | "SETTLEMENT_TRANSACTION_MISSING"
  | "REWARD_POOL_TRANSACTION_MISSING";

export type DbxReconciliationSeverity =
  | "ERROR"
  | "WARNING";

export type DbxReconciliationIssue = {
  readonly code:
    DbxReconciliationIssueCode;

  readonly severity:
    DbxReconciliationSeverity;

  readonly reference:
    string;

  readonly message:
    string;

  readonly authoritative:
    false;
};

export type DbxReconciliationSection = {
  readonly name:
    | "LEDGER"
    | "HOLDS"
    | "CONSUMPTION"
    | "MARKETPLACE"
    | "REWARD_POOL";

  readonly checked:
    number;

  readonly issueCount:
    number;

  readonly healthy:
    boolean;

  readonly authoritative:
    false;
};

export type DbxEconomyReconciliationReport = {
  readonly id:
    string;

  readonly reconciledAt:
    string;

  readonly healthy:
    boolean;

  readonly sections:
    readonly DbxReconciliationSection[];

  readonly issues:
    readonly DbxReconciliationIssue[];

  readonly accountingSystemOfRecord:
    "DBX_LEDGER";

  readonly authoritative:
    false;
};
