import type {
  DbxIssuanceAuthorization,
} from "./types";

export type DbxAuthorizedIssuanceLedgerTransaction = {
  readonly id:
    string;

  readonly idempotencyKey:
    string;

  readonly kind:
    "ISSUANCE";

  readonly reference:
    string;

  readonly createdAt:
    string;

  readonly entries:
    readonly [
      {
        readonly id:
          string;

        readonly accountId:
          string;

        readonly side:
          "DEBIT";

        readonly amountMinor:
          number;
      },
      {
        readonly id:
          string;

        readonly accountId:
          string;

        readonly side:
          "CREDIT";

        readonly amountMinor:
          number;
      },
    ];
};

export function buildAuthorizedDbxIssuanceLedgerTransaction(
  authorization:
    DbxIssuanceAuthorization,
  postedAt:
    string
): DbxAuthorizedIssuanceLedgerTransaction {
  if (
    authorization.status !==
      "AUTHORIZED"
  ) {
    throw new Error(
      "DBX_ISSUANCE_NOT_AUTHORIZED"
    );
  }

  if (
    authorization.ledgerPosted !==
      false
  ) {
    throw new Error(
      "DBX_ISSUANCE_ALREADY_MARKED_POSTED"
    );
  }

  if (
    !Number.isSafeInteger(
      authorization.dbxAmountMinor
    ) ||
    authorization.dbxAmountMinor <= 0
  ) {
    throw new Error(
      "DBX_ISSUANCE_INVALID_AMOUNT"
    );
  }

  const transactionId =
    `dbx-issuance-txn:${authorization.id}`;

  const idempotencyKey =
    `dbx-ledger-issuance:${authorization.id}`;

  const reference = [
    `purchase=${authorization.purchaseIntentId}`,
    `quote=${authorization.quoteId}`,
    `verification=${authorization.verificationId}`,
    `authorization=${authorization.id}`,
  ].join("|");

  return {
    id:
      transactionId,

    idempotencyKey,

    kind:
      "ISSUANCE",

    reference,

    createdAt:
      postedAt,

    entries: [
      {
        id:
          `${transactionId}:debit`,

        accountId:
          authorization.issuanceAccountRef,

        side:
          "DEBIT",

        amountMinor:
          authorization.dbxAmountMinor,
      },

      {
        id:
          `${transactionId}:credit`,

        accountId:
          authorization.destinationAccountRef,

        side:
          "CREDIT",

        amountMinor:
          authorization.dbxAmountMinor,
      },
    ],
  };
}
