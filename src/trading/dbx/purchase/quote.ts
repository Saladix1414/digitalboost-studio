import type {
  DbxExternalCurrency,
  DbxPaymentRail,
  DbxQuote,
} from "./types";

function assertSafePositiveInteger(
  value:
    number,
  code:
    string
) {
  if (
    !Number.isSafeInteger(
      value
    ) ||
    value <= 0
  ) {
    throw new Error(code);
  }
}

export function createDbxQuote(
  input: {
    readonly id:
      string;

    readonly rail:
      DbxPaymentRail;

    readonly externalCurrency:
      DbxExternalCurrency;

    readonly externalAmountMinor:
      number;

    readonly dbxAmountMinor:
      number;

    readonly rateNumerator:
      number;

    readonly rateDenominator:
      number;

    readonly createdAt:
      string;

    readonly expiresAt:
      string;

    readonly policyVersion:
      string;
  }
): DbxQuote {
  assertSafePositiveInteger(
    input.externalAmountMinor,
    "DBX_QUOTE_INVALID_EXTERNAL_AMOUNT"
  );

  assertSafePositiveInteger(
    input.dbxAmountMinor,
    "DBX_QUOTE_INVALID_DBX_AMOUNT"
  );

  assertSafePositiveInteger(
    input.rateNumerator,
    "DBX_QUOTE_INVALID_RATE_NUMERATOR"
  );

  assertSafePositiveInteger(
    input.rateDenominator,
    "DBX_QUOTE_INVALID_RATE_DENOMINATOR"
  );

  if (
    Date.parse(
      input.expiresAt
    ) <=
    Date.parse(
      input.createdAt
    )
  ) {
    throw new Error(
      "DBX_QUOTE_INVALID_EXPIRATION"
    );
  }

  return {
    ...input,

    authoritative:
      false,
  };
}

export function isDbxQuoteExpired(
  quote:
    DbxQuote,
  now:
    string
): boolean {
  return (
    Date.parse(now) >=
    Date.parse(
      quote.expiresAt
    )
  );
}
