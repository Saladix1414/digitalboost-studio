import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  describeInfrastructurePhase34Closure,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureClosure.ts";

const server =
  fs.readFileSync(
    new URL(
      "../../server.ts",
      import.meta.url
    ),
    "utf8"
  );

const unifiedComposition =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/DigitalBoostInfrastructureComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Phase 34 closure preserves non-authoritative infrastructure",
  () => {
    const status =
      describeInfrastructurePhase34Closure();

    assert.equal(
      status.authoritative,
      false
    );

    assert.equal(
      status.guarantees.infrastructureAuthoritative,
      false
    );

    assert.equal(
      status.guarantees.infrastructureSourceOfTruth,
      false
    );
  }
);

test(
  "Phase 34 closure preserves execution boundaries",
  () => {
    const guarantees =
      describeInfrastructurePhase34Closure()
        .guarantees;

    assert.equal(
      guarantees.mayBypassPolicy,
      false
    );

    assert.equal(
      guarantees.mayBypassRisk,
      false
    );

    assert.equal(
      guarantees.mayBypassApproval,
      false
    );

    assert.equal(
      guarantees.mayExecuteExternalSideEffects,
      false
    );
  }
);

test(
  "web server does not auto-start infrastructure workers",
  () => {
    assert.doesNotMatch(
      server,
      /createBullMqWorkerComposition|new Worker/
    );
  }
);

test(
  "unified composition contains no domain execution primitive",
  () => {
    assert.doesNotMatch(
      unifiedComposition,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot|mintNFT/
    );
  }
);
