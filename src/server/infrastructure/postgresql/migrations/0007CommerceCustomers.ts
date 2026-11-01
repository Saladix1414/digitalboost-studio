import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceCustomersMigration: PostgresMigration = {
  version: 7,
  name: "commerce-customers",
  async up(transaction) {
    const operation = {
      correlationId: "migration:7", tenantId: null, actorId: null,
      requestedAt: new Date().toISOString(), authoritative: false as const,
    };
    await transaction.mutate({
      statement: [
        "CREATE TABLE IF NOT EXISTS commerce_customers (",
        "tenant_id TEXT NOT NULL, id TEXT NOT NULL,",
        "name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),",
        "email TEXT, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL,",
        "PRIMARY KEY (tenant_id, id))",
      ].join(" "),
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "CREATE INDEX IF NOT EXISTS commerce_customers_tenant_name_idx ON commerce_customers (tenant_id, name)",
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
