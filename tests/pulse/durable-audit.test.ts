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
  PULSE_DURABLE_AUDIT_VERSION,
  FilesystemPulseDurableAuditRepository,
  PulseDurableAuditError,
} from "../../src/server/DigitalBoostPulseDurableAuditRepository.ts";

function root(): string {
  return mkdtempSync(
    join(
      tmpdir(),
      "digitalboost-pulse-p0427-",
    ),
  );
}

function audit(
  event: string,
  value: unknown,
) {
  return {
    event,
    value,
    source: "pulse-test",
  };
}

test("P0.4.27 canonical durable audit version", () => {
  assert.equal(
    PULSE_DURABLE_AUDIT_VERSION,
    "pulse-durable-audit-v1",
  );
});

test("P0.4.27 first audit starts sequence at one", () => {
  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const record =
    repo.append(
      audit(
        "FIRST",
        1,
      ),
    );

  assert.equal(
    record.sequence,
    1,
  );

  assert.equal(
    record.previous_hash,
    null,
  );

  assert.equal(
    repo.count(),
    1,
  );
});

test("P0.4.27 audit forms a hash chain", () => {
  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  const first =
    repo.append(
      audit(
        "FIRST",
        1,
      ),
    );

  const second =
    repo.append(
      audit(
        "SECOND",
        2,
      ),
    );

  assert.equal(
    first.sequence,
    1,
  );

  assert.equal(
    second.sequence,
    2,
  );

  assert.equal(
    second.previous_hash,
    first.content_hash,
  );

  assert.notEqual(
    first.content_hash,
    second.content_hash,
  );

  repo.verifyIntegrity();
});

test("P0.4.27 audit survives repository recreation", () => {
  const storage = root();

  const repo1 =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  repo1.append(
    audit(
      "PERSIST",
      {
        ok: true,
      },
    ),
  );

  const repo2 =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const records =
    repo2.readAll();

  assert.equal(
    records.length,
    1,
  );

  assert.deepEqual(
    records[0].audit,
    audit(
      "PERSIST",
      {
        ok: true,
      },
    ),
  );

  repo2.verifyIntegrity();
});

test("P0.4.27 tenant isolation allows same audit stream ids across tenants", () => {
  const storage = root();

  const tenantA =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  const tenantB =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-b",
      rootDir: storage,
    });

  const a =
    tenantA.append(
      audit(
        "SHARED_EVENT",
        "A",
      ),
    );

  const b =
    tenantB.append(
      audit(
        "SHARED_EVENT",
        "B",
      ),
    );

  assert.equal(
    tenantA.count(),
    1,
  );

  assert.equal(
    tenantB.count(),
    1,
  );

  assert.notEqual(
    a.audit_id,
    b.audit_id,
  );

  assert.equal(
    tenantA.readAll()[0].audit.value,
    "A",
  );

  assert.equal(
    tenantB.readAll()[0].audit.value,
    "B",
  );
});

test("P0.4.27 wildcard/global tenants are rejected", () => {
  const storage = root();

  assert.throws(
    () =>
      new FilesystemPulseDurableAuditRepository({
        tenantId: "*",
        rootDir: storage,
      }),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseDurableAuditError,
      );

      assert.equal(
        error.code,
        "INVALID_TENANT",
      );

      return true;
    },
  );

  assert.throws(
    () =>
      new FilesystemPulseDurableAuditRepository({
        tenantId: "global",
        rootDir: storage,
      }),
    PulseDurableAuditError,
  );
});

test("P0.4.27 raw tenant id is not exposed in filesystem namespace", () => {
  const storage = root();

  new FilesystemPulseDurableAuditRepository({
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

test("P0.4.27 tampering with payload is detected", () => {
  const storage = root();

  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  repo.append(
    audit(
      "TAMPER",
      {
        safe: true,
      },
    ),
  );

  const tenantDirs =
    readdirSync(storage);

  const tenantDir =
    join(
      storage,
      tenantDirs[0],
    );

  const file =
    join(
      tenantDir,
      "audit.jsonl",
    );

  const lines =
    readFileSync(
      file,
      "utf8",
    )
      .trim()
      .split("\n");

  const parsed =
    JSON.parse(lines[0]) as {
      audit: Record<string, unknown>;
    };

  parsed.audit.safe =
    false;

  lines[0] =
    JSON.stringify(parsed);

  writeFileSync(
    file,
    lines.join("\n") + "\n",
  );

  assert.throws(
    () =>
      repo.verifyIntegrity(),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseDurableAuditError,
      );

      assert.equal(
        error.code,
        "AUDIT_TAMPERED",
      );

      return true;
    },
  );
});

test("P0.4.27 deleting the first record is detected by sequence validation", () => {
  const storage = root();

  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  repo.append(
    audit(
      "FIRST",
      1,
    ),
  );

  repo.append(
    audit(
      "SECOND",
      2,
    ),
  );

  const tenantDirs =
    readdirSync(storage);

  const file =
    join(
      storage,
      tenantDirs[0],
      "audit.jsonl",
    );

  const lines =
    readFileSync(
      file,
      "utf8",
    )
      .trim()
      .split("\n");

  writeFileSync(
    file,
    lines[1] + "\n",
  );

  assert.throws(
    () =>
      repo.verifyIntegrity(),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseDurableAuditError,
      );

      assert.equal(
        error.code,
        "AUDIT_SEQUENCE_INVALID",
      );

      return true;
    },
  );
});

test("P0.4.27 changing middle record breaks hash chain", () => {
  const storage = root();

  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: storage,
    });

  repo.append(
    audit(
      "ONE",
      1,
    ),
  );

  repo.append(
    audit(
      "TWO",
      2,
    ),
  );

  repo.append(
    audit(
      "THREE",
      3,
    ),
  );

  const tenantDirs =
    readdirSync(storage);

  const file =
    join(
      storage,
      tenantDirs[0],
      "audit.jsonl",
    );

  const lines =
    readFileSync(
      file,
      "utf8",
    )
      .trim()
      .split("\n");

  const middle =
    JSON.parse(lines[1]) as {
      audit: Record<string, unknown>;
    };

  middle.audit.value =
    999;

  lines[1] =
    JSON.stringify(middle);

  writeFileSync(
    file,
    lines.join("\n") + "\n",
  );

  assert.throws(
    () =>
      repo.verifyIntegrity(),
    (error: unknown) => {
      assert.ok(
        error instanceof
          PulseDurableAuditError,
      );

      assert.equal(
        error.code,
        "AUDIT_TAMPERED",
      );

      return true;
    },
  );
});

test("P0.4.27 audit append is immutable at API level", () => {
  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  repo.append(
    audit(
      "IMMUTABLE",
      1,
    ),
  );

  assert.equal(
    typeof (repo as Record<string, unknown>).update,
    "undefined",
  );

  assert.equal(
    typeof (repo as Record<string, unknown>).delete,
    "undefined",
  );
});

test("P0.4.27 multiple audit records preserve order", () => {
  const repo =
    new FilesystemPulseDurableAuditRepository({
      tenantId: "tenant-a",
      rootDir: root(),
    });

  for (let index = 1; index <= 10; index += 1) {
    repo.append(
      audit(
        `EVENT_${index}`,
        index,
      ),
    );
  }

  const records =
    repo.readAll();

  assert.equal(
    records.length,
    10,
  );

  records.forEach(
    (
      record,
      index,
    ) => {
      assert.equal(
        record.sequence,
        index + 1,
      );

      if (index > 0) {
        assert.equal(
          record.previous_hash,
          records[
            index - 1
          ].content_hash,
        );
      }
    },
  );

  repo.verifyIntegrity();
});
