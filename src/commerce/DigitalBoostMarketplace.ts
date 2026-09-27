import { validateMarketAsset } from "./DigitalBoostMarketAssetGuard";
export const MARKETPLACE_CONTRACT = "cos-market-v1" as const;
export const MARKET_TAKE_RATE = 0.08;
const LS_KEY = "db-commerce-marketplace-v1";

export type MarketRail = "physical" | "digital" | "nft" | "crypto" | "gift_card";

export type MarketSeller = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly state: "pending" | "active" | "suspended";
};

export type MarketListing = {
  readonly id: string;
  readonly tenantId: string;
  readonly sellerId: string;
  readonly productId: string;
  readonly title: string;
  readonly rail: MarketRail;
  readonly price: number;
  readonly state: "draft" | "listed" | "paused";
  readonly railReady: boolean;
};

export type MarketSnapshot = {
  readonly contract: typeof MARKETPLACE_CONTRACT;
  readonly tenantId: string;
  readonly takeRate: typeof MARKET_TAKE_RATE;
  readonly sellers: readonly MarketSeller[];
  readonly listings: readonly MarketListing[];
  readonly gmv: number | null;
};

type Bag = { sellers: MarketSeller[]; listings: MarketListing[] };
const bags = new Map<string, Bag>();

function readAll(): void {
  if (bags.size) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, Bag>;
    for (const [id, bag] of Object.entries(parsed || {})) {
      if (!id || !bag) continue;
      bags.set(id, {
        sellers: Array.isArray(bag.sellers) ? bag.sellers : [],
        listings: Array.isArray(bag.listings) ? bag.listings : [],
      });
    }
  } catch {}
}
function writeAll(): void {
  try {
    const dump: Record<string, Bag> = {};
    for (const [id, bag] of bags) dump[id] = bag;
    localStorage.setItem(LS_KEY, JSON.stringify(dump));
  } catch {}
}
function bag(tenantId: string): Bag {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  const existing = bags.get(id);
  if (existing) return existing;
  const created: Bag = { sellers: [], listings: [] };
  bags.set(id, created);
  return created;
}

export function resetMarketplace(): void {
  bags.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function getMarketplaceSnapshot(tenantId: string): MarketSnapshot {
  const data = bag(tenantId);
  return {
    contract: MARKETPLACE_CONTRACT,
    tenantId: tenantId.trim(),
    takeRate: MARKET_TAKE_RATE,
    sellers: data.sellers,
    listings: data.listings,
    gmv: null,
  };
}

export function registerMarketSeller(input: { tenantId: string; name: string }) {
  const tenantId = input.tenantId.trim();
  const name = input.name.trim();
  if (!tenantId || !name) return { ok: false as const, reason: "nombre requerido" };
  const seller: MarketSeller = {
    id: "sel-" + String(bag(tenantId).sellers.length + 1),
    tenantId,
    name,
    state: "pending",
  };
  bag(tenantId).sellers.push(seller);
  writeAll();
  return seller;
}

export function activateMarketSeller(tenantId: string, sellerId: string) {
  const seller = bag(tenantId).sellers.find((s) => s.id === sellerId);
  if (!seller) return { ok: false as const, reason: "seller no existe" };
  const next = { ...seller, state: "active" as const };
  const data = bag(tenantId);
  data.sellers = data.sellers.map((s) => (s.id === sellerId ? next : s));
  writeAll();
  return next;
}

export function addMarketListing(input: {
  tenantId: string;
  sellerId: string;
  title: string;
  rail: MarketRail;
  price: number;
  productId?: string;
}) {
  const tenantId = input.tenantId.trim();
  const title = (input.title || "").trim();
  if (!tenantId || !input.sellerId || !title) {
    return { ok: false as const, reason: "seller y título requeridos" };
  }
  if (!(input.price > 0)) return { ok: false as const, reason: "precio > 0" };
  const guard = validateMarketAsset({
    title,
    rail: input.rail,
    price: input.price,
    assetRef: input.productId,
  });
  if (!guard.ok) return { ok: false as const, reason: guard.issues[0] };
  const seller = bag(tenantId).sellers.find((s) => s.id === input.sellerId);
  if (!seller) return { ok: false as const, reason: "seller no existe" };
  if (seller.state === "suspended") return { ok: false as const, reason: "seller suspendido" };
  const railReady = input.rail === "physical" || input.rail === "digital" || input.rail === "gift_card";
  const listing: MarketListing = {
    id: "lst-" + String(bag(tenantId).listings.length + 1),
    tenantId,
    sellerId: input.sellerId,
    productId: (input.productId || title).trim(),
    title,
    rail: input.rail,
    price: input.price,
    state: railReady && seller.state === "active" ? "listed" : "draft",
    railReady,
  };
  bag(tenantId).listings.push(listing);
  writeAll();
  return listing;
}

export function listPublicMarketListings() {
  readAll();
  const out: MarketListing[] = [];
  for (const bag of bags.values()) {
    for (const listing of bag.listings) {
      if (listing.state === "listed") out.push(listing);
    }
  }
  return out;
}
