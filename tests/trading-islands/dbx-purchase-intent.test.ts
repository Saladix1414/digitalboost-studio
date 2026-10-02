import assert from "node:assert/strict";
import test from "node:test";

import {
  createDbxPurchaseIntent,
  createDbxPurchaseStore,
} from "../../src/trading/dbx/purchase/intent";

import {
  dbxPurchaseIntentFixture,
} from "../../src/trading/dbx/purchase/fixtures";

test(
  "purchase intent starts CREATED and non-authoritative",
  () => {
    const result =
      createDbxPurchaseIntent(
        createDbxPurchaseStore(),
        dbxPurchaseIntentFixture
      );

    assert.equal(
      result.intent.status,
      "CREATED"
    );

    assert.equal(
      result.intent.authoritative,
      false
    );
  }
);

test(
  "same purchase request is idempotent",
  () => {
    const first =
      createDbxPurchaseIntent(
        createDbxPurchaseStore(),
        dbxPurchaseIntentFixture
      );

    const replay =
      createDbxPurchaseIntent(
        first.store,
        dbxPurchaseIntentFixture
      );

    assert.equal(
      replay.idempotentReplay,
      true
    );

    assert.equal(
      replay.store.intents.length,
      1
    );
  }
);

test(
  "same idempotency key cannot mutate purchase meaning",
  () => {
    const first =
      createDbxPurchaseIntent(
        createDbxPurchaseStore(),
        dbxPurchaseIntentFixture
      );

    assert.throws(
      () =>
        createDbxPurchaseIntent(
          first.store,
          {
            ...dbxPurchaseIntentFixture,

            requestedDbxMinor:
              200_000_000,
          }
        ),

      /DBX_PURCHASE_IDEMPOTENCY_CONFLICT/
    );
  }
);
