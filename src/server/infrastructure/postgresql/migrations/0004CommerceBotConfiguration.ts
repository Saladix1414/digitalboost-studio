import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceBotConfigurationMigration: PostgresMigration = {
  version: 4,
  name: "commerce-bot-configuration",
  async up(transaction) {
    const operation = {
      correlationId: "migration:4",
      tenantId: null,
      actorId: null,
      requestedAt: new Date().toISOString(),
      authoritative: false as const,
    };
    await transaction.mutate({
      statement: `CREATE TABLE IF NOT EXISTS commerce_sales_bots (
        tenant_id TEXT NOT NULL,
        id TEXT NOT NULL,
        name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
        skills JSONB NOT NULL CHECK (jsonb_typeof(skills) = 'array'),
        state TEXT NOT NULL DEFAULT 'draft' CHECK (state = 'draft'),
        personality TEXT NOT NULL DEFAULT 'directo y breve' CHECK (char_length(personality) <= 240),
        channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'mail_draft')),
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, id)
      )`,
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: `CREATE TABLE IF NOT EXISTS commerce_bot_rules (
        tenant_id TEXT NOT NULL,
        id TEXT NOT NULL,
        bot_id TEXT NOT NULL,
        trigger_key TEXT NOT NULL CHECK (trigger_key IN ('cart.idle', 'order.unpaid', 'stock.zero', 'listing.listed')),
        action TEXT NOT NULL CHECK (action IN ('draft_notice', 'draft_offer')),
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, id),
        CONSTRAINT commerce_bot_rules_bot_fk
          FOREIGN KEY (tenant_id, bot_id)
          REFERENCES commerce_sales_bots (tenant_id, id)
      )`,
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: `CREATE INDEX IF NOT EXISTS commerce_bot_rules_tenant_bot_idx
        ON commerce_bot_rules (tenant_id, bot_id, created_at)`,
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
