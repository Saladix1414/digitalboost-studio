import assert from "node:assert/strict";
import test from "node:test";
import { commercePeriod } from "../../src/commerce/commercePeriod.ts";
import type { CommerceSnapshot } from "../../src/commerce/DigitalBoostCommerceLedger.ts";

const now = Date.parse("2026-10-31T12:00:00.000Z");

function order(
  id: string,
  createdAt: string,
  paymentState: "PAID" | "UNPAID" = "PAID",
  tenantId = "tenant-a",
  amount = 100,
) {
  return {
    id, tenantId, customerId: `customer-${id}`,
    total: { amount, currency: "USD" as const },
    paymentState, fulfillmentState: "UNFULFILLED" as const, createdAt,
  };
}

function snapshot(orders: CommerceSnapshot["orders"]): CommerceSnapshot {
  return {
    contract: "cos-l0-ledger-v1", tenantId: "tenant-a", source: "ledger",
    products: [], orders, customers: [
      { id: "customer-old", tenantId: "tenant-a", name: "Old" },
      { id: "customer-start", tenantId: "tenant-a", name: "Start" },
      { id: "customer-new", tenantId: "tenant-a", name: "New" },
      { id: "customer-other", tenantId: "tenant-b", name: "Other tenant" },
    ],
    events: [], netSales: null, orderCount: orders.length, customerCount: 0,
  };
}

test("7d returns exactly seven UTC calendar buckets and includes the first day", () => {
  const snap = snapshot([
    order("old", "2026-10-24T23:59:59.999Z"),
    order("start", "2026-10-25T00:00:00.000Z"),
    order("new", "2026-10-31T11:00:00.000Z", "PAID", "tenant-a", 250),
    order("unpaid", "2026-10-31T10:00:00.000Z", "UNPAID", "tenant-a", 900),
    order("foreign", "2026-10-31T09:00:00.000Z", "PAID", "tenant-b", 500),
  ]);
  const result = commercePeriod(snap, "7d", now);

  assert.equal(result.days, 7);
  assert.deepEqual(result.series.map((point) => point.date), [
    "2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28",
    "2026-10-29", "2026-10-30", "2026-10-31",
  ]);
  assert.equal(result.orders.length, 3);
  assert.deepEqual(result.orders.map((item) => item.id), ["new", "unpaid", "start"]);
  assert.equal(result.paidCount, 2);
  assert.equal(result.sales, 350);
  assert.equal(result.series.reduce((total, point) => total + point.amount, 0), 350);
  assert.deepEqual(result.customers.map((customer) => customer.id), ["customer-start", "customer-new"]);
});

test("invalid ranges fall back to seven days and empty paid sales stay null", () => {
  const result = commercePeriod(snapshot([order("unpaid", "2026-10-31T11:00:00.000Z", "UNPAID")]), "unexpected", now);
  assert.equal(result.days, 7);
  assert.equal(result.sales, null);
  assert.equal(result.paidCount, 0);
  assert.equal(result.series.length, 7);
});
