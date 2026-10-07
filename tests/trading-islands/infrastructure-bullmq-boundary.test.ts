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
  "BullMQ dependency remains server infrastructure only",
  () => {
    const content =
      source(
        "BullMqQueueDriver.ts"
      ) +
      source(
        "BullMqWorkerComposition.ts"
      );

    assert.match(
      content,
      /from "bullmq"/
    );

    const core =
      fs.readFileSync(
        new URL(
          "../../src/infrastructure/core/queue.ts",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      core,
      /bullmq/
    );
  }
);

test(
  "queue worker composition cannot grant authority",
  () => {
    const content =
      source(
        "BullMqQueueDriver.ts"
      ) +
      source(
        "BullMqServerComposition.ts"
      ) +
      source(
        "BullMqWorkerComposition.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true/
    );
  }
);

test(
  "queue worker composition has no domain execution imports",
  () => {
    const content =
      source(
        "BullMqWorkerComposition.ts"
      );

    assert.doesNotMatch(
      content,
      /from\s+["'][^"']*(?:trading|approval|risk|blockchain|wallet|nft)[^"']*["']/
    );
  }
);

test(
  "queue worker composition exposes no execution primitives",
  () => {
    const content =
      source(
        "BullMqQueueDriver.ts"
      ) +
      source(
        "BullMqWorkerComposition.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot|mintNFT/
    );
  }
);

test(
  "server does not auto-start BullMQ worker",
  () => {
    const server =
      fs.readFileSync(
        new URL(
          "../../server.ts",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      server,
      /new Worker|createBullMqWorkerComposition/
    );
  }
);
