import assert from "node:assert/strict";
import test from "node:test";

import {
  findPulseMemoryActiveConflicts,
  getPulseMemoryLineage,
  queryPulseMemory,
  reconcilePulseMemory,
  rememberPulse,
} from "../../src/DigitalBoostPulseMemory";

class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key)
      ? this.data.get(key)!
      : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

const storage = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: storage,
});

function reset(): void {
  storage.clear();
}

function createLesson(
  tenantId = "tenant-a",
  content: unknown = {
    statement: "original",
  },
) {
  const item = rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId,
    store: "Nimbus",
    source: "executor",
    content,
    confidence: 0.8,
  });

  assert.ok(item);
  return item;
}

test("rememberPulse supersession creates bidirectional lineage", () => {
  reset();

  const oldItem =
    createLesson(
      "tenant-a",
      {
        statement: "old",
      },
    );

  const nextItem = rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-a",
    store: "Nimbus",
    source: "executor",
    content: {
      statement: "new",
    },
    supersedes: oldItem.id,
  });

  assert.ok(nextItem);

  const rows =
    queryPulseMemory({
      tenantId: "tenant-a",
    });

  const oldRow =
    rows.find(
      (row) =>
        row.id === oldItem.id,
    );

  const newRow =
    rows.find(
      (row) =>
        row.id === nextItem.id,
    );

  assert.equal(
    oldRow?.status,
    "SUPERSEDED",
  );
  assert.equal(
    oldRow?.supersededBy,
    nextItem.id,
  );
  assert.equal(
    oldRow?.lifecycleReason,
    "REPLACED",
  );
  assert.equal(
    newRow?.supersedes,
    oldItem.id,
  );
});

test("cross-tenant supersession leaves original memory untouched", () => {
  reset();

  const oldItem =
    createLesson("tenant-a");

  const malicious =
    reconcilePulseMemory({
      id: oldItem.id,
      tenantId: "tenant-b",
      action: "REJECT",
      reason: "cross-tenant",
    });

  assert.equal(
    malicious.ok,
    false,
  );

  const original =
    queryPulseMemory({
      tenantId: "tenant-a",
    })[0];

  assert.equal(
    original.status,
    "ACTIVE",
  );
});

test("replace is one logical reconciliation transaction", () => {
  reset();

  const oldItem =
    createLesson(
      "tenant-a",
      {
        statement: "before",
      },
    );

  const result =
    reconcilePulseMemory({
      id: oldItem.id,
      tenantId: "tenant-a",
      action: "REPLACE",
      reason: "EVIDENCE_CONTRADICTION",
      replacement: {
        content: {
          statement: "after",
        },
        source: "verification",
        confidence: 0.95,
      },
    });

  assert.equal(
    result.ok,
    true,
  );
  assert.ok(result.replacement);

  const rows =
    queryPulseMemory({
      tenantId: "tenant-a",
    });

  assert.equal(rows.length, 2);

  const previous =
    rows.find(
      (row) =>
        row.id === oldItem.id,
    );

  const replacement =
    rows.find(
      (row) =>
        row.id === result.replacement?.id,
    );

  assert.equal(
    previous?.status,
    "SUPERSEDED",
  );
  assert.equal(
    previous?.supersededBy,
    result.replacement!.id,
  );
  assert.equal(
    replacement?.supersedes,
    oldItem.id,
  );
});

test("replace rejects active reconciliation conflicts", () => {
  reset();

  const first =
    createLesson(
      "tenant-a",
      {
        statement: "claim",
      },
    );

  const second =
    createLesson(
      "tenant-a",
      {
        statement: "other",
      },
    );

  assert.notEqual(
    first.reconciliationFingerprint,
    second.reconciliationFingerprint,
  );

  const result =
    reconcilePulseMemory({
      id: first.id,
      tenantId: "tenant-a",
      action: "REPLACE",
      reason: "DUPLICATE_CLAIM",
      replacement: {
        content: second.content,
        source: "verification",
      },
    });

  assert.equal(
    result.ok,
    false,
  );
  assert.equal(
    result.reason,
    "ACTIVE_RECONCILIATION_CONFLICT",
  );
});

