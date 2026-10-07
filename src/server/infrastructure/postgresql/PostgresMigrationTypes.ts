import type {
  DatabaseTransactionPort,
} from "../../../infrastructure/core/database";

export type PostgresMigrationVersion =
  number;

export type PostgresMigration = {
  readonly version:
    PostgresMigrationVersion;

  readonly name:
    string;

  readonly up:
    (
      transaction:
        DatabaseTransactionPort
    ) => Promise<void>;

  readonly authoritative:
    false;
};

export type PostgresMigrationRecord = {
  readonly version:
    PostgresMigrationVersion;

  readonly name:
    string;

  readonly appliedAt:
    string;

  readonly authoritative:
    false;
};

export type PostgresMigrationPlan = {
  readonly currentVersion:
    PostgresMigrationVersion;

  readonly targetVersion:
    PostgresMigrationVersion;

  readonly pending:
    readonly PostgresMigration[];

  readonly authoritative:
    false;
};
