import assert from "node:assert/strict";
import test from "node:test";

import {
  checkPostgresReadiness,
} from "../../src/server/infrastructure/postgresql/PostgresReadiness.ts";

import {
  createPostgresDatabaseAdapter,
} from "../../src/server/infrastructure/postgresql/PostgresDatabaseAdapter.ts";

import type {
  PostgresClientLike,
  PostgresPoolLike,
  PostgresQueryResult,
} from "../../src/server/infrastructure/postgresql/index.ts";

class Pool
  implements PostgresPoolLike {
  fail =
    false;

  async query<T = unknown>(
    statement:
      string
  ):
    Promise<
      PostgresQueryResult<T>
    > {
    if (
      this.fail &&
      statement ===
        "SELECT 1 AS ok"
    ) {
      throw new Error(
        "secret database failure"
      );
    }

    return {
      rows:
        [] as T[],

      rowCount:
        1,
    };
  }

  async connect():
    Promise<
      PostgresClientLike
    > {
    throw new Error(
      "not used"
    );
  }
}

test(
  "disabled postgres readiness is explicit",
  async () => {
    const readiness =
      await checkPostgresReadiness({
        enabled:
          false,

        database:
          null,

        now:
          () =>
            "2026-10-07T23:00:00.000Z",
      });

    assert.equal(
      readiness.status,
      "disabled"
    );

    assert.equal(
      readiness.authoritative,
      false
    );
  }
);

test(
  "enabled postgres readiness uses database health",
  async () => {
    const pool =
      new Pool();

    const database =
      createPostgresDatabaseAdapter(
        pool,
        {
          now:
            () =>
              "2026-10-07T23:01:00.000Z",
        }
      );

    const readiness =
      await checkPostgresReadiness({
        enabled:
          true,

        database,
      });

    assert.equal(
      readiness.status,
      "ready"
    );
  }
);

test(
  "postgres readiness does not leak driver failure detail",
  async () => {
    const pool =
      new Pool();

    pool.fail =
      true;

    const database =
      createPostgresDatabaseAdapter(
        pool
      );

    const readiness =
      await checkPostgresReadiness({
        enabled:
          true,

        database,
      });

    assert.equal(
      readiness.status,
      "unavailable"
    );

    assert.doesNotMatch(
      JSON.stringify(
        readiness
      ),
      /secret database failure/
    );
  }
);
