import type {
  PostgresMigration,
} from "../PostgresMigrationTypes";

export const commerceCatalogAndOrdersMigration:
  PostgresMigration = {
    version: 2,
    name: "commerce-catalog-and-orders",
    async up(transaction) {
      const operation = {
        correlationId: "migration:2",
        tenantId: null,
        actorId: null,
        requestedAt: new Date().toISOString(),
        authoritative: false as const,
      };

      await transaction.mutate({
        statement: `CREATE TABLE IF NOT EXISTS commerce_products (
          tenant_id TEXT NOT NULL,
          id TEXT NOT NULL,
          title TEXT NOT NULL,
          sku TEXT,
          price_amount NUMERIC(14, 2) NOT NULL CHECK (price_amount >= 0),
          currency TEXT NOT NULL CHECK (currency = 'USD'),
          stock INTEGER NOT NULL CHECK (stock >= 0),
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (tenant_id, id)
        )`,
        parameters: [],
        expectedVersion: null,
        operation,
      });

      await transaction.mutate({
        statement: `CREATE UNIQUE INDEX IF NOT EXISTS commerce_products_tenant_sku_unique
          ON commerce_products (tenant_id, sku)
          WHERE sku IS NOT NULL AND sku <> ''`,
        parameters: [],
        expectedVersion: null,
        operation,
      });

      await transaction.mutate({
        statement: `CREATE TABLE IF NOT EXISTS commerce_orders (
          tenant_id TEXT NOT NULL,
          id TEXT NOT NULL,
          customer_id TEXT,
          total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
          currency TEXT NOT NULL CHECK (currency = 'USD'),
          payment_state TEXT NOT NULL CHECK (payment_state IN ('UNPAID', 'PAID', 'REFUNDED')),
          fulfillment_state TEXT NOT NULL CHECK (fulfillment_state IN ('UNFULFILLED', 'FULFILLED', 'CANCELLED')),
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (tenant_id, id)
        )`,
        parameters: [],
        expectedVersion: null,
        operation,
      });

      await transaction.mutate({
        statement: `CREATE INDEX IF NOT EXISTS commerce_orders_tenant_created_idx
          ON commerce_orders (tenant_id, created_at DESC)`,
        parameters: [],
        expectedVersion: null,
        operation,
      });
    },
    authoritative: false,
  };
