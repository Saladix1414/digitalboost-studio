import type {
  DbxConsumptionIntent,
} from "./types";

export type DbxConsumptionLedgerTransaction = {
  readonly id: string;

  readonly idempotencyKey: string;

  readonly kind:
    "FEE";

  readonly reference: string;

  readonly createdAt: string;

  readonly entries: readonly {
    readonly id: string;

    readonly accountId: string;

    readonly side:
      "DEBIT" | "CREDIT";

    readonly amountMinor: number;
  }[];
};

export function buildDbxConsumptionLedgerTransaction(
  intent:
    DbxConsumptionIntent
): DbxConsumptionLedgerTransaction {
  const transactionId =
    `dbx-consumption:${intent.id}`;

  return {
    id:
      transactionId,

    idempotencyKey:
      `dbx-ledger-consumption:${intent.idempotencyKey}`,

    kind:
      "FEE",

    reference: [
      "dbx-consumption",
      `intent=${intent.id}`,
      `purpose=${intent.purpose}`,
      `service=${intent.serviceReference}`,
    ].join("|"),

    createdAt:
      intent.createdAt,

    entries: [
      {
        id:
          `${transactionId}:user-debit`,

        accountId:
          intent.userAccountId,

        side:
          "DEBIT",

        amountMinor:
          intent.amountMinor,
      },

      {
        id:
          `${transactionId}:service-credit`,

        accountId:
          intent.destinationAccountId,

        side:
          "CREDIT",

        amountMinor:
          intent.amountMinor,
      },
    ],
  };
}
