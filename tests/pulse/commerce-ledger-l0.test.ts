import test from "node:test";
import assert from "node:assert/strict";
import {
  getCommerceSnapshot,
  recordCommerceOrder,
  resetCommerceLedger,
} from "../../src/commerce/DigitalBoostCommerceLedger.ts";

test("L0 empty tenant snapshot does not invent sales", () => {
  resetCommerceLedger();
  const snap = getCommerceSnapshot("tenant-a");
  assert.equal(snap.source, "ledger");
  assert.equal(snap.netSales, null);
  assert.equal(snap.orderCount, 0);
  assert.equal(snap.products.length, 0);
});

test("L0 tenants do not share orders", () => {
  resetCommerceLedger();
  recordCommerceOrder({
    id: "ord-1",
    tenantId: "tenant-a",
    total: { amount: 20, currency: "USD" },
    paymentState: "PAID",
    fulfillmentState: "UNFULFILLED",
    createdAt: "2026-09-27T00:00:00.000Z",
  });
  assert.equal(getCommerceSnapshot("tenant-a").netSales, 20);
  assert.equal(getCommerceSnapshot("tenant-b").netSales, null);
});
