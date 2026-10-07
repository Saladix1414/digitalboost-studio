import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/redis/RedisServerComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "concrete Redis driver uses official redis package",
  () => {
    assert.match(
      source,
      /from "redis"/
    );

    assert.match(
      source,
      /createClient/
    );
  }
);

test(
  "Redis lock deletion is atomic compare-and-delete",
  () => {
    assert.match(
      source,
      /redis\.call\("GET"/
    );

    assert.match(
      source,
      /redis\.call\("DEL"/
    );

    assert.match(
      source,
      /client\.eval/
    );
  }
);

test(
  "Redis driver maps TTL and NX explicitly",
  () => {
    assert.match(
      source,
      /commandOptions\.EX/
    );

    assert.match(
      source,
      /commandOptions\.NX/
    );
  }
);
