import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceCurrenciesMigration: PostgresMigration = {
  version: 9,
  name: "commerce-usd-ars-currency-support",
  async up(transaction) {
    const operation = {
      correlationId: "migration:9", tenantId: null, actorId: null,
      requestedAt: new Date().toISOString(), authoritative: false as const,
    };
    await transaction.mutate({
      statement: "ALTER TABLE commerce_products ADD COLUMN IF NOT EXISTS price_ars_amount NUMERIC(14,2) CHECK (price_ars_amount IS NULL OR price_ars_amount >= 0)",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "ALTER TABLE commerce_orders DROP CONSTRAINT IF EXISTS commerce_orders_currency_check",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "ALTER TABLE commerce_orders ADD CONSTRAINT commerce_orders_currency_check CHECK (currency IN ('USD', 'ARS'))",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "ALTER TABLE commerce_order_items DROP CONSTRAINT IF EXISTS commerce_order_items_currency_check",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "ALTER TABLE commerce_order_items ADD CONSTRAINT commerce_order_items_currency_check CHECK (currency IN ('USD', 'ARS'))",
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
