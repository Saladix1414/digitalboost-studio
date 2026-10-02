import type {
  DbxLedgerTransaction,
  DbxLedgerTransactionDraft,
} from "./types";

export function createDbxReversalTransaction(
  original:
    DbxLedgerTransaction,
  input: {
    readonly id:
      string;

    readonly idempotencyKey:
      string;

    readonly reference:
      string;

    readonly createdAt:
      string;

    readonly reason:
      string;
  }
): DbxLedgerTransactionDraft {
  return {
    id:
      input.id,

    idempotencyKey:
      input.idempotencyKey,

    kind:
      "REVERSAL",

    reference:
      input.reference,

    entries:
      original.entries.map(
        (
          entry,
          index
        ) => ({
          id:
            `${input.id}:entry:${index + 1}`,

          accountId:
            entry.accountId,

          side:
            entry.side ===
              "DEBIT"
              ? "CREDIT"
              : "DEBIT",

          amountMinor:
            entry.amountMinor,
        })
      ),

    createdAt:
      input.createdAt,

    reversalOf:
      original.id,

    metadata: {
      reason:
        input.reason,

      originalTransactionId:
        original.id,
    },
  };
}
