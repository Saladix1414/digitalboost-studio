import assert from "node:assert/strict";
import test from "node:test";

import {
  createRuntimeSessionId,
  getRuntimeSessionOriginForDiagnostics,
  getRuntimeSessionSequenceForDiagnostics,
  resetRuntimeSessionIdentityForTests,
} from "../../src/trading/runtime/sessionIdentity.ts";


test(
  "same bot receives distinct ordered session ids",
  () => {
    resetRuntimeSessionIdentityForTests();

    const origin =
      getRuntimeSessionOriginForDiagnostics();

    const first =
      createRuntimeSessionId(
        "bot-1"
      );

    const second =
      createRuntimeSessionId(
        "bot-1"
      );

    assert.equal(
      first,
      `runtime-bot-1-${origin}-1`
    );

    assert.equal(
      second,
      `runtime-bot-1-${origin}-2`
    );

    assert.notEqual(
      first,
      second
    );

    assert.equal(
      getRuntimeSessionSequenceForDiagnostics(),
      2
    );
  }
);


test(
  "different bots share context origin but not session identity",
  () => {
    resetRuntimeSessionIdentityForTests();

    const origin =
      getRuntimeSessionOriginForDiagnostics();

    const first =
      createRuntimeSessionId(
        "bot-alpha"
      );

    const second =
      createRuntimeSessionId(
        "bot-beta"
      );

    const third =
      createRuntimeSessionId(
        "bot-alpha"
      );

    assert.equal(
      first,
      `runtime-bot-alpha-${origin}-1`
    );

    assert.equal(
      second,
      `runtime-bot-beta-${origin}-2`
    );

    assert.equal(
      third,
      `runtime-bot-alpha-${origin}-3`
    );
  }
);


test(
  "runtime context origin is UUID shaped",
  () => {
    const origin =
      getRuntimeSessionOriginForDiagnostics();

    assert.match(
      origin,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  }
);


test(
  "test sequence reset does not replace runtime context origin",
  () => {
    const before =
      getRuntimeSessionOriginForDiagnostics();

    createRuntimeSessionId(
      "bot-1"
    );

    resetRuntimeSessionIdentityForTests();

    const after =
      getRuntimeSessionOriginForDiagnostics();

    assert.equal(
      after,
      before
    );

    assert.equal(
      getRuntimeSessionSequenceForDiagnostics(),
      0
    );
  }
);
