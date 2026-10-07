import type {
  DatabasePort,
  DatabaseTransactionPort,
} from "../../../infrastructure/core/database";

import type {
  InfrastructureOperationContext,
} from "../../../infrastructure/core/types";

import type {
  PostgresMigration,
  PostgresMigrationRecord,
} from "./PostgresMigrationTypes";

export type PostgresMigrationRunnerResult = {
  readonly applied:
    readonly PostgresMigrationRecord[];

  readonly authoritative:
    false;
};

async function ensureMigrationTable(
  transaction:
    DatabaseTransactionPort,

  operation:
    InfrastructureOperationContext
):
  Promise<void> {
  await transaction.mutate({
    statement:
      `CREATE TABLE IF NOT EXISTS digitalboost_schema_migrations (
        version BIGINT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL
      )`,

    parameters:
      [],

    expectedVersion:
      null,

    operation,
  });
}

export async function readPostgresMigrationVersion(
  input: {
    readonly database:
      DatabasePort;

    readonly operation:
      InfrastructureOperationContext;
  }
):
  Promise<number> {
  const result =
    await input.database.query<{
      version:
        number | string;
    }>({
      statement:
        `SELECT COALESCE(MAX(version), 0) AS version
         FROM digitalboost_schema_migrations`,

      parameters:
        [],

      operation:
        input.operation,
    });

  if (
    result.rows.length ===
      0
  ) {
    return 0;
  }

  const raw =
    result.rows[0].version;

  const version =
    typeof raw ===
      "number"
      ? raw
      : Number(raw);

  if (
    !Number.isSafeInteger(
      version
    ) ||
    version <
      0
  ) {
    throw new Error(
      "Persisted PostgreSQL migration version is invalid."
    );
  }

  return version;
}

export async function runPostgresMigrations(
  input: {
    readonly database:
      DatabasePort;

    readonly migrations:
      readonly PostgresMigration[];

    readonly operation:
      InfrastructureOperationContext;

    readonly now?:
      () => string;
  }
):
  Promise<
    PostgresMigrationRunnerResult
  > {
  const now =
    input.now ??
    (() =>
      new Date().toISOString());

  const applied:
    PostgresMigrationRecord[] =
    [];

  for (
    const migration
    of input.migrations
  ) {
    await input.database.transaction(
      "read-write",
      async transaction => {
        await ensureMigrationTable(
          transaction,
          input.operation
        );

        await migration.up(
          transaction
        );

        const appliedAt =
          now();

        await transaction.mutate({
          statement:
            `INSERT INTO digitalboost_schema_migrations
              (version, name, applied_at)
             VALUES ($1, $2, $3)`,

          parameters: [
            migration.version,
            migration.name,
            appliedAt,
          ],

          expectedVersion:
            null,

          operation:
            input.operation,
        });

        applied.push({
          version:
            migration.version,

          name:
            migration.name,

          appliedAt,

          authoritative:
            false,
        });
      }
    );
  }

  return {
    applied,
    authoritative:
      false,
  };
}
