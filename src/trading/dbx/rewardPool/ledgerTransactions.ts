import type {
  DbxRewardDistributionIntent,
  DbxRewardPoolFundingIntent,
} from "./types";

type DbxRewardPoolLedgerTransaction = {
  readonly id: string;
  readonly idempotencyKey: string;

  readonly kind: "REWARD";

  readonly reference: string;
  readonly createdAt: string;

  readonly entries: readonly {
    readonly id: string;
    readonly accountId: string;
    readonly side: "DEBIT" | "CREDIT";
    readonly amountMinor: number;
  }[];
};

export function buildDbxRewardPoolFundingTransaction(
  intent:
    DbxRewardPoolFundingIntent
): DbxRewardPoolLedgerTransaction {
  const transactionId =
    `dbx-reward-pool-funding:${intent.id}`;

  return {
    id: transactionId,

    idempotencyKey:
      `dbx-ledger-reward-pool-funding:${intent.idempotencyKey}`,

    kind: "REWARD",

    reference: [
      "reward-pool-funding",
      `intent=${intent.id}`,
      `ref=${intent.reference}`,
    ].join("|"),

    createdAt:
      intent.createdAt,

    entries: [
      {
        id:
          `${transactionId}:source-debit`,

        accountId:
          intent.sourceAccountId,

        side:
          "DEBIT",

        amountMinor:
          intent.amountMinor,
      },

      {
        id:
          `${transactionId}:pool-credit`,

        accountId:
          intent.rewardPoolAccountId,

        side:
          "CREDIT",

        amountMinor:
          intent.amountMinor,
      },
    ],
  };
}

export function buildDbxRewardPoolDistributionTransaction(
  intent:
    DbxRewardDistributionIntent
): DbxRewardPoolLedgerTransaction {
  const transactionId =
    `dbx-reward-pool-distribution:${intent.id}`;

  return {
    id: transactionId,

    idempotencyKey:
      `dbx-ledger-reward-pool-distribution:${intent.idempotencyKey}`,

    kind: "REWARD",

    reference: [
      "reward-pool-distribution",
      `intent=${intent.id}`,
      `purpose=${intent.purpose}`,
      `ref=${intent.reference}`,
    ].join("|"),

    createdAt:
      intent.createdAt,

    entries: [
      {
        id:
          `${transactionId}:pool-debit`,

        accountId:
          intent.rewardPoolAccountId,

        side:
          "DEBIT",

        amountMinor:
          intent.amountMinor,
      },

      {
        id:
          `${transactionId}:recipient-credit`,

        accountId:
          intent.recipientAccountId,

        side:
          "CREDIT",

        amountMinor:
          intent.amountMinor,
      },
    ],
  };
}
