import type {
  DbxLedger,
  DbxLedgerAccount,
  DbxLedgerTransaction,
  DbxLedgerTransactionDraft,
} from "./types";

import {
  validateDbxLedgerTransaction,
} from "./validation";

export function createDbxLedger(
  id:
    string,
  accounts:
    readonly DbxLedgerAccount[]
): DbxLedger {
  const accountIds =
    new Set<string>();

  for (
    const account of
    accounts
  ) {
    if (
      accountIds.has(
        account.id
      )
    ) {
      throw new Error(
        "DBX_LEDGER_DUPLICATE_ACCOUNT"
      );
    }

    accountIds.add(
      account.id
    );
  }

  return {
    id,

    currency:
      "DBX",

    accounts:
      [...accounts],

    transactions:
      [],

    systemOfRecord:
      "DBX_LEDGER",

    governanceAuthority:
      false,
  };
}

function transactionFingerprint(
  transaction:
    Pick<
      DbxLedgerTransactionDraft,
      | "id"
      | "kind"
      | "reference"
      | "entries"
      | "createdAt"
      | "reversalOf"
      | "metadata"
    >
): string {
  return JSON.stringify({
    id:
      transaction.id,

    kind:
      transaction.kind,

    reference:
      transaction.reference,

    entries:
      transaction.entries,

    createdAt:
      transaction.createdAt,

    reversalOf:
      transaction.reversalOf,

    metadata:
      transaction.metadata,
  });
}

export function postDbxLedgerTransaction(
  ledger:
    DbxLedger,
  draft:
    DbxLedgerTransactionDraft
): {
  readonly ledger:
    DbxLedger;

  readonly transaction:
    DbxLedgerTransaction;

  readonly idempotentReplay:
    boolean;
} {
  const existingByKey =
    ledger.transactions.find(
      (transaction) =>
        transaction
          .idempotencyKey ===
        draft.idempotencyKey
    );

  if (existingByKey) {
    const existingFingerprint =
      transactionFingerprint(
        existingByKey
      );

    const incomingFingerprint =
      transactionFingerprint(
        draft
      );

    if (
      existingFingerprint !==
        incomingFingerprint
    ) {
      throw new Error(
        "DBX_LEDGER_IDEMPOTENCY_CONFLICT"
      );
    }

    return {
      ledger,

      transaction:
        existingByKey,

      idempotentReplay:
        true,
    };
  }

  const duplicateTransactionId =
    ledger.transactions.some(
      (transaction) =>
        transaction.id ===
        draft.id
    );

  if (
    duplicateTransactionId
  ) {
    throw new Error(
      "DBX_LEDGER_DUPLICATE_TRANSACTION_ID"
    );
  }

  if (
    draft.reversalOf
  ) {
    const original =
      ledger.transactions.find(
        (transaction) =>
          transaction.id ===
          draft.reversalOf
      );

    if (!original) {
      throw new Error(
        "DBX_LEDGER_REVERSAL_ORIGINAL_NOT_FOUND"
      );
    }

    const alreadyReversed =
      ledger.transactions.some(
        (transaction) =>
          transaction.reversalOf ===
          draft.reversalOf
      );

    if (
      alreadyReversed
    ) {
      throw new Error(
        "DBX_LEDGER_TRANSACTION_ALREADY_REVERSED"
      );
    }
  }

  const validation =
    validateDbxLedgerTransaction(
      ledger,
      draft
    );

  if (
    !validation.valid
  ) {
    throw new Error(
      `DBX_LEDGER_TRANSACTION_INVALID:${validation.issues
        .map(
          (issue) =>
            issue.code
        )
        .join(",")}`
    );
  }

  const posted:
    DbxLedgerTransaction = {
      ...draft,

      entries:
        draft.entries.map(
          (entry) => ({
            ...entry,
          })
        ),

      metadata: {
        ...draft.metadata,
      },

      status:
        "POSTED",

      immutable:
        true,

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    };

  return {
    ledger: {
      ...ledger,

      transactions: [
        ...ledger.transactions,
        posted,
      ],
    },

    transaction:
      posted,

    idempotentReplay:
      false,
  };
}
