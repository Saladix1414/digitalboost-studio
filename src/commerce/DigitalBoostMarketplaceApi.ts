import type { MarketListing, MarketRail, MarketSeller, MarketSnapshot } from "./DigitalBoostMarketplace";

const BASE = "/api/commerce/v1/marketplace";

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
    throw new Error(typeof payload?.error === "string" ? payload.error : `http_${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchMarketplaceSnapshot(): Promise<MarketSnapshot> {
  return request<MarketSnapshot>("/snapshot");
}

export function fetchPublicMarketListings(): Promise<{ listings: MarketListing[] }> {
  return request<{ listings: MarketListing[] }>("/public-listings");
}

export function saveMarketSeller(input: Pick<MarketSeller, "id" | "name">): Promise<{ ok: true; seller: MarketSeller }> {
  return request("/sellers", { method: "POST", body: JSON.stringify(input) });
}

export function activateMarketSellerOnServer(id: string): Promise<{ ok: true; seller: MarketSeller }> {
  return request(`/sellers/${encodeURIComponent(id)}/activate`, { method: "POST" });
}

export function saveMarketListing(input: {
  id: string;
  sellerId: string;
  productId: string;
  title: string;
  rail: MarketRail;
  price: number;
}): Promise<{ ok: true; listing: MarketListing }> {
  return request("/listings", { method: "POST", body: JSON.stringify(input) });
}
