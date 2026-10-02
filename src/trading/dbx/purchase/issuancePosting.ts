import {
  postDbxLedgerTransaction,
} from "../ledger/ledger";

import {
  buildAuthorizedDbxIssuanceLedgerTransaction,
} from "./issuanceLedgerTransaction";

import {
  addDbxIssuancePostingRecord,
  assertDbxIssuanceNotPreviouslyPosted,
} from "./issuancePostingRegistry";

import type {
  DbxIssuanceAuthorization,
  DbxIssuancePostingRecord,
  DbxIssuancePostingRegistry,
} from "./types";

export function postAuthorizedDbxIssuance<
  TLedger
>(
  ledger:
    TLedger,
  registry:
    DbxIssuancePostingRegistry,
  authorization:
    DbxIssuanceAuthorization,
  postedAt:
    string
): {
  readonly ledger:
    unknown;

  readonly registry:
    DbxIssuancePostingRegistry;

  readonly record:
    DbxIssuancePostingRecord;
} {
  if (
    authorization.status !==
      "AUTHORIZED"
  ) {
    throw new Error(
      "DBX_ISSUANCE_NOT_AUTHORIZED"
    );
  }

  assertDbxIssuanceNotPreviouslyPosted(
    registry,
    authorization.id,
    authorization.purchaseIntentId
  );

  const transaction =
    buildAuthorizedDbxIssuanceLedgerTransaction(
      authorization,
      postedAt
    );

  /*
   * Ledger owns:
   * - account validation
   * - double-entry validation
   * - atomic append
   * - transaction idempotency
   *
   * This bridge owns only purchase/authorization binding.
   */
  const postedLedger =
    postDbxLedgerTransaction(
      ledger as any,
      transaction as any
    );

  const record:
    DbxIssuancePostingRecord = {
      id:
        `dbx-issuance-posting:${authorization.id}`,

      authorizationId:
        authorization.id,

      purchaseIntentId:
        authorization.purchaseIntentId,

      quoteId:
        authorization.quoteId,

      verificationId:
        authorization.verificationId,

      transactionId:
        transaction.id,

      ledgerIdempotencyKey:
        transaction.idempotencyKey,

      issuanceAccountRef:
        authorization.issuanceAccountRef,

      destinationAccountRef:
        authorization.destinationAccountRef,

      dbxAmountMinor:
        authorization.dbxAmountMinor,

      status:
        "POSTED",

      postedAt,

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    };

  const nextRegistry =
    addDbxIssuancePostingRecord(
      registry,
      record
    );

  return {
    ledger:
      postedLedger,

    registry:
      nextRegistry,

    record,
  };
}
