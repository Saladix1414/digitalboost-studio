import type {
  PostgresMigration,
} from "../PostgresMigrationTypes";

export const infrastructureFoundationMigration:
  PostgresMigration = {
    version:
      1,

    name:
      "infrastructure-foundation",

    async up(
      transaction
    ):
      Promise<void> {
      await transaction.mutate({
        statement:
          `CREATE TABLE IF NOT EXISTS digitalboost_infrastructure_state (
            key TEXT PRIMARY KEY,
            value_json JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL
          )`,

        parameters:
          [],

        expectedVersion:
          null,

        operation: {
          correlationId:
            "migration:1",

          tenantId:
            null,

          actorId:
            null,

          requestedAt:
            new Date().toISOString(),

          authoritative:
            false,
        },
      });
    },

    authoritative:
      false,
  };
