import { emitCommerceSync, pingCommerceSyncPeers } from "./DigitalBoostCommerceSync";
export const COMMERCE_LEDGER_CONTRACT = "cos-l0-ledger-v1" as const;

export type CommerceCurrency = "USD" | "ARS";

export type CommerceMoney = {
  readonly amount: number;
  readonly currency: CommerceCurrency;
};

export type CommerceProduct = {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly sku?: string;
  readonly price: CommerceMoney;
  /** Optional for legacy products until an ARS price is entered. */
  readonly priceArs?: CommerceMoney;
  readonly stock: number;
};

export type CommerceOrder = {
  readonly id: string;
  readonly tenantId: string;
  readonly customerId?: string;
  readonly total: CommerceMoney;
  readonly paymentState: "UNPAID" | "PAID" | "REFUNDED";
  readonly fulfillmentState: "UNFULFILLED" | "FULFILLED" | "CANCELLED";
  readonly createdAt: string;
  readonly customerName?: string;
  readonly itemCount?: number;
};

export type CommerceOrderLineInput = {
  readonly productId: string;
  readonly quantity: number;
};

export type CommerceOrderLine = {
  readonly productId: string;
  readonly title: string;
  readonly quantity: number;
  readonly unitPrice: CommerceMoney;
  readonly total: CommerceMoney;
};

export type CommerceCustomer = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly email?: string;
};

export type CommerceEvent = {
  readonly id: string;
  readonly tenantId: string;
  readonly kind: "page_view" | "checkout_started" | "order_paid";
  readonly at: string;
};

export type CommerceSnapshot = {
  readonly contract: typeof COMMERCE_LEDGER_CONTRACT;
  readonly tenantId: string;
  readonly source: "ledger" | "postgresql" | "mixed";
  readonly products: readonly CommerceProduct[];
  readonly orders: readonly CommerceOrder[];
  readonly customers: readonly CommerceCustomer[];
  readonly events: readonly CommerceEvent[];
  readonly netSales: number | null;
  readonly orderCount: number;
  readonly customerCount: number;
};

type TenantBag = {
  products: CommerceProduct[];
  orders: CommerceOrder[];
  customers: CommerceCustomer[];
  events: CommerceEvent[];
};

const bags = new Map<string, TenantBag>();
const serverBackedTenants = new Set<string>();
const mixedTenants = new Set<string>();
const LS_KEY = "db-commerce-ledger-v1";

function readAll(): void {
  if (bags.size) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, TenantBag>;
    if (!parsed || typeof parsed !== "object") return;
    for (const [id, bag] of Object.entries(parsed)) {
      if (!id || !bag) continue;
      bags.set(id, {
        products: Array.isArray(bag.products) ? bag.products : [],
        orders: Array.isArray(bag.orders) ? bag.orders : [],
        customers: Array.isArray(bag.customers) ? bag.customers : [],
        events: Array.isArray(bag.events) ? bag.events : [],
      });
    }
  } catch {}
}

function writeAll(options: { notifyServerPeers?: boolean } = {}): void {
  emitCommerceSync("ledger");
  if (options.notifyServerPeers !== false) pingCommerceSyncPeers();
  try {
    const dump: Record<string, TenantBag> = {};
    for (const [id, bag] of bags) dump[id] = bag;
    localStorage.setItem(LS_KEY, JSON.stringify(dump));
  } catch {}
}


function bag(tenantId: string): TenantBag {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  const existing = bags.get(id);
  if (existing) return existing;
  const created: TenantBag = {
    products: [],
    orders: [],
    customers: [],
    events: [],
  };
  bags.set(id, created);
  return created;
}

function mergeRows<T extends { readonly id: string }>(
  localRows: readonly T[],
  serverRows: readonly T[],
): T[] {
  const merged = new Map(serverRows.map(row => [row.id, row]));
  // Keep local rows and values until an explicit reconciliation can resolve conflicts.
  for (const row of localRows) merged.set(row.id, row);
  return [...merged.values()];
}

