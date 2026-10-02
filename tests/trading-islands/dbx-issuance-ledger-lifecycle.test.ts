import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDbxIssuanceLedgerPosting,
} from "../../src/trading/dbx/purchase/applyLedgerPosting";

import {
  completeDbxPurchase,
} from "../../src/trading/dbx/purchase/completePurchase";

const intent = {
  id:
    "purchase-1",

  userRef:
    "user-1",

  accountRef:
    "dbx-user-001",

  rail:
    "FIAT" as const,

  requestedDbxMinor:
    100_000_000,

  quoteId:
    "quote-1",

  idempotencyKey:
    "purchase-key",

  status:
    "ISSUANCE_AUTHORIZED" as const,

  createdAt:
    "2026-10-02T12:00:00.000Z",

  updatedAt:
    "2026-10-02T12:09:00.000Z",

  authoritative:
    false as const,
};

const posting = {
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
    "ledger-key",

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
  "posted issuance advances purchase to LEDGER_POSTED",
  () => {
    const updated =
      applyDbxIssuanceLedgerPosting(
        intent,
        posting,
        "2026-10-02T12:10:00.000Z"
      );

    assert.equal(
      updated.status,
      "LEDGER_POSTED"
    );
  }
);

test(
  "LEDGER_POSTED purchase can complete",
  () => {
    const posted =
      applyDbxIssuanceLedgerPosting(
        intent,
        posting,
        "2026-10-02T12:10:00.000Z"
      );

    const completed =
      completeDbxPurchase(
        posted,
        "2026-10-02T12:10:01.000Z"
      );

    assert.equal(
      completed.status,
      "COMPLETED"
    );
  }
);
