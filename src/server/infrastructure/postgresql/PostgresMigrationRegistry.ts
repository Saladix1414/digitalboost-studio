import type {
  PostgresMigration,
  PostgresMigrationPlan,
  PostgresMigrationVersion,
} from "./PostgresMigrationTypes";

function assertMigration(
  migration:
    PostgresMigration
):
  void {
  if (
    !Number.isInteger(
      migration.version
    ) ||
    migration.version <=
      0
  ) {
    throw new Error(
      "PostgreSQL migration version must be a positive integer."
    );
  }

  if (
    migration.name.trim().length ===
      0
  ) {
    throw new Error(
      "PostgreSQL migration name is required."
    );
  }

  if (
    migration.authoritative !==
      false
  ) {
    throw new Error(
      "PostgreSQL migrations must remain non authoritative."
    );
  }
}

export function createPostgresMigrationRegistry(
  migrations:
    readonly PostgresMigration[]
):
  readonly PostgresMigration[] {
  const sorted =
    [...migrations].sort(
      (
        a,
        b
      ) =>
        a.version -
        b.version
    );

  let previous:
    number | null =
    null;

  for (
    const migration
    of sorted
  ) {
    assertMigration(
      migration
    );

    if (
      previous !==
        null &&
      migration.version ===
        previous
    ) {
      throw new Error(
        `Duplicate PostgreSQL migration version: ${migration.version}.`
      );
    }

    previous =
      migration.version;
  }

  return Object.freeze(
    sorted
  );
}

export function planPostgresMigrations(
  input: {
    readonly currentVersion:
      PostgresMigrationVersion;

    readonly migrations:
      readonly PostgresMigration[];
  }
):
  PostgresMigrationPlan {
  if (
    !Number.isInteger(
      input.currentVersion
    ) ||
    input.currentVersion <
      0
  ) {
    throw new Error(
      "Current PostgreSQL migration version must be a non-negative integer."
    );
  }

  const registry =
    createPostgresMigrationRegistry(
      input.migrations
    );

  const pending =
    registry.filter(
      migration =>
        migration.version >
          input.currentVersion
    );

  const targetVersion =
    registry.length ===
      0
      ? input.currentVersion
      : Math.max(
          input.currentVersion,
          registry[
            registry.length -
              1
          ].version
        );

  return {
    currentVersion:
      input.currentVersion,

    targetVersion,

    pending,

    authoritative:
      false,
  };
}
