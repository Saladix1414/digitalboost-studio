import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/server/infrastructure/postgresql/",
    import.meta.url
  );

function source(
  file:
    string
) {
  return fs.readFileSync(
    new URL(
      file,
      root
    ),
    "utf8"
  );
}

test(
  "migration foundation remains non authoritative",
  () => {
    const content =
      source(
        "PostgresMigrationTypes.ts"
      ) +
      source(
        "PostgresMigrationRegistry.ts"
      ) +
      source(
        "PostgresMigrationRunner.ts"
      ) +
      source(
        "PostgresReadiness.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "migration runner has no product execution primitive",
  () => {
    const content =
      source(
        "PostgresMigrationRunner.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);

test(
  "migration runner uses explicit database transaction boundary",
  () => {
    const content =
      source(
        "PostgresMigrationRunner.ts"
      );

    assert.match(
      content,
      /\.transaction\(\s*"read-write"/
    );

    assert.match(
      content,
      /digitalboost_schema_migrations/
    );
  }
);

test(
  "server does not auto-run migrations",
  () => {
    const server =
      fs.readFileSync(
        new URL(
          "../../server.ts",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      server,
      /runPostgresMigrations/
    );
  }
);
