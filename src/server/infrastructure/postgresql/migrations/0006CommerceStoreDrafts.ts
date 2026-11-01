import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceStoreDraftsMigration: PostgresMigration = {
  version: 6,
  name: "commerce-store-drafts",
  async up(transaction) {
    const operation = {
      correlationId: "migration:6", tenantId: null, actorId: null,
      requestedAt: new Date().toISOString(), authoritative: false as const,
    };
    await transaction.mutate({
      statement: `CREATE TABLE IF NOT EXISTS commerce_store_drafts (
        tenant_id TEXT NOT NULL,
        site_id TEXT NOT NULL,
        page_key TEXT NOT NULL CHECK (page_key IN ('Inicio', 'Productos', 'Colecciones', 'Nosotros', 'Contacto')),
        blocks JSONB NOT NULL CHECK (jsonb_typeof(blocks) = 'array'),
        theme JSONB NOT NULL CHECK (jsonb_typeof(theme) = 'object'),
        updated_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, site_id, page_key)
      )`,
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: `CREATE INDEX IF NOT EXISTS commerce_store_drafts_tenant_updated_idx
        ON commerce_store_drafts (tenant_id, updated_at DESC)`,
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
