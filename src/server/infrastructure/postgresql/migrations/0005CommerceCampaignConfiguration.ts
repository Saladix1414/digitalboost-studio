import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceCampaignConfigurationMigration: PostgresMigration = {
  version: 5,
  name: "commerce-campaign-configuration",
  async up(transaction) {
    const operation = {
      correlationId: "migration:5",
      tenantId: null,
      actorId: null,
      requestedAt: new Date().toISOString(),
      authoritative: false as const,
    };
    await transaction.mutate({
      statement: `CREATE TABLE IF NOT EXISTS commerce_campaign_configurations (
        tenant_id TEXT NOT NULL,
        id TEXT NOT NULL,
        name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 160),
        audience TEXT NOT NULL CHECK (char_length(audience) BETWEEN 1 AND 500),
        discount NUMERIC NOT NULL CHECK (discount >= 0 AND discount <= 100),
        status TEXT NOT NULL CHECK (status IN ('Activa', 'Pausada')),
        source TEXT NOT NULL DEFAULT '' CHECK (char_length(source) <= 120),
        sequence JSONB NOT NULL CHECK (jsonb_typeof(sequence) = 'array'),
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, id)
      )`,
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: `CREATE INDEX IF NOT EXISTS commerce_campaign_configurations_tenant_updated_idx
        ON commerce_campaign_configurations (tenant_id, updated_at DESC)`,
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
