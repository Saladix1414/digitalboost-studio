import type {
  DatabaseMutation,
  DatabasePort,
  DatabaseQuery,
  DatabaseReadResult,
  DatabaseTransactionMode,
  DatabaseTransactionPort,
  DatabaseWriteResult,
} from "../../../infrastructure/core/database";

import type {
  InfrastructureHealth,
  InfrastructureResultMetadata,
} from "../../../infrastructure/core/types";

import type {
  PostgresPoolLike,
  PostgresQueryable,
} from "./PostgresDriverTypes";

export type PostgresDatabaseAdapterOptions = {
  readonly source?:
    string;

  readonly now?:
    () => string;
};

export class PostgresExpectedVersionUnsupportedError
  extends Error {
  constructor() {
    super(
      "Generic PostgreSQL mutations cannot enforce expectedVersion. Use a domain repository with explicit optimistic concurrency."
    );

    this.name =
      "PostgresExpectedVersionUnsupportedError";
  }
}

function createMetadata(
  source:
    string,

  now:
    () => string
):
  InfrastructureResultMetadata {
  return {
    observedAt:
      now(),

    source,

    authoritative:
      false,
  };
}

function assertMutationSupported(
  mutation:
    DatabaseMutation
):
  void {
  if (
    mutation.expectedVersion !==
      null
  ) {
    throw new PostgresExpectedVersionUnsupportedError();
  }
}

function createTransactionPort(
  queryable:
    PostgresQueryable,

  mode:
    DatabaseTransactionMode,

  source:
    string,

  now:
    () => string
):
  DatabaseTransactionPort {
  return {
    mode,

    async query<T>(
      input:
        DatabaseQuery
    ):
      Promise<
        DatabaseReadResult<T>
      > {
      const result =
        await queryable.query<T>(
          input.statement,
          input.parameters
        );

      return {
        rows:
          result.rows,

        metadata:
          createMetadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },

    async mutate(
      input:
        DatabaseMutation
    ):
      Promise<
        DatabaseWriteResult
      > {
      if (
        mode ===
          "read-only"
      ) {
        throw new Error(
          "Cannot mutate inside a read-only PostgreSQL transaction."
        );
      }

      assertMutationSupported(
        input
      );

      const result =
        await queryable.query(
          input.statement,
          input.parameters
        );

      return {
        affectedRows:
          result.rowCount ??
          0,

        version:
          null,

        metadata:
          createMetadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },
  };
}

export function createPostgresDatabaseAdapter(
  pool:
    PostgresPoolLike,

  options:
    PostgresDatabaseAdapterOptions = {}
):
  DatabasePort {
  const source =
    options.source ??
    "postgresql";

  const now =
    options.now ??
    (() =>
      new Date().toISOString());

  return {
    async health():
      Promise<
        InfrastructureHealth
      > {
      try {
        await pool.query(
          "SELECT 1 AS ok"
        );

        return {
          state:
            "ready",

          checkedAt:
            now(),

          detail:
            null,

          authoritative:
            false,
        };
      } catch {
        return {
          state:
            "unavailable",

          checkedAt:
            now(),

          detail:
            "PostgreSQL health check failed.",

          authoritative:
            false,
        };
      }
    },

    async query<T>(
      input:
        DatabaseQuery
    ):
      Promise<
        DatabaseReadResult<T>
      > {
      const result =
        await pool.query<T>(
          input.statement,
          input.parameters
        );

      return {
        rows:
          result.rows,

        metadata:
          createMetadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },

    async mutate(
      input:
        DatabaseMutation
    ):
      Promise<
        DatabaseWriteResult
      > {
      assertMutationSupported(
        input
      );

      const result =
        await pool.query(
          input.statement,
          input.parameters
        );

      return {
        affectedRows:
          result.rowCount ??
          0,

        version:
          null,

        metadata:
          createMetadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },

    async transaction<T>(
      mode:
        DatabaseTransactionMode,

      execute:
        (
          transaction:
            DatabaseTransactionPort
        ) => Promise<T>
    ):
      Promise<T> {
      const client =
        await pool.connect();

      try {
        if (
          mode ===
            "read-only"
        ) {
          await client.query(
            "BEGIN READ ONLY"
          );
        } else {
          await client.query(
            "BEGIN"
          );
        }

        const transaction =
          createTransactionPort(
            client,
            mode,
            source,
            now
          );

        const result =
          await execute(
            transaction
          );

        await client.query(
          "COMMIT"
        );

        return result;
      } catch (
        error
      ) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {
          // Preserve the original transaction error.
        }

        throw error;
      } finally {
        client.release();
      }
    },
  };
}
