import {
  Pool,
} from "pg";

import type {
  PoolClient,
} from "pg";

import type {
  DatabasePort,
} from "../../../infrastructure/core/database";

import type {
  InfrastructureProviderConfiguration,
} from "../../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironmentSource,
} from "../DigitalBoostInfrastructureEnvironment";

import {
  createPostgresDatabaseAdapter,
} from "./PostgresDatabaseAdapter";

import type {
  PostgresClientLike,
  PostgresPoolLike,
  PostgresQueryResult,
} from "./PostgresDriverTypes";

export type ManagedPostgresPoolLike =
  PostgresPoolLike & {
    end():
      Promise<void>;
  };

export type PostgresPoolFactory =
  (
    input: {
      readonly connectionString:
        string;
    }
  ) =>
    ManagedPostgresPoolLike;

export type PostgresServerComposition = {
  readonly enabled:
    boolean;

  readonly database:
    DatabasePort | null;

  readonly authoritative:
    false;

  close():
    Promise<void>;
};

function adaptNodePostgresClient(
  client:
    PoolClient
):
  PostgresClientLike {
  return {
    async query<T = unknown>(
      statement:
        string,

      parameters:
        readonly unknown[] = []
    ):
      Promise<
        PostgresQueryResult<T>
      > {
      const result =
        await client.query(
          statement,
          [...parameters]
        );

      return {
        rows:
          result.rows as readonly T[],

        rowCount:
          result.rowCount,
      };
    },

    release():
      void {
      client.release();
    },
  };
}

function createNodePostgresPool(
  input: {
    readonly connectionString:
      string;
  }
):
  ManagedPostgresPoolLike {
  const pool =
    new Pool({
      connectionString:
        input.connectionString,
    });

  return {
    async query<T = unknown>(
      statement:
        string,

      parameters:
        readonly unknown[] = []
    ):
      Promise<
        PostgresQueryResult<T>
      > {
      const result =
        await pool.query(
          statement,
          [...parameters]
        );

      return {
        rows:
          result.rows as readonly T[],

        rowCount:
          result.rowCount,
      };
    },

    async connect():
      Promise<
        PostgresClientLike
      > {
      const client =
        await pool.connect();

      return adaptNodePostgresClient(
        client
      );
    },

    async end():
      Promise<void> {
      await pool.end();
    },
  };
}

function requireDatabaseUrl(
  source:
    InfrastructureEnvironmentSource
):
  string {
  const value =
    source.DATABASE_URL?.trim();

  if (
    value ===
      undefined ||
    value.length ===
      0
  ) {
    throw new Error(
      "DATABASE_URL is required when PostgreSQL infrastructure is enabled."
    );
  }

  return value;
}

export function composePostgresDatabaseFromEnvironment(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;

    readonly poolFactory?:
      PostgresPoolFactory;
  }
):
  PostgresServerComposition {
  if (
    input.configuration.database.provider ===
      "disabled"
  ) {
    return {
      enabled:
        false,

      database:
        null,

      authoritative:
        false,

      async close():
        Promise<void> {
        // No pool exists in disabled mode.
      },
    };
  }

  if (
    input.configuration.database.provider !==
      "postgresql"
  ) {
    throw new Error(
      "Unsupported server database provider."
    );
  }

  if (
    input.configuration.database.connectionReference !==
      "env:DATABASE_URL"
  ) {
    throw new Error(
      "PostgreSQL server composition requires env:DATABASE_URL."
    );
  }

  const connectionString =
    requireDatabaseUrl(
      input.source
    );

  const poolFactory =
    input.poolFactory ??
    createNodePostgresPool;

  const pool =
    poolFactory({
      connectionString,
    });

  const database =
    createPostgresDatabaseAdapter(
      pool,
      {
        source:
          "postgresql",
      }
    );

  let closed =
    false;

  return {
    enabled:
      true,

    database,

    authoritative:
      false,

    async close():
      Promise<void> {
      if (closed) {
        return;
      }

      closed =
        true;

      await pool.end();
    },
  };
}
