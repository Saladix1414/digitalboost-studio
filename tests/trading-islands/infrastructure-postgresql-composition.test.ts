import assert from "node:assert/strict";
import test from "node:test";

import {
  composePostgresDatabaseFromEnvironment,
} from "../../src/server/infrastructure/postgresql/PostgresServerComposition.ts";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

import type {
  ManagedPostgresPoolLike,
  PostgresPoolFactory,
} from "../../src/server/infrastructure/postgresql/PostgresServerComposition.ts";

import type {
  PostgresClientLike,
  PostgresQueryResult,
} from "../../src/server/infrastructure/postgresql/index.ts";

function fakePool():
  ManagedPostgresPoolLike {
  return {
    async query<T = unknown>(
      statement:
        string
    ):
      Promise<
        PostgresQueryResult<T>
      > {
      if (
        statement ===
          "SELECT 1 AS ok"
      ) {
        return {
          rows:
            [
              {
                ok:
                  1,
              },
            ] as T[],

          rowCount:
            1,
        };
      }

      return {
        rows:
          [] as T[],

        rowCount:
          0,
      };
    },

    async connect():
      Promise<
        PostgresClientLike
      > {
      throw new Error(
        "connect not required"
      );
    },

    async end():
      Promise<void> {
      // fake lifecycle
    },
  };
}

test(
  "disabled database configuration creates no postgres pool",
  async () => {
    const config =
      readInfrastructureEnvironment({
        NODE_ENV:
          "development",
      });

    let factoryCalls =
      0;

    const factory:
      PostgresPoolFactory =
      () => {
        factoryCalls +=
          1;

        return fakePool();
      };

    const composition =
      composePostgresDatabaseFromEnvironment({
        configuration:
          config,

        source: {},

        poolFactory:
          factory,
      });

    assert.equal(
      composition.enabled,
      false
    );

    assert.equal(
      composition.database,
      null
    );

    assert.equal(
      composition.authoritative,
      false
    );

    assert.equal(
      factoryCalls,
      0
    );

    await composition.close();
  }
);

test(
  "postgres configuration resolves DATABASE_URL only inside server composition",
  async () => {
    const secret =
      "postgresql://private-user:private-password@db.internal/app";

    const source = {
      NODE_ENV:
        "production",

      DIGITALBOOST_INFRA_DATABASE_PROVIDER:
        "postgresql",

      DATABASE_URL:
        secret,
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    let observedConnectionString:
      string | null =
      null;

    const factory:
      PostgresPoolFactory =
      input => {
        observedConnectionString =
          input.connectionString;

        return fakePool();
      };

    const composition =
      composePostgresDatabaseFromEnvironment({
        configuration:
          config,

        source,

        poolFactory:
          factory,
      });

    assert.equal(
      composition.enabled,
      true
    );

    assert.notEqual(
      composition.database,
      null
    );

    assert.equal(
      composition.authoritative,
      false
    );

    assert.equal(
      observedConnectionString,
      secret
    );

    assert.doesNotMatch(
      JSON.stringify(
        config
      ),
      /private-user|private-password/
    );

    const health =
      await composition.database?.health();

    assert.equal(
      health?.state,
      "ready"
    );

    await composition.close();
  }
);

test(
  "postgres composition rejects mismatched secret reference",
  () => {
    const source = {
      DIGITALBOOST_INFRA_DATABASE_PROVIDER:
        "postgresql",

      DATABASE_URL:
        "postgresql://placeholder",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    const malformed = {
      ...config,

      database: {
        ...config.database,

        connectionReference:
          "env:OTHER_DATABASE_URL",
      },
    };

    assert.throws(
      () =>
        composePostgresDatabaseFromEnvironment({
          configuration:
            malformed,

          source,

          poolFactory:
            () =>
              fakePool(),
        }),
      /env:DATABASE_URL/
    );
  }
);

test(
  "postgres close is idempotent",
  async () => {
    const source = {
      DIGITALBOOST_INFRA_DATABASE_PROVIDER:
        "postgresql",

      DATABASE_URL:
        "postgresql://placeholder",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    let closes =
      0;

    const pool =
      fakePool();

    const factory:
      PostgresPoolFactory =
      () => ({
        ...pool,

        async end() {
          closes +=
            1;
        },
      });

    const composition =
      composePostgresDatabaseFromEnvironment({
        configuration:
          config,

        source,

        poolFactory:
          factory,
      });

    await composition.close();
    await composition.close();

    assert.equal(
      closes,
      1
    );
  }
);
