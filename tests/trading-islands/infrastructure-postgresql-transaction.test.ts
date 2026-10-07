import assert from "node:assert/strict";
import test from "node:test";

import {
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
      "2026-10-07T22:10:00.000Z",
  });
}

class FakeClient
  implements PostgresClientLike {
  readonly statements:
    string[] = [];

  released =
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

    return {
      rows:
        [] as T[],

      rowCount:
        1,
    };
  }

  release():
    void {
    this.released =
      true;
  }
}

class TransactionPool
  implements PostgresPoolLike {
  readonly client =
    new FakeClient();

  async query<T = unknown>(
    _statement:
      string,
    _parameters?:
      readonly unknown[]
  ):
    Promise<
      PostgresQueryResult<T>
    > {
    return {
      rows:
        [] as T[],

      rowCount:
        0,
    };
  }

  async connect():
    Promise<
      PostgresClientLike
    > {
    return this.client;
  }
}

test(
  "read-write transaction commits and releases client",
  async () => {
    const pool =
      new TransactionPool();

    const database =
      createPostgresDatabaseAdapter(
        pool
      );

    const value =
      await database.transaction(
        "read-write",
        async transaction => {
          await transaction.mutate({
            statement:
              "UPDATE jobs SET state = $1",

            parameters:
              ["done"],

            expectedVersion:
              null,

            operation:
              operation(),
          });

          return "committed";
        }
      );

    assert.equal(
      value,
      "committed"
    );

    assert.deepEqual(
      pool.client.statements,
      [
        "BEGIN",
        "UPDATE jobs SET state = $1",
        "COMMIT",
      ]
    );

    assert.equal(
      pool.client.released,
      true
    );
  }
);

test(
  "failed transaction rolls back and releases client",
  async () => {
    const pool =
      new TransactionPool();

    const database =
      createPostgresDatabaseAdapter(
        pool
      );

    await assert.rejects(
      () =>
        database.transaction(
          "read-write",
          async () => {
            throw new Error(
              "domain operation failed"
            );
          }
        ),
      /domain operation failed/
    );

    assert.deepEqual(
      pool.client.statements,
      [
        "BEGIN",
        "ROLLBACK",
      ]
    );

    assert.equal(
      pool.client.released,
      true
    );
  }
);

test(
  "read-only transaction blocks mutation and rolls back",
  async () => {
    const pool =
      new TransactionPool();

    const database =
      createPostgresDatabaseAdapter(
        pool
      );

    await assert.rejects(
      () =>
        database.transaction(
          "read-only",
          async transaction => {
            await transaction.mutate({
              statement:
                "DELETE FROM records",

              parameters:
                [],

              expectedVersion:
                null,

              operation:
                operation(),
            });
          }
        ),
      /read-only PostgreSQL transaction/
    );

    assert.deepEqual(
      pool.client.statements,
      [
        "BEGIN READ ONLY",
        "ROLLBACK",
      ]
    );

    assert.equal(
      pool.client.released,
      true
    );
  }
);
