import assert from "node:assert/strict";
import test from "node:test";

import {
  createRuntimeSessionId,
  getRuntimeSessionSequenceForDiagnostics,
  resetRuntimeSessionIdentityForTests,
} from "../../src/trading/runtime/sessionIdentity.ts";


test(
  "repeated sessions for same bot receive distinct identities",
  () => {
    resetRuntimeSessionIdentityForTests();

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
      "runtime-bot-1-1"
    );

    assert.equal(
      second,
      "runtime-bot-1-2"
    );

    assert.notEqual(
      first,
      second
    );
  }
);


test(
  "session identity sequence is process monotonic across bots",
  () => {
    resetRuntimeSessionIdentityForTests();

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
      "runtime-bot-alpha-1"
    );

    assert.equal(
      second,
      "runtime-bot-beta-2"
    );

    assert.equal(
      third,
      "runtime-bot-alpha-3"
    );

    assert.equal(
      getRuntimeSessionSequenceForDiagnostics(),
      3
    );
  }
);


test(
  "identity reset is explicit and reserved for tests",
  () => {
    resetRuntimeSessionIdentityForTests();

    createRuntimeSessionId(
      "bot-1"
    );

    assert.equal(
      getRuntimeSessionSequenceForDiagnostics(),
      1
    );

    resetRuntimeSessionIdentityForTests();

    assert.equal(
      getRuntimeSessionSequenceForDiagnostics(),
      0
    );

    assert.equal(
      createRuntimeSessionId(
        "bot-1"
      ),
      "runtime-bot-1-1"
    );
  }
);
