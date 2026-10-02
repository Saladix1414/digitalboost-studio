export const DBX_MINOR_SCALE =
  1_000_000;

export type DbxCurrency =
  "DBX";

export type DbxLedgerAccountKind =
  | "SYSTEM_ISSUANCE"
  | "PLATFORM_TREASURY"
  | "USER"
  | "CREATOR"
  | "REWARD_POOL"
  | "FEE_POOL"
  | "ESCROW"
  | "MARKETPLACE_CLEARING"
  | "PLATFORM_REVENUE";

export type DbxLedgerAccountStatus =
  | "ACTIVE"
  | "FROZEN"
  | "CLOSED";

export type DbxLedgerEntrySide =
  | "DEBIT"
  | "CREDIT";

export type DbxLedgerTransactionKind =
  | "ISSUANCE"
  | "TRANSFER"
  | "REWARD"
  | "MARKETPLACE"
  | "FEE"
  | "REVERSAL";

export type DbxLedgerAccount = {
  readonly id:
    string;

  readonly kind:
    DbxLedgerAccountKind;

  readonly ownerRef:
    string;

  readonly currency:
    DbxCurrency;

  readonly status:
    DbxLedgerAccountStatus;

  readonly createdAt:
    string;

  readonly systemOfRecord:
    "DBX_LEDGER";

  readonly governanceAuthority:
    false;
};

export type DbxLedgerEntry = {
  readonly id:
    string;

  readonly accountId:
    string;

  readonly side:
    DbxLedgerEntrySide;

  readonly amountMinor:
    number;
};

export type DbxLedgerTransactionDraft = {
  readonly id:
    string;

  readonly idempotencyKey:
    string;

  readonly kind:
    DbxLedgerTransactionKind;

  readonly reference:
    string;

  readonly entries:
    readonly DbxLedgerEntry[];

  readonly createdAt:
    string;

  readonly reversalOf:
    string | null;

  readonly metadata:
    Readonly<
      Record<
        string,
        string
      >
    >;
};

export type DbxLedgerTransaction = {
  readonly id:
    string;

  readonly idempotencyKey:
    string;

  readonly kind:
    DbxLedgerTransactionKind;

  readonly reference:
    string;

  readonly entries:
    readonly DbxLedgerEntry[];

  readonly createdAt:
    string;

  readonly reversalOf:
    string | null;

  readonly metadata:
    Readonly<
      Record<
        string,
        string
      >
    >;

  readonly status:
    "POSTED";

  readonly immutable:
    true;

  readonly systemOfRecord:
    "DBX_LEDGER";

  readonly governanceAuthority:
    false;
};

export type DbxLedger = {
  readonly id:
    string;

  readonly currency:
    DbxCurrency;

  readonly accounts:
    readonly DbxLedgerAccount[];

  readonly transactions:
    readonly DbxLedgerTransaction[];

  readonly systemOfRecord:
    "DBX_LEDGER";

  readonly governanceAuthority:
    false;
};

export type DbxLedgerValidationIssueCode =
  | "EMPTY_TRANSACTION_ID"
  | "EMPTY_IDEMPOTENCY_KEY"
  | "EMPTY_REFERENCE"
  | "INSUFFICIENT_ENTRIES"
  | "DUPLICATE_ENTRY_ID"
  | "UNKNOWN_ACCOUNT"
  | "ACCOUNT_NOT_ACTIVE"
  | "INVALID_AMOUNT"
  | "UNBALANCED_TRANSACTION";

export type DbxLedgerValidationIssue = {
  readonly code:
    DbxLedgerValidationIssueCode;

  readonly message:
    string;
};

export type DbxLedgerValidationResult = {
  readonly valid:
    boolean;

  readonly totalDebitsMinor:
    number;

  readonly totalCreditsMinor:
    number;

  readonly issues:
    readonly DbxLedgerValidationIssue[];
};

export type DbxLedgerAccountBalance = {
  readonly accountId:
    string;

  readonly debitMinor:
    number;

  readonly creditMinor:
    number;

  readonly balanceMinor:
    number;

  readonly currency:
    "DBX";

  readonly derivedFromLedger:
    true;

  readonly governanceAuthority:
    false;
};
