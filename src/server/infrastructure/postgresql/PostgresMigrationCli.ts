import {
  createInfrastructureOperationContext,
} from "../../../infrastructure/core/types";

import {
  readInfrastructureEnvironment,
} from "../DigitalBoostInfrastructureEnvironment";

import {
  composePostgresDatabaseFromEnvironment,
} from "./PostgresServerComposition";

import {
  createPostgresMigrationRegistry,
  planPostgresMigrations,
} from "./PostgresMigrationRegistry";

import {
  readPostgresMigrationVersion,
  runPostgresMigrations,
} from "./PostgresMigrationRunner";

import {
  postgresMigrations,
} from "./migrations/index";

export async function runPostgresMigrationCli(
  source:
    NodeJS.ProcessEnv
):
  Promise<void> {
  const configuration =
    readInfrastructureEnvironment(
      source
    );

  if (
    configuration.database.provider !==
      "postgresql"
  ) {
    throw new Error(
      "PostgreSQL migration CLI requires DIGITALBOOST_INFRA_DATABASE_PROVIDER=postgresql."
    );
  }

  const composition =
    composePostgresDatabaseFromEnvironment({
      configuration,
      source,
    });

  if (
    composition.database ===
      null
  ) {
    throw new Error(
      "PostgreSQL database adapter is unavailable."
    );
  }

  try {
    const operation =
      createInfrastructureOperationContext({
        requestedAt:
          new Date().toISOString(),

        correlationId:
          "postgres-migration-cli",
      });

    let currentVersion =
      0;

    try {
      currentVersion =
        await readPostgresMigrationVersion({
          database:
            composition.database,

          operation,
        });
    } catch (
      error
    ) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      const missingMigrationTable =
        /digitalboost_schema_migrations|does not exist|42P01/i.test(
          message
        );

      if (
        !missingMigrationTable
      ) {
        throw error;
      }

      currentVersion =
        0;
    }

    const registry =
      createPostgresMigrationRegistry(
        postgresMigrations
      );

    const plan =
      planPostgresMigrations({
        currentVersion,
        migrations:
          registry,
      });

    if (
      plan.pending.length ===
        0
    ) {
      console.log(
        "[migrate] database already current"
      );

      return;
    }

    console.log(
      `[migrate] current=${plan.currentVersion} target=${plan.targetVersion} pending=${plan.pending.length}`
    );

    const result =
      await runPostgresMigrations({
        database:
          composition.database,

        migrations:
          plan.pending,

        operation,
      });

    console.log(
      `[migrate] applied=${result.applied.length}`
    );
  } finally {
    await composition.close();
  }
}

if (
  import.meta.url ===
    `file://${process.argv[1]}`
) {
  runPostgresMigrationCli(
    process.env
  ).catch(
    error => {
      console.error(
        "[migrate] failed:",
        error instanceof Error
          ? error.message
          : "unknown error"
      );

      process.exitCode =
        1;
    }
  );
}