function hasLocalDifferences<T extends { readonly id: string }>(
  localRows: readonly T[],
  serverRows: readonly T[],
): boolean {
  const serverById = new Map(serverRows.map(row => [row.id, row]));
  return localRows.some(row => JSON.stringify(row) !== JSON.stringify(serverById.get(row.id)));
}

function markLocalMutation(tenantId: string): void {
  if (serverBackedTenants.has(tenantId) || mixedTenants.has(tenantId)) {
    mixedTenants.add(tenantId);
  }
  serverBackedTenants.delete(tenantId);
}

export function resetCommerceLedger(): void {
  bags.clear();
  serverBackedTenants.clear();
  mixedTenants.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
}

/** Replace one tenant's local product cache without touching orders or customers. */
export function replaceCommerceProducts(tenantId: string, products: readonly CommerceProduct[]): void {
  const data = bag(tenantId);
  markLocalMutation(tenantId);
  data.products = products.filter(product => product.tenantId === tenantId).map(product => ({ ...product }));
  writeAll({ notifyServerPeers: false });
}

/** Hydrate the browser cache from the server without broadcasting a write back. */
export function hydrateCommerceSnapshot(snapshot: CommerceSnapshot): void {
  const tenantId = snapshot.tenantId.trim();
  if (!tenantId) return;
  readAll();
  const local = bag(tenantId);
  const hasLocalData = [local.products, local.orders, local.customers, local.events]
    .some(rows => rows.length > 0);
  const differs = hasLocalData && (
    hasLocalDifferences(local.products, snapshot.products)
    || hasLocalDifferences(local.orders, snapshot.orders)
    || hasLocalDifferences(local.customers, snapshot.customers)
    || hasLocalDifferences(local.events, snapshot.events)
  );
  bags.set(tenantId, {
    products: mergeRows(local.products, snapshot.products),
    orders: mergeRows(local.orders, snapshot.orders),
    customers: mergeRows(local.customers, snapshot.customers),
    events: mergeRows(local.events, snapshot.events),
  });
  serverBackedTenants.add(tenantId);
  if (differs) mixedTenants.add(tenantId);
  else mixedTenants.delete(tenantId);
  try {
    const dump: Record<string, TenantBag> = {};
    for (const [id, value] of bags) dump[id] = value;
    localStorage.setItem(LS_KEY, JSON.stringify(dump));
  } catch {}
  emitCommerceSync("server-snapshot");
}

export function getCommerceSnapshot(tenantId: string): CommerceSnapshot {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  const data = bags.get(id) ?? {
    products: [],
    orders: [],
    customers: [],
    events: [],
  };
  const paid = data.orders.filter((o) => o.paymentState === "PAID");
  return {
    contract: COMMERCE_LEDGER_CONTRACT,
    tenantId: id,
    source: mixedTenants.has(id)
      ? "mixed"
      : serverBackedTenants.has(id)
        ? "postgresql"
        : "ledger",
    products: data.products,
    orders: data.orders,
    customers: data.customers,
    events: data.events,
    netSales: mixedTenants.has(id)
      ? null
      : paid.length ? paid.reduce((s, o) => s + o.total.amount, 0) : null,
    orderCount: data.orders.length,
    customerCount: data.customers.length,
  };
}

export function recordCommerceProduct(input: CommerceProduct): CommerceProduct {
  if (input.tenantId !== input.tenantId.trim() || !input.tenantId.trim()) {
    throw new Error("tenantId is required");
  }
  bag(input.tenantId).products.push(input);
  markLocalMutation(input.tenantId);
  writeAll();
  return input;
}

export function recordCommerceOrder(input: CommerceOrder): CommerceOrder {
  const data = bag(input.tenantId);
  const idx = data.orders.findIndex((item) => item.id === input.id);
  if (idx >= 0) data.orders[idx] = input;
  else data.orders.push(input);
  markLocalMutation(input.tenantId);
  writeAll();
  return input;
}

export function recordCommerceCustomer(input: CommerceCustomer): CommerceCustomer {
  bag(input.tenantId).customers.push(input);
  markLocalMutation(input.tenantId);
  writeAll();
  return input;
}
