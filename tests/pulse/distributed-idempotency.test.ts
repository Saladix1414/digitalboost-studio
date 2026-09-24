import test from "node:test";
import assert from "node:assert/strict";

import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

import {
  PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION,
  FilesystemPulseDistributedIdempotencyStore,
  PulseIdempotencyError,
  executePulseIdempotently,
  fingerprintPulseIdempotencyInput,
} from "../../src/server/DigitalBoostPulseDistributedIdempotency.ts";

function root(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0425-",
    ),
  );
}

function fp(
  input: unknown,
): string {
  return fingerprintPulseIdempotencyInput(
    input,
  );
}

test("P0.4.25 canonical version", () => {
  assert.equal(
    PULSE_DISTRIBUTED_IDEMPOTENCY_VERSION,
    "pulse-distributed-idempotency-v1",
  );
});

test("P0.4.25 first request acquires key", () => {
  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const result =
    store.begin({
      idempotency_key: "request-first",
      request_fingerprint: fp({
        action: "analyze",
        value: 1,
      }),
    });

  assert.equal(
    result.decision,
    "ACQUIRED",
  );

  assert.equal(
    result.record.state,
    "STARTED",
  );
});

test("P0.4.25 same key same fingerprint becomes replay", () => {
  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const requestFingerprint =
    fp({
      action: "analyze",
      value: 2,
    });

  store.begin({
    idempotency_key: "request-replay",
    request_fingerprint:
      requestFingerprint,
  });

  const replay =
    store.begin({
      idempotency_key: "request-replay",
      request_fingerprint:
        requestFingerprint,
  });

  assert.equal(
    replay.decision,
    "REPLAY",
  );

  assert.equal(
    replay.record.state,
    "STARTED",
  );
});

test("P0.4.25 same key different fingerprint is blocked", () => {
  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  store.begin({
    idempotency_key: "request-conflict",
    request_fingerprint: fp({
      action: "analyze",
    }),
  });

  assert.throws(
    () =>
      store.begin({
        idempotency_key: "request-conflict",
        request_fingerprint: fp({
          action: "seo",
        }),
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseIdempotencyError,
      );

      assert.equal(
        error.code,
        "IDEMPOTENCY_CONFLICT",
      );

      return true;
    },
  );
});

test("P0.4.25 completed result persists between instances", () => {
  const storage = root();

  const requestFingerprint =
    fp({
      action: "hero",
      value: 3,
    });

  const store1 =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  store1.begin({
    idempotency_key: "request-complete",
    request_fingerprint:
      requestFingerprint,
  });

  store1.complete({
    idempotency_key: "request-complete",
    request_fingerprint:
      requestFingerprint,
    outcome: {
      status: "EXECUTED",
      evidence_id: "evidence-1",
    },
  });

  const store2 =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const replay =
    store2.begin<{
      status: string;
      evidence_id: string;
    }>({
      idempotency_key: "request-complete",
      request_fingerprint:
        requestFingerprint,
    });

  assert.equal(
    replay.decision,
    "REPLAY",
  );

  assert.equal(
    replay.record.state,
    "COMPLETED",
  );

  assert.deepEqual(
    replay.record.outcome,
    {
      status: "EXECUTED",
      evidence_id: "evidence-1",
    },
  );
});

test("P0.4.25 failed result becomes terminal replay", () => {
  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const requestFingerprint =
    fp({
      action: "mutation",
      value: 4,
    });

  store.begin({
    idempotency_key: "request-failed",
    request_fingerprint:
      requestFingerprint,
  });

  store.fail({
    idempotency_key: "request-failed",
    request_fingerprint:
      requestFingerprint,
    code: "EXECUTION_FAILED",
    message: "mutation failed",
  });

  const replay =
    store.begin({
      idempotency_key: "request-failed",
      request_fingerprint:
        requestFingerprint,
    });

  assert.equal(
    replay.decision,
    "REPLAY",
  );

  assert.equal(
    replay.record.state,
    "FAILED",
  );
});

test("P0.4.25 execute helper runs once", async () => {
  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const requestFingerprint =
    fp({
      action: "hero",
      value: 5,
    });

  let executions = 0;

  const first =
    await executePulseIdempotently({
      store,
      idempotency_key: "request-once",
      request_fingerprint:
        requestFingerprint,
      execute: () => {
        executions += 1;

        return {
          status: "EXECUTED",
        };
      },
    });

  const second =
    await executePulseIdempotently({
      store,
      idempotency_key: "request-once",
      request_fingerprint:
        requestFingerprint,
      execute: () => {
        executions += 1;

        return {
          status: "EXECUTED",
        };
      },
    });

  assert.equal(
    executions,
    1,
  );

  assert.equal(
    first.replayed,
    false,
  );

  assert.equal(
    second.replayed,
    true,
  );

  assert.deepEqual(
    second.outcome,
    {
      status: "EXECUTED",
    },
  );
});

