import {
  postDbxLedgerTransaction,
} from "../ledger/ledger";

import {
  buildDbxRewardPoolDistributionTransaction,
  buildDbxRewardPoolFundingTransaction,
} from "./ledgerTransactions";

import {
  registerDbxRewardPoolPosting,
} from "./registry";

import type {
  DbxRewardDistributionIntent,
  DbxRewardPoolFundingIntent,
  DbxRewardPoolPostingRecord,
  DbxRewardPoolRegistry,
} from "./types";

export function postDbxRewardPoolFunding<
  TLedger
>(
  ledger: TLedger,
  registry:
    DbxRewardPoolRegistry,
  intent:
    DbxRewardPoolFundingIntent
) {
  const transaction =
    buildDbxRewardPoolFundingTransaction(
      intent
    );

  const nextLedger =
    postDbxLedgerTransaction(
      ledger as any,
      transaction as any
    );

  const record:
    DbxRewardPoolPostingRecord = {
    id:
      `reward-pool-record:${intent.id}`,

    intentId:
      intent.id,

    idempotencyKey:
      intent.idempotencyKey,

    transactionId:
      transaction.id,

    status:
      "FUNDED",

    amountMinor:
      intent.amountMinor,

    sourceAccountId:
      intent.sourceAccountId,

    destinationAccountId:
      intent.rewardPoolAccountId,

    postedAt:
      intent.createdAt,

    systemOfRecord:
      "DBX_LEDGER",

    governanceAuthority:
      false,
  };

  return {
    ledger:
      nextLedger,

    registry:
      registerDbxRewardPoolPosting(
        registry,
        record
      ),

    record,
  };
}

export function postDbxRewardPoolDistribution<
  TLedger
>(
  ledger: TLedger,
  registry:
    DbxRewardPoolRegistry,
  intent:
    DbxRewardDistributionIntent
) {
  const transaction =
    buildDbxRewardPoolDistributionTransaction(
      intent
    );

  const nextLedger =
    postDbxLedgerTransaction(
      ledger as any,
      transaction as any
    );

  const record:
    DbxRewardPoolPostingRecord = {
    id:
      `reward-pool-record:${intent.id}`,

    intentId:
      intent.id,

    idempotencyKey:
      intent.idempotencyKey,

    transactionId:
      transaction.id,

    status:
      "DISTRIBUTED",

    amountMinor:
      intent.amountMinor,

    sourceAccountId:
      intent.rewardPoolAccountId,

    destinationAccountId:
      intent.recipientAccountId,

    postedAt:
      intent.createdAt,

    systemOfRecord:
      "DBX_LEDGER",

    governanceAuthority:
      false,
  };

  return {
    ledger:
      nextLedger,

    registry:
      registerDbxRewardPoolPosting(
        registry,
        record
      ),

    record,
  };
}
