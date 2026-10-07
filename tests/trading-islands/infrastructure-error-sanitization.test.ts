import assert from "node:assert/strict";
import test from "node:test";

import {
  sanitizeInfrastructureError,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureSecurity.ts";

test(
  "sanitized infrastructure errors never expose raw error messages",
  () => {
    const raw =
      new Error(
        "postgresql://admin:secret-password@db.internal/database"
      );

    const sanitized =
      sanitizeInfrastructureError(
        raw
      );

    const serialized =
      JSON.stringify(
        sanitized
      );

    assert.equal(
      sanitized.code,
      "infrastructure-operation-failed"
    );

    assert.equal(
      sanitized.message,
      "Infrastructure operation failed."
    );

    assert.equal(
      sanitized.authoritative,
      false
    );

    assert.doesNotMatch(
      serialized,
      /secret-password|admin|db\.internal|postgresql:\/\//
    );
  }
);
