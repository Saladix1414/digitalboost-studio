import type {
  DbxIssuanceAuthorization,
  DbxIssuanceAuthorizationStore,
} from "./types";

export function createDbxIssuanceAuthorizationStore():
  DbxIssuanceAuthorizationStore {
  return {
    authorizations:
      [],
  };
}

function fingerprint(
  authorization:
    DbxIssuanceAuthorization
): string {
  return JSON.stringify({
    purchaseIntentId:
      authorization.purchaseIntentId,

    quoteId:
      authorization.quoteId,

    verificationId:
      authorization.verificationId,

    destinationAccountRef:
      authorization.destinationAccountRef,

    issuanceAccountRef:
      authorization.issuanceAccountRef,

    dbxAmountMinor:
      authorization.dbxAmountMinor,

    policyId:
      authorization.policyId,

    policyVersion:
      authorization.policyVersion,

    status:
      authorization.status,
  });
}

export function addDbxIssuanceAuthorization(
  store:
    DbxIssuanceAuthorizationStore,
  authorization:
    DbxIssuanceAuthorization
): {
  readonly store:
    DbxIssuanceAuthorizationStore;

  readonly authorization:
    DbxIssuanceAuthorization;

  readonly idempotentReplay:
    boolean;
} {
  const existingByKey =
    store.authorizations.find(
      (candidate) =>
        candidate.idempotencyKey ===
        authorization.idempotencyKey
    );

  if (existingByKey) {
    if (
      fingerprint(
        existingByKey
      ) !==
      fingerprint(
        authorization
      )
    ) {
      throw new Error(
        "DBX_ISSUANCE_IDEMPOTENCY_CONFLICT"
      );
    }

    return {
      store,

      authorization:
        existingByKey,

      idempotentReplay:
        true,
    };
  }

  if (
    store.authorizations.some(
      (candidate) =>
        candidate.id ===
        authorization.id
    )
  ) {
    throw new Error(
      "DBX_ISSUANCE_DUPLICATE_ID"
    );
  }

  if (
    authorization.status ===
      "AUTHORIZED" &&
    store.authorizations.some(
      (candidate) =>
        candidate.purchaseIntentId ===
          authorization.purchaseIntentId &&
        candidate.status ===
          "AUTHORIZED"
    )
  ) {
    throw new Error(
      "DBX_ISSUANCE_PURCHASE_ALREADY_AUTHORIZED"
    );
  }

  return {
    store: {
      authorizations: [
        ...store.authorizations,
        authorization,
      ],
    },

    authorization,

    idempotentReplay:
      false,
  };
}
