import type {
  DbxIssuancePostingRecord,
  DbxIssuancePostingRegistry,
} from "./types";

export function createDbxIssuancePostingRegistry():
  DbxIssuancePostingRegistry {
  return {
    records:
      [],
  };
}

export function assertDbxIssuanceNotPreviouslyPosted(
  registry:
    DbxIssuancePostingRegistry,
  authorizationId:
    string,
  purchaseIntentId:
    string
) {
  if (
    registry.records.some(
      (record) =>
        record.authorizationId ===
        authorizationId
    )
  ) {
    throw new Error(
      "DBX_ISSUANCE_AUTHORIZATION_ALREADY_POSTED"
    );
  }

  if (
    registry.records.some(
      (record) =>
        record.purchaseIntentId ===
        purchaseIntentId
    )
  ) {
    throw new Error(
      "DBX_ISSUANCE_PURCHASE_ALREADY_POSTED"
    );
  }
}

export function addDbxIssuancePostingRecord(
  registry:
    DbxIssuancePostingRegistry,
  record:
    DbxIssuancePostingRecord
): DbxIssuancePostingRegistry {
  assertDbxIssuanceNotPreviouslyPosted(
    registry,
    record.authorizationId,
    record.purchaseIntentId
  );

  if (
    registry.records.some(
      (candidate) =>
        candidate.id ===
        record.id
    )
  ) {
    throw new Error(
      "DBX_ISSUANCE_POSTING_DUPLICATE_ID"
    );
  }

  if (
    registry.records.some(
      (candidate) =>
        candidate.transactionId ===
        record.transactionId
    )
  ) {
    throw new Error(
      "DBX_ISSUANCE_TRANSACTION_ALREADY_REGISTERED"
    );
  }

  return {
    records: [
      ...registry.records,
      record,
    ],
  };
}
