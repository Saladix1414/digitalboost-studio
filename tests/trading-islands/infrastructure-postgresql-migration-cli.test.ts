import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/postgresql/PostgresMigrationCli.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "migration CLI is explicit and not server startup coupled",
  () => {
    assert.match(
      source,
      /runPostgresMigrationCli/
    );

    assert.match(
      source,
      /DIGITALBOOST_INFRA_DATABASE_PROVIDER=postgresql/
    );
  }
);

test(
  "migration CLI closes database composition",
  () => {
    assert.match(
      source,
      /finally[\s\S]*composition\.close\(\)/
    );
  }
);
