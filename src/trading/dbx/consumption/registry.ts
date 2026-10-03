import type {
  DbxConsumptionPostingRecord,
  DbxConsumptionRegistry,
} from "./types";

export function createDbxConsumptionRegistry():
  DbxConsumptionRegistry {
  return {
    records: [],
  };
}

export function registerDbxConsumptionPosting(
  registry:
    DbxConsumptionRegistry,

  record:
    DbxConsumptionPostingRecord
): DbxConsumptionRegistry {
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
      "DBX_CONSUMPTION_INTENT_CONFLICT"
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
      "DBX_CONSUMPTION_TRANSACTION_DUPLICATE"
    );
  }

  return {
    records: [
      ...registry.records,
      record,
    ],
  };
}
