import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const envFile =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts",
      import.meta.url
    ),
    "utf8"
  );

const bootstrapFile =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/DigitalBoostInfrastructureBootstrap.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "server infrastructure has no concrete provider clients",
  () => {
    const content =
      envFile +
      bootstrapFile;

    assert.doesNotMatch(
      content,
      /from\s+["'](?:pg|postgres|redis|ioredis|bullmq|bull|@aws-sdk|@upstash|@neondatabase)/
    );

    assert.doesNotMatch(
      content,
      /new\s+(?:Pool|Redis|Queue|S3Client)\b/
    );
  }
);

test(
  "server infrastructure cannot grant authority",
  () => {
    const content =
      envFile +
      bootstrapFile;

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "server infrastructure exposes no execution primitive",
  () => {
    const content =
      envFile +
      bootstrapFile;

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot/
    );
  }
);
