import type { CommerceSnapshot } from "./DigitalBoostCommerceLedger";

const DAY_MS = 86_400_000;

/** Build a UTC calendar-day view from the local commerce ledger only. */
export function commercePeriod(
  snap: CommerceSnapshot,
  range: string,
  now = Date.now(),
) {
  const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const current = new Date(now);
  const endDay = Date.UTC(
    current.getUTCFullYear(),
    current.getUTCMonth(),
    current.getUTCDate(),
  );
  const start = endDay - (days - 1) * DAY_MS;

  const orders = snap.orders
    .filter((order) => {
      const at = Date.parse(order.createdAt);
      return (
        order.tenantId === snap.tenantId &&
        Number.isFinite(at) &&
        at >= start &&
        at <= now
      );
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const paid = orders.filter(
    (order) =>
      order.paymentState === "PAID" &&
      order.total?.currency === "USD" &&
      Number.isFinite(order.total.amount),
  );
  const customerIds = new Set(
    orders.map((order) => order.customerId).filter((id): id is string => Boolean(id)),
  );
  const customers = snap.customers.filter(
    (customer) =>
      customer.tenantId === snap.tenantId && customerIds.has(customer.id),
  );

  const totals = new Map<string, number>();
  for (let index = 0; index < days; index += 1) {
    const date = new Date(start + index * DAY_MS).toISOString().slice(0, 10);
    totals.set(date, 0);
  }
  for (const order of paid) {
    const date = new Date(order.createdAt).toISOString().slice(0, 10);
    totals.set(date, (totals.get(date) ?? 0) + order.total.amount);
  }

  const series = [...totals.entries()].map(([date, amount]) => ({ date, amount }));
  const sales = paid.length
    ? paid.reduce((total, order) => total + order.total.amount, 0)
    : null;

  return { days, orders, customers, paidCount: paid.length, sales, series };
}
