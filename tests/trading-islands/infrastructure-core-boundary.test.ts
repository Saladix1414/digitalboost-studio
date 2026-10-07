import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/infrastructure/core/",
    import.meta.url
  );

function source(file: string) {
  return fs.readFileSync(
    new URL(file, root),
    "utf8"
  );
}

test(
  "infrastructure contracts have no concrete provider dependencies",
  () => {
    for (const file of [
      "types.ts",
      "database.ts",
      "cache.ts",
      "objectStorage.ts",
      "queue.ts",
      "worker.ts",
      "foundation.ts",
      "index.ts",
    ]) {
      assert.doesNotMatch(
        source(file),
        /from\s+["'](?:pg|postgres|ioredis|redis|bullmq|bull|@aws-sdk|@upstash|@neondatabase|drizzle|prisma)/
      );
    }
  }
);

test(
  "infrastructure cannot become authority",
  () => {
    for (const file of [
      "types.ts",
      "database.ts",
      "cache.ts",
      "objectStorage.ts",
      "queue.ts",
      "worker.ts",
      "foundation.ts",
    ]) {
      const content =
        source(file);

      assert.doesNotMatch(
        content,
        /authoritative:\s*true|grantsAuthority:\s*true/
      );
    }
  }
);

test(
  "queue and worker expose no trading execution primitive",
  () => {
    const content =
      source("queue.ts")
      + source("worker.ts");

    assert.doesNotMatch(
      content,
      /sendTransaction|submitTransaction|executeTrade|executeOrder|placeOrder|runLiveBot|eth_sendTransaction/
    );
  }
);
