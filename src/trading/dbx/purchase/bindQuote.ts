import type {
  DbxPurchaseIntent,
  DbxQuote,
} from "./types";

import {
  isDbxQuoteExpired,
} from "./quote";

export function bindQuoteToPurchaseIntent(
  intent:
    DbxPurchaseIntent,
  quote:
    DbxQuote,
  now:
    string
): DbxPurchaseIntent {
  if (
    intent.status !==
      "CREATED"
  ) {
    throw new Error(
      "DBX_PURCHASE_NOT_CREATED"
    );
  }

  if (
    quote.rail !==
      intent.rail
  ) {
    throw new Error(
      "DBX_PURCHASE_QUOTE_RAIL_MISMATCH"
    );
  }

  if (
    quote.dbxAmountMinor !==
      intent.requestedDbxMinor
  ) {
    throw new Error(
      "DBX_PURCHASE_QUOTE_AMOUNT_MISMATCH"
    );
  }

  if (
    isDbxQuoteExpired(
      quote,
      now
    )
  ) {
    throw new Error(
      "DBX_PURCHASE_QUOTE_EXPIRED"
    );
  }

  return {
    ...intent,

    quoteId:
      quote.id,

    status:
      "QUOTED",

    updatedAt:
      now,

    authoritative:
      false,
  };
}
