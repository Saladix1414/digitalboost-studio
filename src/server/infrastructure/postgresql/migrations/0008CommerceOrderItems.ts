import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceOrderItemsMigration: PostgresMigration = {
  version: 8,
  name: "commerce-order-items-and-idempotency",
  async up(transaction) {
    const operation = {
      correlationId: "migration:8", tenantId: null, actorId: null,
      requestedAt: new Date().toISOString(), authoritative: false as const,
    };
    await transaction.mutate({
      statement: "CREATE TABLE IF NOT EXISTS commerce_order_items (tenant_id TEXT NOT NULL, order_id TEXT NOT NULL, id TEXT NOT NULL, product_id TEXT NOT NULL, title_snapshot TEXT NOT NULL, unit_price_amount NUMERIC(14,2) NOT NULL CHECK (unit_price_amount >= 0), currency TEXT NOT NULL CHECK (currency = 'USD'), quantity INTEGER NOT NULL CHECK (quantity > 0), line_total_amount NUMERIC(14,2) NOT NULL CHECK (line_total_amount >= 0), created_at TIMESTAMPTZ NOT NULL, PRIMARY KEY (tenant_id, id), FOREIGN KEY (tenant_id, order_id) REFERENCES commerce_orders (tenant_id, id) ON DELETE CASCADE)",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "CREATE INDEX IF NOT EXISTS commerce_order_items_order_idx ON commerce_order_items (tenant_id, order_id)",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "CREATE TABLE IF NOT EXISTS commerce_order_idempotency (tenant_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, order_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, PRIMARY KEY (tenant_id, idempotency_key), FOREIGN KEY (tenant_id, order_id) REFERENCES commerce_orders (tenant_id, id) ON DELETE CASCADE)",
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
