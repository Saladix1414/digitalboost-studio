import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceMarketplaceMigration: PostgresMigration = {
  version: 3,
  name: "commerce-marketplace-sellers-and-listings",
  async up(transaction) {
    const operation = {
      correlationId: "migration:3",
      tenantId: null,
      actorId: null,
      requestedAt: new Date().toISOString(),
      authoritative: false as const,
    };
    await transaction.mutate({
      statement: `CREATE TABLE IF NOT EXISTS commerce_market_sellers (
        tenant_id TEXT NOT NULL,
        id TEXT NOT NULL,
        name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
        state TEXT NOT NULL CHECK (state IN ('pending', 'active', 'suspended')),
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, id)
      )`,
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: `CREATE TABLE IF NOT EXISTS commerce_market_listings (
        tenant_id TEXT NOT NULL,
        id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
        rail TEXT NOT NULL CHECK (rail IN ('physical', 'digital', 'nft', 'crypto', 'gift_card')),
        price NUMERIC(14, 2) NOT NULL CHECK (price > 0),
        state TEXT NOT NULL CHECK (state IN ('draft', 'listed', 'paused')),
        rail_ready BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, id),
        CONSTRAINT commerce_market_listings_seller_fk
          FOREIGN KEY (tenant_id, seller_id)
          REFERENCES commerce_market_sellers (tenant_id, id)
      )`,
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: `CREATE INDEX IF NOT EXISTS commerce_market_listings_public_idx
        ON commerce_market_listings (created_at DESC)
        WHERE state = 'listed' AND rail_ready = TRUE`,
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
