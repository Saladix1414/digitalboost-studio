import assert from "node:assert/strict";
import test from "node:test";

import {
  addDbxIssuanceAuthorization,
  createDbxIssuanceAuthorizationStore,
} from "../../src/trading/dbx/purchase/issuanceStore";

const authorization = {
  id:
    "issuance-1",

  idempotencyKey:
    "issuance-key-1",

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
    "issuance-policy-1",

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
  "same issuance authorization is idempotent",
  () => {
    const first =
      addDbxIssuanceAuthorization(
        createDbxIssuanceAuthorizationStore(),
        authorization
      );

    const replay =
      addDbxIssuanceAuthorization(
        first.store,
        authorization
      );

    assert.equal(
      replay.idempotentReplay,
      true
    );

    assert.equal(
      replay.store.authorizations.length,
      1
    );
  }
);

test(
  "same purchase cannot receive two authorized issuances",
  () => {
    const first =
      addDbxIssuanceAuthorization(
        createDbxIssuanceAuthorizationStore(),
        authorization
      );

    assert.throws(
      () =>
        addDbxIssuanceAuthorization(
          first.store,
          {
            ...authorization,

            id:
              "issuance-2",

            idempotencyKey:
              "issuance-key-2",
          }
        ),

      /DBX_ISSUANCE_PURCHASE_ALREADY_AUTHORIZED/
    );
  }
);

test(
  "idempotency key cannot change issuance meaning",
  () => {
    const first =
      addDbxIssuanceAuthorization(
        createDbxIssuanceAuthorizationStore(),
        authorization
      );

    assert.throws(
      () =>
        addDbxIssuanceAuthorization(
          first.store,
          {
            ...authorization,

            dbxAmountMinor:
              200_000_000,
          }
        ),

      /DBX_ISSUANCE_IDEMPOTENCY_CONFLICT/
    );
  }
);
