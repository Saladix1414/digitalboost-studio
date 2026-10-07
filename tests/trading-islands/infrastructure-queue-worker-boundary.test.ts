import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/server/infrastructure/queue/",
    import.meta.url
  );

function source(
  file:
    string
) {
  return fs.readFileSync(
    new URL(
      file,
      root
    ),
    "utf8"
  );
}

test(
  "queue foundation has no concrete transport dependency",
  () => {
    const content =
      source(
        "QueueDriverTypes.ts"
      ) +
      source(
        "QueueAdapter.ts"
      ) +
      source(
        "WorkerRuntime.ts"
      );

    assert.doesNotMatch(
      content,
      /bullmq|bull\b|ioredis|from\s+["']redis["']/
    );
  }
);

test(
  "queue worker foundation cannot grant authority",
  () => {
    const content =
      source(
        "QueueAdapter.ts"
      ) +
      source(
        "WorkerRuntime.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "worker runtime retains canonical execution boundary",
  () => {
    const content =
      source(
        "WorkerRuntime.ts"
      );

    assert.match(
      content,
      /WORKER_EXECUTION_BOUNDARY/
    );
  }
);

test(
  "queue worker foundation exposes no execution primitives",
  () => {
    const content =
      source(
        "QueueAdapter.ts"
      ) +
      source(
        "WorkerRuntime.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot|mintNFT/
    );
  }
);
