import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/infrastructure/core/",
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
  "provider selection has no concrete infrastructure client",
  () => {
    const content =
      source(
        "configuration.ts"
      ) +
      source(
        "providerSelection.ts"
      );

    assert.doesNotMatch(
      content,
      /from\s+["'](?:pg|postgres|redis|ioredis|bullmq|@aws-sdk|@upstash|@neondatabase)/
    );

    assert.doesNotMatch(
      content,
      /new\s+(?:Pool|Redis|Queue|S3Client)\b/
    );
  }
);

test(
  "configuration does not read environment variables directly",
  () => {
    const content =
      source(
        "configuration.ts"
      ) +
      source(
        "providerSelection.ts"
      );

    assert.doesNotMatch(
      content,
      /process\.env|import\.meta\.env/
    );
  }
);

test(
  "provider configuration cannot grant authority",
  () => {
    const content =
      source(
        "configuration.ts"
      ) +
      source(
        "providerSelection.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "provider selection exposes no execution primitive",
  () => {
    const content =
      source(
        "providerSelection.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);
