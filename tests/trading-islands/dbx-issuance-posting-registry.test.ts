import assert from "node:assert/strict";
import test from "node:test";

import {
  addDbxIssuancePostingRecord,
  createDbxIssuancePostingRegistry,
} from "../../src/trading/dbx/purchase/issuancePostingRegistry";

const record = {
  id:
    "posting-1",

  authorizationId:
    "authorization-1",

  purchaseIntentId:
    "purchase-1",

  quoteId:
    "quote-1",

  verificationId:
    "verification-1",

  transactionId:
    "transaction-1",

  ledgerIdempotencyKey:
    "ledger-key-1",

  issuanceAccountRef:
    "dbx-system-issuance",

  destinationAccountRef:
    "dbx-user-001",

  dbxAmountMinor:
    100_000_000,

  status:
    "POSTED" as const,

  postedAt:
    "2026-10-02T12:10:00.000Z",

  systemOfRecord:
    "DBX_LEDGER" as const,

  governanceAuthority:
    false as const,
};

test(
  "posting registry records one authorized issuance",
  () => {
    const result =
      addDbxIssuancePostingRecord(
        createDbxIssuancePostingRegistry(),
        record
      );

    assert.equal(
      result.records.length,
      1
    );
  }
);

test(
  "authorization cannot be posted twice",
  () => {
    const registry =
      addDbxIssuancePostingRecord(
        createDbxIssuancePostingRegistry(),
        record
      );

    assert.throws(
      () =>
        addDbxIssuancePostingRecord(
          registry,
          {
            ...record,

            id:
              "posting-2",

            transactionId:
              "transaction-2",
          }
        ),

      /DBX_ISSUANCE_AUTHORIZATION_ALREADY_POSTED/
    );
  }
);

test(
  "purchase cannot create a second issuance posting",
  () => {
    const registry =
      addDbxIssuancePostingRecord(
        createDbxIssuancePostingRegistry(),
        record
      );

    assert.throws(
      () =>
        addDbxIssuancePostingRecord(
          registry,
          {
            ...record,

            id:
              "posting-3",

            authorizationId:
              "authorization-2",

            transactionId:
              "transaction-3",

            ledgerIdempotencyKey:
              "ledger-key-3",
          }
        ),

      /DBX_ISSUANCE_PURCHASE_ALREADY_POSTED/
    );
  }
);
