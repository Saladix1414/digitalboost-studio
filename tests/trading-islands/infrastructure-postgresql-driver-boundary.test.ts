import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const composition =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/postgresql/PostgresServerComposition.ts",
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
  "postgres concrete driver exists only in server infrastructure",
  () => {
    assert.match(
      composition,
      /from "pg"/
    );

    assert.doesNotMatch(
      fs.readFileSync(
        new URL(
          "../../src/infrastructure/core/database.ts",
          import.meta.url
        ),
        "utf8"
      ),
      /from\s+["']pg["']/
    );
  }
);

test(
  "postgres composition remains non authoritative",
  () => {
    assert.doesNotMatch(
      composition,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "postgres composition exposes no trading execution primitive",
  () => {
    assert.doesNotMatch(
      composition,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);

test(
  "server composition does not log DATABASE_URL",
  () => {
    assert.doesNotMatch(
      server,
      /console\.(?:log|info|warn|error)\([^)]*DATABASE_URL/
    );
  }
);

test(
  "postgres remains opt in",
  () => {
    assert.match(
      composition,
      /provider ===\s*"disabled"/
    );

    assert.match(
      composition,
      /factoryCalls|poolFactory/
    );
  }
);
