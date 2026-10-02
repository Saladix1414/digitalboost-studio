import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAuthorizedDbxIssuanceLedgerTransaction,
} from "../../src/trading/dbx/purchase/issuanceLedgerTransaction";

const authorization = {
  id:
    "issuance-auth-1",

  idempotencyKey:
    "issuance-auth-key-1",

  purchaseIntentId:
    "purchase-1",

  quoteId:
    "quote-1",

  verificationId:
    "verification-1",

  destinationAccountRef:
    "dbx-user-001",

  issuanceAccountRef:
    "dbx-system-issuance",

  dbxAmountMinor:
    100_000_000,

  policyId:
    "issuance-policy-v1",

  policyVersion:
    "1",

  status:
    "AUTHORIZED" as const,

  checks:
    [],

  authorizedAt:
    "2026-10-02T12:09:00.000Z",

  ledgerPosted:
    false as const,

  authoritative:
    false as const,
};

test(
  "authorized issuance builds balanced DBX ledger transaction",
  () => {
    const transaction =
      buildAuthorizedDbxIssuanceLedgerTransaction(
        authorization,
        "2026-10-02T12:10:00.000Z"
      );

    assert.equal(
      transaction.kind,
      "ISSUANCE"
    );

    assert.equal(
      transaction.entries.length,
      2
    );

    const debit =
      transaction.entries
        .filter(
          (entry) =>
            entry.side ===
            "DEBIT"
        )
        .reduce(
          (total, entry) =>
            total +
            entry.amountMinor,
          0
        );

    const credit =
      transaction.entries
        .filter(
          (entry) =>
            entry.side ===
            "CREDIT"
        )
        .reduce(
          (total, entry) =>
            total +
            entry.amountMinor,
          0
        );

    assert.equal(
      debit,
      100_000_000
    );

    assert.equal(
      credit,
      100_000_000
    );

    assert.equal(
      debit,
      credit
    );

    assert.equal(
      transaction.entries[0]
        .accountId,
      "dbx-system-issuance"
    );

    assert.equal(
      transaction.entries[1]
        .accountId,
      "dbx-user-001"
    );
  }
);

test(
  "ledger transaction identity is deterministic",
  () => {
    const first =
      buildAuthorizedDbxIssuanceLedgerTransaction(
        authorization,
        "2026-10-02T12:10:00.000Z"
      );

    const second =
      buildAuthorizedDbxIssuanceLedgerTransaction(
        authorization,
        "2026-10-02T12:10:00.000Z"
      );

    assert.equal(
      first.id,
      second.id
    );

    assert.equal(
      first.idempotencyKey,
      second.idempotencyKey
    );
  }
);

test(
  "rejected authorization cannot build issuance transaction",
  () => {
    assert.throws(
      () =>
        buildAuthorizedDbxIssuanceLedgerTransaction(
          {
            ...authorization,

            status:
              "REJECTED",
          },
          "2026-10-02T12:10:00.000Z"
        ),

      /DBX_ISSUANCE_NOT_AUTHORIZED/
    );
  }
);
