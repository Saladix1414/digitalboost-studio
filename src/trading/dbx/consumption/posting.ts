import {
  postDbxLedgerTransaction,
} from "../ledger/ledger";

import {
  buildDbxConsumptionLedgerTransaction,
} from "./ledgerTransaction";

import {
  registerDbxConsumptionPosting,
} from "./registry";

import type {
  DbxConsumptionIntent,
  DbxConsumptionPostingRecord,
  DbxConsumptionRegistry,
} from "./types";

export function postDbxConsumption<
  TLedger
>(
  ledger: TLedger,

  registry:
    DbxConsumptionRegistry,

  intent:
    DbxConsumptionIntent
) {
  const transaction =
    buildDbxConsumptionLedgerTransaction(
      intent
    );

  const ledgerPosting =
    postDbxLedgerTransaction(
      ledger as any,
      transaction as any
    );

  const nextLedger =
    ledgerPosting.ledger;

  const record:
    DbxConsumptionPostingRecord = {
    id:
      `dbx-consumption-record:${intent.id}`,

    intentId:
      intent.id,

    idempotencyKey:
      intent.idempotencyKey,

    userAccountId:
      intent.userAccountId,

    destinationAccountId:
      intent.destinationAccountId,

    amountMinor:
      intent.amountMinor,

    purpose:
      intent.purpose,

    transactionId:
      transaction.id,

    status:
      "POSTED",

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
      registerDbxConsumptionPosting(
        registry,
        record
      ),

    record,
  };
}
