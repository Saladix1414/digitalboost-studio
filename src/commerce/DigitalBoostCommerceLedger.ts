import { emitCommerceSync } from "./DigitalBoostCommerceSync";
export const COMMERCE_LEDGER_CONTRACT = "cos-l0-ledger-v1" as const;

export type CommerceMoney = {
  readonly amount: number;
  readonly currency: "USD";
};

export type CommerceProduct = {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly sku?: string;
  readonly price: CommerceMoney;
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
};

export type CommerceCustomer = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
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
  readonly source: "ledger";
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

function writeAll(): void {
  emitCommerceSync("ledger");
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

export function resetCommerceLedger(): void {
  bags.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
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
    source: "ledger",
    products: data.products,
    orders: data.orders,
    customers: data.customers,
    events: data.events,
    netSales: paid.length ? paid.reduce((s, o) => s + o.total.amount, 0) : null,
    orderCount: data.orders.length,
    customerCount: data.customers.length,
  };
}

export function recordCommerceProduct(input: CommerceProduct): CommerceProduct {
  if (input.tenantId !== input.tenantId.trim() || !input.tenantId.trim()) {
    throw new Error("tenantId is required");
  }
  bag(input.tenantId).products.push(input);
  writeAll();
  return input;
}

export function recordCommerceOrder(input: CommerceOrder): CommerceOrder {
  bag(input.tenantId).orders.push(input);
  writeAll();
  return input;
}

export function recordCommerceCustomer(input: CommerceCustomer): CommerceCustomer {
  bag(input.tenantId).customers.push(input);
  writeAll();
  return input;
}
