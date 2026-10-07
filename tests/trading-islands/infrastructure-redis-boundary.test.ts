import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/server/infrastructure/redis/",
    import.meta.url
  );

function source(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      file,
      root
    ),
    "utf8"
  );
}

test(
  "redis foundation has no concrete client dependency",
  () => {
    const content =
      source(
        "RedisDriverTypes.ts"
      ) +
      source(
        "RedisCacheAdapter.ts"
      ) +
      source(
        "index.ts"
      );

    assert.doesNotMatch(
      content,
      /from\s+["'](?:redis|ioredis)["']|require\(["'](?:redis|ioredis)["']\)/
    );
  }
);

test(
  "redis cannot become source of truth or authority",
  () => {
    const content =
      source(
        "RedisCacheAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true|sourceOfTruth:\s*true|canonical:\s*true/
    );
  }
);

test(
  "redis lock release uses compare-and-delete semantics",
  () => {
    const content =
      source(
        "RedisCacheAdapter.ts"
      );

    const start =
      content.indexOf(
        "async releaseLock("
      );

    assert.notEqual(
      start,
      -1
    );

    const releaseLock =
      content.slice(
        start
      );

    assert.match(
      releaseLock,
      /compareAndDelete/
    );

    assert.doesNotMatch(
      releaseLock,
      /client\.del\(/
    );
  }
);

test(
  "redis adapter exposes no product execution primitive",
  () => {
    const content =
      source(
        "RedisCacheAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);
