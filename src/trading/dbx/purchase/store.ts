import type {
  DbxPurchaseIntent,
  DbxPurchaseStore,
  DbxQuote,
} from "./types";

export function addDbxQuote(
  store:
    DbxPurchaseStore,
  quote:
    DbxQuote
): DbxPurchaseStore {
  if (
    store.quotes.some(
      (candidate) =>
        candidate.id ===
        quote.id
    )
  ) {
    throw new Error(
      "DBX_QUOTE_DUPLICATE_ID"
    );
  }

  return {
    ...store,

    quotes: [
      ...store.quotes,
      quote,
    ],
  };
}

export function replaceDbxPurchaseIntent(
  store:
    DbxPurchaseStore,
  intent:
    DbxPurchaseIntent
): DbxPurchaseStore {
  const exists =
    store.intents.some(
      (candidate) =>
        candidate.id ===
        intent.id
    );

  if (!exists) {
    throw new Error(
      "DBX_PURCHASE_INTENT_NOT_FOUND"
    );
  }

  return {
    ...store,

    intents:
      store.intents.map(
        (candidate) =>
          candidate.id ===
            intent.id
            ? intent
            : candidate
      ),
  };
}
