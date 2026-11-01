import { randomUUID } from "node:crypto";
import type { DatabasePort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type { MarketListing, MarketRail, MarketSeller } from "../../commerce/DigitalBoostMarketplace";
import type { CommercePrincipal } from "./CommerceRepository";

type SellerRow = { id: string; name: string; state: MarketSeller["state"] };
type ListingRow = {
  id: string; tenant_id?: string; seller_id: string; product_id: string; title: string;
  rail: MarketRail; price: string | number; state: MarketListing["state"];
  rail_ready: boolean;
};

function operation(principal: CommercePrincipal) {
  return createInfrastructureOperationContext({
    tenantId: principal.tenantId,
    actorId: principal.actorId,
    correlationId: randomUUID(),
    requestedAt: new Date().toISOString(),
  });
}

function mapSeller(row: SellerRow, tenantId: string): MarketSeller {
  return { id: row.id, tenantId, name: row.name, state: row.state };
}

function mapListing(row: ListingRow, tenantId: string): MarketListing {
  return {
    id: row.id, tenantId, sellerId: row.seller_id, productId: row.product_id,
    title: row.title, rail: row.rail, price: Number(row.price),
    state: row.state, railReady: row.rail_ready,
  };
}

export class MarketplaceRepository {
  constructor(private readonly database: DatabasePort) {}

  async listSellers(principal: CommercePrincipal): Promise<MarketSeller[]> {
    const result = await this.database.query<SellerRow>({
      statement: `SELECT id, name, state FROM commerce_market_sellers
        WHERE tenant_id = $1 ORDER BY created_at, id`,
      parameters: [principal.tenantId], operation: operation(principal),
    });
    return result.rows.map(row => mapSeller(row, principal.tenantId));
  }

  async listListings(principal: CommercePrincipal): Promise<MarketListing[]> {
    const result = await this.database.query<ListingRow>({
      statement: `SELECT id, seller_id, product_id, title, rail, price, state, rail_ready
        FROM commerce_market_listings WHERE tenant_id = $1 ORDER BY created_at DESC, id`,
      parameters: [principal.tenantId], operation: operation(principal),
    });
    return result.rows.map(row => mapListing(row, principal.tenantId));
  }

  async listPublicListings(): Promise<MarketListing[]> {
    const result = await this.database.query<ListingRow>({
      statement: `SELECT tenant_id, id, seller_id, product_id, title, rail, price, state, rail_ready
        FROM commerce_market_listings
        WHERE state = 'listed' AND rail_ready = TRUE
        ORDER BY created_at DESC, tenant_id, id LIMIT 500`,
      parameters: [],
      operation: createInfrastructureOperationContext({
        tenantId: null,
        actorId: "public-market-read",
        correlationId: randomUUID(),
        requestedAt: new Date().toISOString(),
      }),
    });
    return result.rows.map(row => mapListing(row, row.tenant_id ?? ""));
  }

  async createSeller(principal: CommercePrincipal, input: { id: string; name: string }): Promise<MarketSeller> {
    const now = new Date().toISOString();
    await this.database.mutate({
      statement: `INSERT INTO commerce_market_sellers
        (tenant_id, id, name, state, created_at, updated_at)
        VALUES ($1, $2, $3, 'pending', $4, $4)
        ON CONFLICT (tenant_id, id) DO UPDATE SET name = EXCLUDED.name,
          updated_at = EXCLUDED.updated_at`,
      parameters: [principal.tenantId, input.id, input.name, now],
      expectedVersion: null,
      operation: operation(principal),
    });
    const result = await this.database.query<SellerRow>({
      statement: `SELECT id, name, state FROM commerce_market_sellers
        WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, input.id], operation: operation(principal),
    });
    return mapSeller(result.rows[0], principal.tenantId);
  }

  async activateSeller(principal: CommercePrincipal, sellerId: string): Promise<MarketSeller | null> {
    const result = await this.database.mutate({
      statement: `UPDATE commerce_market_sellers SET state = 'active', updated_at = $3
        WHERE tenant_id = $1 AND id = $2 AND state = 'pending'`,
      parameters: [principal.tenantId, sellerId, new Date().toISOString()],
      expectedVersion: null,
      operation: operation(principal),
    });
    if (!result.affectedRows) return null;
    const sellerResult = await this.database.query<SellerRow>({
      statement: `SELECT id, name, state FROM commerce_market_sellers
        WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, sellerId], operation: operation(principal),
    });
    return sellerResult.rows[0] ? mapSeller(sellerResult.rows[0], principal.tenantId) : null;
  }

  async createListing(principal: CommercePrincipal, input: {
    id: string; sellerId: string; productId: string; title: string;
    rail: MarketRail; price: number; railReady: boolean;
  }): Promise<MarketListing | null> {
    const sellerResult = await this.database.query<SellerRow>({
      statement: `SELECT id, name, state FROM commerce_market_sellers
        WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, input.sellerId], operation: operation(principal),
    });
    const seller = sellerResult.rows[0];
    if (!seller || seller.state !== "active") return null;
    const now = new Date().toISOString();
    const state: MarketListing["state"] = input.railReady ? "listed" : "draft";
    const inserted = await this.database.mutate({
      statement: `INSERT INTO commerce_market_listings
        (tenant_id, id, seller_id, product_id, title, rail, price, state, rail_ready, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
        ON CONFLICT (tenant_id, id) DO NOTHING`,
      parameters: [principal.tenantId, input.id, input.sellerId, input.productId,
        input.title, input.rail, input.price, state, input.railReady, now],
      expectedVersion: null,
      operation: operation(principal),
    });
    if (!inserted.affectedRows) return null;
    const result = await this.database.query<ListingRow>({
      statement: `SELECT id, seller_id, product_id, title, rail, price, state, rail_ready
        FROM commerce_market_listings WHERE tenant_id = $1 AND id = $2`,
      parameters: [principal.tenantId, input.id], operation: operation(principal),
    });
    return result.rows[0] ? mapListing(result.rows[0], principal.tenantId) : null;
  }
}
