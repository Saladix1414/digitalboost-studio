import assert from "node:assert/strict";
import test from "node:test";

import {
  PostgresExpectedVersionUnsupportedError,
  createPostgresDatabaseAdapter,
} from "../../src/server/infrastructure/postgresql/index.ts";

import {
  createInfrastructureOperationContext,
} from "../../src/infrastructure/core/index.ts";

import type {
  PostgresClientLike,
  PostgresPoolLike,
  PostgresQueryResult,
} from "../../src/server/infrastructure/postgresql/index.ts";

function operation() {
  return createInfrastructureOperationContext({
    requestedAt:
      "2026-10-07T22:00:00.000Z",

    correlationId:
      "corr_phase34e",
  });
}

class FakePool
  implements PostgresPoolLike {
  readonly statements:
    string[] = [];

  failHealth =
    false;

  async query<T = unknown>(
    statement:
      string,
    _parameters?:
      readonly unknown[]
  ):
    Promise<
      PostgresQueryResult<T>
    > {
    this.statements.push(
      statement
    );

    if (
      this.failHealth &&
      statement ===
        "SELECT 1 AS ok"
    ) {
      throw new Error(
        "database unavailable secret=hidden"
      );
    }

    if (
      statement.startsWith(
        "SELECT"
      )
    ) {
      return {
        rows:
          [
            {
              id:
                "row-1",
            },
          ] as T[],

        rowCount:
          1,
      };
    }

    return {
      rows:
        [],

      rowCount:
        2,
    };
  }

  async connect():
    Promise<
      PostgresClientLike
    > {
    throw new Error(
      "connect not used in this test"
    );
  }
}

test(
  "postgres adapter maps reads to DatabasePort without authority",
  async () => {
    const pool =
      new FakePool();

    const database =
      createPostgresDatabaseAdapter(
        pool,
        {
          now:
            () =>
              "2026-10-07T22:01:00.000Z",
        }
      );

    const result =
      await database.query<{
        id:
          string;
      }>({
        statement:
          "SELECT id FROM records",

        parameters:
          [],

        operation:
          operation(),
      });

    assert.deepEqual(
      result.rows,
      [
        {
          id:
            "row-1",
        },
      ]
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.metadata.source,
      "postgresql"
    );
  }
);

test(
  "postgres adapter reports affected rows without inventing version",
  async () => {
    const pool =
      new FakePool();

    const database =
      createPostgresDatabaseAdapter(
        pool
      );

    const result =
      await database.mutate({
        statement:
          "UPDATE records SET active = $1",

        parameters:
          [true],

        expectedVersion:
          null,

        operation:
          operation(),
      });

    assert.equal(
      result.affectedRows,
      2
    );

    assert.equal(
      result.version,
      null
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "generic postgres mutation fails closed for expectedVersion",
  async () => {
    const database =
      createPostgresDatabaseAdapter(
        new FakePool()
      );

    await assert.rejects(
      () =>
        database.mutate({
          statement:
            "UPDATE records SET active = true",

          parameters:
            [],

          expectedVersion:
            7,

          operation:
            operation(),
        }),
      PostgresExpectedVersionUnsupportedError
    );
  }
);

test(
  "postgres health never leaks driver error details",
  async () => {
    const pool =
      new FakePool();

    pool.failHealth =
      true;

    const database =
      createPostgresDatabaseAdapter(
        pool,
        {
          now:
            () =>
              "2026-10-07T22:02:00.000Z",
        }
      );

    const health =
      await database.health();

    assert.equal(
      health.state,
      "unavailable"
    );

    assert.equal(
      health.authoritative,
      false
    );

    assert.equal(
      health.detail,
      "PostgreSQL health check failed."
    );

    assert.doesNotMatch(
      JSON.stringify(
        health
      ),
      /secret=hidden/
    );
  }
);
