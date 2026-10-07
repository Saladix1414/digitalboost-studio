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
  "startup cleanup uses all-settled semantics",
  () => {
    assert.match(
      composition,
      /Promise\.allSettled/
    );

    assert.match(
      composition,
      /settleInfrastructureClose/
    );
  }
);

test(
  "readiness isolates provider health failures",
  () => {
    assert.match(
      readiness,
      /isolatedHealth/
    );

    assert.match(
      readiness,
      /catch\s*\{[\s\S]*return "unavailable"/
    );
  }
);

test(
  "failure-mode hardening cannot grant authority",
  () => {
    assert.doesNotMatch(
      composition + readiness,
      /authoritative:\s*true|grantsAuthority:\s*true|sourceOfTruth:\s*true/
    );
  }
);

test(
  "failure-mode hardening exposes no execution primitives",
  () => {
    assert.doesNotMatch(
      composition + readiness,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot|mintNFT/
    );
  }
);

test(
  "unified composition still does not start workers",
  () => {
    assert.doesNotMatch(
      composition,
      /createBullMqWorkerComposition|new Worker/
    );
  }
);
