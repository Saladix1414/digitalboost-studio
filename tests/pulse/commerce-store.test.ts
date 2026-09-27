import test from "node:test";
import assert from "node:assert/strict";
import { resetCommerceLedger, recordCommerceOrder } from "../../src/commerce/DigitalBoostCommerceLedger.ts";
import { readCommerceStore } from "../../src/commerce/DigitalBoostCommerceStore.ts";

test("commerce store reads ledger without inventing sales", () => {
  resetCommerceLedger();
  const empty = readCommerceStore("tenant-a");
  assert.equal(empty.snap.netSales, null);
  recordCommerceOrder({
    id: "o1",
    tenantId: "tenant-a",
    total: { amount: 10, currency: "USD" },
    paymentState: "PAID",
    fulfillmentState: "UNFULFILLED",
    createdAt: "2026-09-27T00:00:00.000Z",
  });
  assert.equal(readCommerceStore("tenant-a").snap.netSales, 10);
  assert.equal(readCommerceStore("tenant-b").snap.netSales, null);
});
