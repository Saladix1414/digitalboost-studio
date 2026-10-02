import type {
  DbxPaymentRail,
  DbxPurchaseIntent,
  DbxPurchaseStore,
} from "./types";

export function createDbxPurchaseStore():
  DbxPurchaseStore {
  return {
    intents:
      [],

    quotes:
      [],
  };
}

export function createDbxPurchaseIntent(
  store:
    DbxPurchaseStore,
  input: {
    readonly id:
      string;

    readonly userRef:
      string;

    readonly accountRef:
      string;

    readonly rail:
      DbxPaymentRail;

    readonly requestedDbxMinor:
      number;

    readonly idempotencyKey:
      string;

    readonly createdAt:
      string;
  }
): {
  readonly store:
    DbxPurchaseStore;

  readonly intent:
    DbxPurchaseIntent;

  readonly idempotentReplay:
    boolean;
} {
  if (
    !Number.isSafeInteger(
      input.requestedDbxMinor
    ) ||
    input.requestedDbxMinor <=
      0
  ) {
    throw new Error(
      "DBX_PURCHASE_INVALID_AMOUNT"
    );
  }

  const existing =
    store.intents.find(
      (intent) =>
        intent.idempotencyKey ===
        input.idempotencyKey
    );

  if (existing) {
    const same =
      existing.id ===
        input.id &&
      existing.userRef ===
        input.userRef &&
      existing.accountRef ===
        input.accountRef &&
      existing.rail ===
        input.rail &&
      existing.requestedDbxMinor ===
        input.requestedDbxMinor;

    if (!same) {
      throw new Error(
        "DBX_PURCHASE_IDEMPOTENCY_CONFLICT"
      );
    }

    return {
      store,

      intent:
        existing,

      idempotentReplay:
        true,
    };
  }

  const duplicateId =
    store.intents.some(
      (intent) =>
        intent.id ===
        input.id
    );

  if (duplicateId) {
    throw new Error(
      "DBX_PURCHASE_DUPLICATE_ID"
    );
  }

  const intent:
    DbxPurchaseIntent = {
      id:
        input.id,

      userRef:
        input.userRef,

      accountRef:
        input.accountRef,

      rail:
        input.rail,

      requestedDbxMinor:
        input.requestedDbxMinor,

      quoteId:
        null,

      idempotencyKey:
        input.idempotencyKey,

      status:
        "CREATED",

      createdAt:
        input.createdAt,

      updatedAt:
        input.createdAt,

      authoritative:
        false,
    };

  return {
    store: {
      ...store,

      intents: [
        ...store.intents,
        intent,
      ],
    },

    intent,

    idempotentReplay:
      false,
  };
}