test("P0.4.25 STARTED replay fails closed", async () => {
  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const requestFingerprint =
    fp({
      action: "mutation",
      value: 6,
    });

  store.begin({
    idempotency_key: "request-started",
    request_fingerprint:
      requestFingerprint,
  });

  let executions = 0;

  await assert.rejects(
    () =>
      executePulseIdempotently({
        store,
        idempotency_key: "request-started",
        request_fingerprint:
          requestFingerprint,
        execute: () => {
          executions += 1;

          return {
            status: "MUST_NOT_RUN",
          };
        },
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseIdempotencyError,
      );

      assert.equal(
        error.code,
        "IDEMPOTENCY_LOCKED",
      );

      return true;
    },
  );

  assert.equal(
    executions,
    0,
  );
});

test("P0.4.25 independent stores share one logical owner", () => {
  const storage = root();

  const requestFingerprint =
    fp({
      action: "distributed",
      value: 7,
    });

  const storeA =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const storeB =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const first =
    storeA.begin({
      idempotency_key: "request-distributed",
      request_fingerprint:
        requestFingerprint,
    });

  const second =
    storeB.begin({
      idempotency_key: "request-distributed",
      request_fingerprint:
        requestFingerprint,
    });

  assert.equal(
    first.decision,
    "ACQUIRED",
  );

  assert.equal(
    second.decision,
    "REPLAY",
  );
});

test("P0.4.25 same key is isolated across tenants", () => {
  const storage = root();

  const requestFingerprint =
    fp({
      action: "same",
      value: 8,
    });

  const tenantA =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const tenantB =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-b",
      rootDir: storage,
    });

  assert.equal(
    tenantA.begin({
      idempotency_key: "shared-key",
      request_fingerprint:
        requestFingerprint,
    }).decision,
    "ACQUIRED",
  );

  assert.equal(
    tenantB.begin({
      idempotency_key: "shared-key",
      request_fingerprint:
        requestFingerprint,
    }).decision,
    "ACQUIRED",
  );
});

test("P0.4.25 tampered record is rejected", () => {
  const storage = root();

  const store =
    new FilesystemPulseDistributedIdempotencyStore({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const requestFingerprint =
    fp({
      action: "tamper",
      value: 9,
    });

  store.begin({
    idempotency_key: "request-tamper",
    request_fingerprint:
      requestFingerprint,
  });

  const tenantDirs =
    readdirSync(storage);

  const files =
    readdirSync(
      join(
        storage,
        tenantDirs[0],
      ),
    );

  const file =
    join(
      storage,
      tenantDirs[0],
      files[0],
    );

  const parsed =
    JSON.parse(
      readFileSync(
        file,
        "utf8",
      ),
    ) as {
      request_fingerprint: string;
    };

  parsed.request_fingerprint =
    fp({
      action: "tampered",
    });

  writeFileSync(
    file,
    JSON.stringify(
      parsed,
      null,
      2,
    ) + "\n",
  );

  assert.throws(
    () =>
      store.get("request-tamper"),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseIdempotencyError,
      );

      assert.equal(
        error.code,
        "IDEMPOTENCY_TAMPERED",
      );

      return true;
    },
  );
});

test("P0.4.25 wildcard tenant is rejected", () => {
  const storage = root();

  assert.throws(
    () =>
      new FilesystemPulseDistributedIdempotencyStore({
        tenantId: "*",
        rootDir: storage,
      }),
    PulseIdempotencyError,
  );

  assert.throws(
    () =>
      new FilesystemPulseDistributedIdempotencyStore({
        tenantId: "global",
        rootDir: storage,
      }),
    PulseIdempotencyError,
  );
});

test("P0.4.25 raw tenant is not exposed in namespace path", () => {
  const storage = root();

  new FilesystemPulseDistributedIdempotencyStore({
    tenantId: "tenant-secret-name",
    rootDir: storage,
  });

  const entries =
    readdirSync(storage);

  assert.equal(
    entries.length,
    1,
  );

  assert.notEqual(
    entries[0],
    "tenant-secret-name",
  );
});
