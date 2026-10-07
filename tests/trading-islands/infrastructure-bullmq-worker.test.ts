import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/queue/BullMqWorkerComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "BullMQ worker passes jobs through canonical WorkerRuntime",
  () => {
    assert.match(
      source,
      /createWorkerRuntime/
    );

    assert.match(
      source,
      /runtime\.process/
    );
  }
);

test(
  "BullMQ worker validates canonical execution boundary",
  () => {
    assert.match(
      source,
      /mayExecuteExternalSideEffects/
    );

    assert.match(
      source,
      /mayBypassPolicy/
    );

    assert.match(
      source,
      /mayBypassRisk/
    );

    assert.match(
      source,
      /mayBypassApproval/
    );
  }
);

test(
  "worker construction is explicit and not imported by server",
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
      /BullMqWorkerComposition|createBullMqWorkerComposition/
    );
  }
);
