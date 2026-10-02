import type {
  DbxMarketplaceSettlementPlan,
} from "./types";

export type DbxMarketplaceSettlementLedgerTransaction = {
  readonly id:
    string;

  readonly idempotencyKey:
    string;

  readonly kind:
    "MARKETPLACE";

  readonly reference:
    string;

  readonly createdAt:
    string;

  readonly entries:
    readonly {
      readonly id:
        string;

      readonly accountId:
        string;

      readonly side:
        "DEBIT" | "CREDIT";

      readonly amountMinor:
        number;
    }[];
};

export function buildDbxMarketplaceSettlementLedgerTransaction(
  plan:
    DbxMarketplaceSettlementPlan,
  settledAt:
    string
): DbxMarketplaceSettlementLedgerTransaction {
  const transactionId =
    `dbx-marketplace-settlement:${plan.id}`;

  const debit = {
    id:
      `${transactionId}:buyer-debit`,

    accountId:
      plan.buyerAccountId,

    side:
      "DEBIT" as const,

    amountMinor:
      plan.totalAmountMinor,
  };

  const credits =
    plan.allocations.map(
      (
        allocation,
        index
      ) => ({
        id:
          `${transactionId}:credit:${index}`,

        accountId:
          allocation.accountId,

        side:
          "CREDIT" as const,

        amountMinor:
          allocation.amountMinor,
      })
    );

  return {
    id:
      transactionId,

    idempotencyKey:
      `dbx-marketplace-settlement:${plan.id}`,

    kind:
      "MARKETPLACE",

    reference: [
      `order=${plan.marketplaceOrderId}`,
      `hold=${plan.holdId}`,
      `plan=${plan.id}`,
    ].join("|"),

    createdAt:
      settledAt,

    entries: [
      debit,
      ...credits,
    ],
  };
}
