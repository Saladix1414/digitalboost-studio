import assert from "node:assert/strict";
import test from "node:test";

import {
  canTransitionDbxPurchase,
} from "../../src/trading/dbx/purchase/stateMachine";

test(
  "DBX purchase canonical transitions are allowed",
  () => {
    assert.equal(
      canTransitionDbxPurchase(
        "CREATED",
        "QUOTED"
      ),
      true
    );

    assert.equal(
      canTransitionDbxPurchase(
        "PAYMENT_VERIFIED",
        "ISSUANCE_AUTHORIZED"
      ),
      true
    );

    assert.equal(
      canTransitionDbxPurchase(
        "LEDGER_POSTED",
        "COMPLETED"
      ),
      true
    );
  }
);

test(
  "DBX purchase cannot jump from quote to issuance",
  () => {
    assert.equal(
      canTransitionDbxPurchase(
        "QUOTED",
        "ISSUANCE_AUTHORIZED"
      ),
      false
    );
  }
);
