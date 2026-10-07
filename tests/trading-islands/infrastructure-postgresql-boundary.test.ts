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
  "postgres foundation has no concrete pg dependency yet",
  () => {
    const content =
      source(
        "PostgresDriverTypes.ts"
      ) +
      source(
        "PostgresDatabaseAdapter.ts"
      ) +
      source(
        "index.ts"
      );

    assert.doesNotMatch(
      content,
      /from\s+["']pg["']|require\(["']pg["']\)|new\s+Pool\b/
    );
  }
);

test(
  "postgres adapter cannot grant authority",
  () => {
    const content =
      source(
        "PostgresDatabaseAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "postgres adapter exposes no product execution primitive",
  () => {
    const content =
      source(
        "PostgresDatabaseAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);

test(
  "postgres adapter fails closed instead of pretending optimistic concurrency",
  () => {
    const content =
      source(
        "PostgresDatabaseAdapter.ts"
      );

    assert.match(
      content,
      /PostgresExpectedVersionUnsupportedError/
    );

    assert.match(
      content,
      /expectedVersion/
    );
  }
);

test(
  "postgres adapter has explicit transaction rollback",
  () => {
    const content =
      source(
        "PostgresDatabaseAdapter.ts"
      );

    assert.match(
      content,
      /ROLLBACK/
    );

    assert.match(
      content,
      /COMMIT/
    );

    assert.match(
      content,
      /release\(\)/
    );
  }
);
