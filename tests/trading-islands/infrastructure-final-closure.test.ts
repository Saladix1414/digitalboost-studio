import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const requiredFiles = [
  "../../src/server/infrastructure/postgresql/PostgresServerComposition.ts",
  "../../src/server/infrastructure/redis/RedisServerComposition.ts",
  "../../src/server/infrastructure/object-storage/S3ServerComposition.ts",
  "../../src/server/infrastructure/queue/BullMqServerComposition.ts",
  "../../src/server/infrastructure/queue/BullMqWorkerComposition.ts",
  "../../src/server/infrastructure/DigitalBoostInfrastructureComposition.ts",
  "../../src/server/infrastructure/DigitalBoostInfrastructureReadiness.ts",
  "../../src/server/infrastructure/DigitalBoostInfrastructureSecurity.ts",
];

test(
  "Phase 34 canonical infrastructure artifacts exist",
  () => {
    for (
      const relative
      of requiredFiles
    ) {
      const url =
        new URL(
          relative,
          import.meta.url
        );

      assert.equal(
        fs.existsSync(
          url
        ),
        true,
        relative
      );
    }
  }
);

test(
  "Phase 34 closure document preserves trust statements",
  () => {
    const content =
      fs.readFileSync(
        new URL(
          "../../src/server/infrastructure/PHASE34_CLOSURE.md",
          import.meta.url
        ),
        "utf8"
      );

    assert.match(
      content,
      /Infrastructure is not authority/
    );

    assert.match(
      content,
      /Cache is not a source of truth/
    );

    assert.match(
      content,
      /Queue delivery does not grant execution permission/
    );

    assert.match(
      content,
      /Worker execution is explicit/
    );

    assert.match(
      content,
      /Phase 35/
    );
  }
);
