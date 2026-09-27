import test from "node:test";
import assert from "node:assert/strict";
import { getCommerceSnapshot, resetCommerceLedger } from "../../src/commerce/DigitalBoostCommerceLedger.ts";
import {
  dispatchCommerceOrderCommand,
  resetCommerceOrderCommands,
} from "../../src/commerce/DigitalBoostCommerceOrderCommands.ts";

test("CREATE_ORDER rejects zero amount", () => {
  resetCommerceLedger();
  resetCommerceOrderCommands();
  const result = dispatchCommerceOrderCommand({
    type: "CREATE_ORDER",
    tenantId: "t1",
    id: "o1",
    amount: 0,
  });
  assert.equal(result.ok, false);
});

test("cannot fulfill an unpaid order", () => {
  resetCommerceLedger();
  resetCommerceOrderCommands();
  const created = dispatchCommerceOrderCommand({
    type: "CREATE_ORDER",
    tenantId: "t1",
    id: "o2",
    amount: 15,
  });
  assert.equal(created.ok, true);
  const fulfilled = dispatchCommerceOrderCommand({
    type: "MARK_FULFILLED",
    tenantId: "t1",
    id: "o2",
  });
  assert.equal(fulfilled.ok, false);
});

test("paid then fulfilled is allowed", () => {
  resetCommerceLedger();
  resetCommerceOrderCommands();
  dispatchCommerceOrderCommand({ type: "CREATE_ORDER", tenantId: "t1", id: "o3", amount: 15 });
  const paid = dispatchCommerceOrderCommand({ type: "MARK_PAID", tenantId: "t1", id: "o3" });
  assert.equal(paid.ok, true);
  const fulfilled = dispatchCommerceOrderCommand({ type: "MARK_FULFILLED", tenantId: "t1", id: "o3" });
  assert.equal(fulfilled.ok, true);
});

test("paid command does not duplicate ledger rows", () => {
  resetCommerceLedger();
  resetCommerceOrderCommands();
  dispatchCommerceOrderCommand({ type: "CREATE_ORDER", tenantId: "t1", id: "o4", amount: 15 });
  dispatchCommerceOrderCommand({ type: "MARK_PAID", tenantId: "t1", id: "o4" });
  const snap = getCommerceSnapshot("t1");
  assert.equal(snap.orders.length, 1);
  assert.equal(snap.orders[0].paymentState, "PAID");
});
