import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/postgresql/migrations/0001InfrastructureFoundation.ts",
      import.meta.url
    ),
    "utf8"
  );

const cli =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/postgresql/PostgresMigrationCli.ts",
      import.meta.url
    ),
    "utf8"
  );

const server =
  fs.readFileSync(
    new URL(
      "../../server.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "first migration contains no domain tables",
  () => {
    assert.doesNotMatch(
      migration,
      /dbx|approval|runtime_evidence|wallet|nft|order|trade|bot/i
    );
  }
);

test(
  "migration remains non authoritative",
  () => {
    assert.doesNotMatch(
      migration + cli,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "server still does not auto-run migrations",
  () => {
    assert.doesNotMatch(
      server,
      /runPostgresMigrationCli|runPostgresMigrations/
    );
  }
);

test(
  "migration CLI exposes no product execution primitive",
  () => {
    assert.doesNotMatch(
      cli,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);
