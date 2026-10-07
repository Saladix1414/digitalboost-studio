import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const composition =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/DigitalBoostInfrastructureComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

const readiness =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/DigitalBoostInfrastructureReadiness.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "unified infrastructure never grants authority",
  () => {
    assert.doesNotMatch(
      composition + readiness,
      /authoritative:\s*true|grantsAuthority:\s*true|sourceOfTruth:\s*true/
    );
  }
);

test(
  "unified infrastructure exposes no execution primitives",
  () => {
    assert.doesNotMatch(
      composition + readiness,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot|mintNFT/
    );
  }
);

test(
  "worker remains outside unified startup composition",
  () => {
    assert.doesNotMatch(
      composition,
      /Worker|createBullMqWorkerComposition/
    );
  }
);

test(
  "foundation composes only canonical infrastructure ports",
  () => {
    assert.match(
      composition,
      /createInfrastructureFoundation/
    );

    assert.match(
      composition,
      /database:\s*database\.database/
    );

    assert.match(
      composition,
      /cache:\s*cache\.cache/
    );

    assert.match(
      composition,
      /objectStorage:\s*objectStorage\.storage/
    );

    assert.match(
      composition,
      /queue:\s*queue\.queue/
    );
  }
);