test("active claim conflicts are tenant isolated", () => {
  reset();

  const first =
    createLesson(
      "tenant-a",
      {
        statement: "same",
      },
    );

  const second =
    createLesson(
      "tenant-b",
      {
        statement: "same",
      },
    );

  assert.deepEqual(
    findPulseMemoryActiveConflicts({
      tenantId: "tenant-a",
      reconciliationFingerprint:
        first.reconciliationFingerprint,
    }).map((row) => row.id),
    [first.id],
  );

  assert.deepEqual(
    findPulseMemoryActiveConflicts({
      tenantId: "tenant-b",
      reconciliationFingerprint:
        second.reconciliationFingerprint,
    }).map((row) => row.id),
    [second.id],
  );
});

test("lineage returns oldest to newest", () => {
  reset();

  const a =
    createLesson(
      "tenant-a",
      { statement: "a" },
    );

  const b =
    rememberPulse({
      kind: "lesson",
      scope: "Nimbus",
      tenantId: "tenant-a",
      store: "Nimbus",
      source: "executor",
      content: {
        statement: "b",
      },
      supersedes: a.id,
    });

  assert.ok(b);

  const c =
    rememberPulse({
      kind: "lesson",
      scope: "Nimbus",
      tenantId: "tenant-a",
      store: "Nimbus",
      source: "executor",
      content: {
        statement: "c",
      },
      supersedes: b.id,
    });

  assert.ok(c);

  assert.deepEqual(
    getPulseMemoryLineage({
      id: b.id,
      tenantId: "tenant-a",
    }).map((row) => row.id),
    [a.id, b.id, c.id],
  );
});

test("reaffirm persists lifecycle provenance without changing trust", () => {
  reset();

  const item =
    createLesson("tenant-a");

  const result =
    reconcilePulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      action: "REAFFIRM",
      reason: "NEW_CONFIRMING_EVIDENCE",
    });

  assert.equal(
    result.ok,
    true,
  );
  assert.equal(
    result.memory?.status,
    "ACTIVE",
  );
  assert.equal(
    result.memory?.trust,
    "OBSERVED",
  );
  assert.equal(
    result.memory?.lifecycleReason,
    "NEW_CONFIRMING_EVIDENCE",
  );
  assert.ok(
    result.memory?.lifecycleAt,
  );
});

test("expire persists reason and historical provenance", () => {
  reset();

  const item =
    createLesson(
      "tenant-a",
    );

  const result =
    reconcilePulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      action: "EXPIRE",
      reason: "VALID_UNTIL_EXPIRED",
    });

  assert.equal(
    result.ok,
    true,
  );
  assert.equal(
    result.memory?.status,
    "STALE",
  );
  assert.equal(
    result.memory?.lifecycleReason,
    "VALID_UNTIL_EXPIRED",
  );

  const historical =
    queryPulseMemory({
      tenantId: "tenant-a",
      status: "STALE",
    });

  assert.equal(
    historical.length,
    1,
  );
});

test("reject persists reason and cannot be repeated after supersession", () => {
  reset();

  const item =
    createLesson(
      "tenant-a",
    );

  const rejected =
    reconcilePulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      action: "REJECT",
      reason: "EVIDENCE_INVALID",
    });

  assert.equal(
    rejected.ok,
    true,
  );
  assert.equal(
    rejected.memory?.status,
    "REJECTED",
  );

  const repeat =
    reconcilePulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      action: "REPLACE",
      reason: "REPLACE_REJECTED",
      replacement: {
        content: {
          statement: "replacement",
        },
        source: "verification",
      },
    });

  assert.equal(
    repeat.ok,
    false,
  );
  assert.equal(
    repeat.reason,
    "MEMORY_NOT_ACTIVE",
  );
});

test("expired records remain in history after lifecycle transition", () => {
  reset();

  const item =
    createLesson(
      "tenant-a",
    );

  const result =
    reconcilePulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      action: "EXPIRE",
      reason: "TEST_EXPIRATION",
      now:
        Date.parse(
          "2026-09-25T12:00:00.000Z",
        ),
    });

  assert.equal(
    result.ok,
    true,
  );

  const rows =
    queryPulseMemory({
      tenantId: "tenant-a",
    });

  assert.equal(
    rows.find(
      (row) =>
        row.id === item.id,
    )?.status,
    "STALE",
  );
});
