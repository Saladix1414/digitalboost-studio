import type {
  DbxRewardPoolPostingRecord,
  DbxRewardPoolRegistry,
} from "./types";

export function createDbxRewardPoolRegistry():
  DbxRewardPoolRegistry {
  return {
    records: [],
  };
}

export function registerDbxRewardPoolPosting(
  registry:
    DbxRewardPoolRegistry,

  record:
    DbxRewardPoolPostingRecord
): DbxRewardPoolRegistry {
  const sameIntent =
    registry.records.find(
      item =>
        item.intentId ===
        record.intentId
    );

  if (sameIntent) {
    if (
      sameIntent.transactionId ===
        record.transactionId &&
      sameIntent.idempotencyKey ===
        record.idempotencyKey
    ) {
      return registry;
    }

    throw new Error(
      "DBX_REWARD_POOL_INTENT_CONFLICT"
    );
  }

  if (
    registry.records.some(
      item =>
        item.transactionId ===
        record.transactionId
    )
  ) {
    throw new Error(
      "DBX_REWARD_POOL_TRANSACTION_DUPLICATE"
    );
  }

  return {
    records: [
      ...registry.records,
      record,
    ],
  };
}
