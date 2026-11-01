import type { CommerceSnapshot, CommerceProduct, CommerceCustomer, CommerceOrderLine, CommerceCurrency } from "./DigitalBoostCommerceLedger";

const BASE = "/api/commerce/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const code = typeof payload?.error === "string" ? payload.error : `http_${response.status}`;
    throw new Error(code);
  }
  return response.json() as Promise<T>;
}

export function fetchCommerceSnapshot(): Promise<CommerceSnapshot> {
  return request<CommerceSnapshot>("/snapshot");
}

export function saveCommerceProduct(product: CommerceProduct): Promise<{ ok: true; product: CommerceProduct }> {
  const { id, title, sku, price, priceArs, stock } = product;
  return request(`/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ title, sku, price, priceArs, stock }),
  });
}

export function deleteCommerceProduct(id: string): Promise<{ ok: true }> {
  return request(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function fetchCommerceOrderItems(orderId: string): Promise<{
  items: CommerceOrderLine[];
  source: "postgresql";
  authoritative: false;
}> {
  return request<{
    items: CommerceOrderLine[];
    source: "postgresql";
    authoritative: false;
  }>(`/orders/${encodeURIComponent(orderId)}/items`);
}

export function createCommerceOrder(input: {
  lines: Array<{ productId: string; quantity: number }>;
  customerId?: string;
  idempotencyKey: string;
  currency?: CommerceCurrency;
}): Promise<{ ok: true; order: CommerceSnapshot["orders"][number]; items: Array<{
  productId: string; title: string; quantity: number;
  unitPrice: { amount: number; currency: CommerceCurrency };
  total: { amount: number; currency: CommerceCurrency };
}>; replayed: boolean }> {
  return request("/orders", { method: "POST", body: JSON.stringify(input) });
}

export function createCommerceCustomer(input: { name: string; email?: string }): Promise<{ ok: true; customer: CommerceCustomer }> {
  return request("/customers", { method: "POST", body: JSON.stringify(input) });
}
