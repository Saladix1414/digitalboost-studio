import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const composition =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/redis/RedisServerComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

const coreCache =
  fs.readFileSync(
    new URL(
      "../../src/infrastructure/core/cache.ts",
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
  "Redis concrete dependency stays server-side",
  () => {
    assert.match(
      composition,
      /from "redis"/
    );

    assert.doesNotMatch(
      coreCache,
      /from\s+["']redis["']/
    );
  }
);

test(
  "Redis composition cannot grant authority",
  () => {
    assert.doesNotMatch(
      composition,
      /authoritative:\s*true|grantsAuthority:\s*true|sourceOfTruth:\s*true/
    );
  }
);

test(
  "Redis composition has no product execution primitive",
  () => {
    assert.doesNotMatch(
      composition,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);

test(
  "server does not log Redis URL",
  () => {
    assert.doesNotMatch(
      server,
      /console\.(?:log|info|warn|error)[\s\S]{0,100}REDIS_URL/
    );
  }
);

test(
  "Redis is explicitly opt in",
  () => {
    assert.match(
      composition,
      /cache\.provider ===\s*"disabled"/
    );
  }
);
