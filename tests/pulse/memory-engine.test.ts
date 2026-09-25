import assert from "node:assert/strict";
import test from "node:test";

import {
  fingerprintMemorySemantic,
  governPulseMemory,
  listPulseMemory,
  queryPulseMemory,
  queryTrustedPulseMemory,
  rememberPulse,
  verifyPulseMemory,
  rememberPreference,
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
  configurable: true,
});

function reset(): void {
  storage.clear();
}

test("P0.6 contract is declared", () => {
  reset();

  const item = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    tenantId: "tenant-a",
    store: "Nimbus",
    source: "merchant",
    content: {
      fact: "catalog-ready",
    },
    evidenceRefs: ["e1"],
  });

  assert.ok(item);
  assert.equal(item.memoryVersion, 2);
});

test("explicit tenant becomes the isolation boundary", () => {
  reset();

  const a = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "merchant",
    content: "A",
  });

  const b = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    tenantId: "tenant-b",
    source: "merchant",
    content: "B",
  });

  assert.ok(a);
  assert.ok(b);

  assert.equal(
    queryPulseMemory({
      tenantId: "tenant-a",
    }).length,
    1,
  );

  assert.equal(
    queryPulseMemory({
      tenantId: "tenant-b",
    }).length,
    1,
  );
});

test("same store name cannot cross tenant query", () => {
  reset();

  rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-a",
    store: "Nimbus",
    source: "executor",
    content: "A",
  });

  rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-b",
    store: "Nimbus",
    source: "executor",
    content: "B",
  });

  const rows = queryPulseMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
  });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].tenantId, "tenant-a");
  assert.equal(rows[0].content, "A");
});

test("legacy scope records are never automatically trusted", () => {
  reset();

  const item = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    source: "merchant",
    content: "legacy",
  });

  assert.ok(item);
  assert.equal(
    item.identityMode,
    "LEGACY_SCOPE",
  );
  assert.equal(
    item.tenantId,
    "Nimbus",
  );
  assert.equal(
    item.trust,
    "OBSERVED",
  );
});

test("caller-provided verifiedAt does not promote trust", () => {
  reset();

  const item = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "merchant",
    content: "reported",
    evidenceRefs: ["e1"],
    verifiedAt:
      "2026-09-25T00:00:00.000Z",
  });

  assert.ok(item);
  assert.equal(
    item.verifiedAt,
    "2026-09-25T00:00:00.000Z",
  );
  assert.equal(
    item.trust,
    "OBSERVED",
  );
});

test("verification is a separate operation", () => {
  reset();

  const item = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "merchant",
    content: "verified-later",
  });

  assert.ok(item);

  assert.equal(
    verifyPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      evidenceRefs: ["verification-e1"],
    }),
    true,
  );

  const verified = queryPulseMemory({
    tenantId: "tenant-a",
    trust: "VERIFIED",
  });

  assert.equal(verified.length, 1);
  assert.equal(
    verified[0].id,
    item.id,
  );
});

test("verification cannot cross tenants", () => {
  reset();

  const item = rememberPulse({
    kind: "semantic",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "merchant",
    content: "secret-boundary",
  });

  assert.ok(item);

  assert.equal(
    verifyPulseMemory({
      id: item.id,
      tenantId: "tenant-b",
      evidenceRefs: ["evil"],
    }),
    false,
  );

  assert.equal(
    queryPulseMemory({
      tenantId: "tenant-a",
    })[0].trust,
    "OBSERVED",
  );
});

test("governance requires prior verification", () => {
  reset();

  const item = rememberPulse({
    kind: "decision",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "governance",
    content: {
      decision: "allow",
    },
    evidenceRefs: ["decision-e1"],
  });

  assert.ok(item);

  assert.equal(
    governPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
    }),
    false,
  );

  assert.equal(
    verifyPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
    }),
    true,
  );

  assert.equal(
    governPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
    }),
    true,
  );

  const governed = queryPulseMemory({
    tenantId: "tenant-a",
    trust: "GOVERNED",
  });

  assert.equal(governed.length, 1);
});

test("semantic fingerprint is deterministic", () => {
  reset();

  const a = fingerprintMemorySemantic({
    scope: "Nimbus",
    tenantId: "tenant-a",
    store: "Nimbus",
    kind: "semantic",
    content: {
      b: 2,
      a: 1,
    },
    source: "merchant",
    evidenceRefs: ["e1", "e2"],
    confidence: 0.9,
    validFrom: "2026-09-25T00:00:00.000Z",
  });

  const b = fingerprintMemorySemantic({
    source: "merchant",
    confidence: 0.9,
    evidenceRefs: ["e1", "e2"],
    validFrom: "2026-09-25T00:00:00.000Z",
    content: {
      a: 1,
      b: 2,
    },
    kind: "semantic",
    store: "Nimbus",
    tenantId: "tenant-a",
    scope: "Nimbus",
  });

  assert.equal(a, b);
});

test("semantic fingerprint changes with tenant", () => {
  const a = fingerprintMemorySemantic({
    scope: "Nimbus",
    tenantId: "tenant-a",
    kind: "semantic",
    content: "same",
    source: "merchant",
  });

  const b = fingerprintMemorySemantic({
    scope: "Nimbus",
    tenantId: "tenant-b",
    kind: "semantic",
    content: "same",
    source: "merchant",
  });

  assert.notEqual(a, b);
});

test("supersession cannot cross tenant boundaries", () => {
  reset();

  const a = rememberPreference({
    scope: "Nimbus",
    tenantId: "tenant-a",
    key: "theme",
    value: "Noir",
  });

  assert.ok(a);

  const malicious = rememberPulse({
    kind: "preference",
    scope: "Nimbus",
    tenantId: "tenant-b",
    source: "preference-ui",
    supersedes: a.id,
    content: {
      key: "theme",
      value: "Attack",
    },
  });

  assert.equal(
    malicious,
    null,
  );

  const original = queryPulseMemory({
    tenantId: "tenant-a",
    status: "ACTIVE",
  });

  assert.equal(original.length, 1);
  assert.equal(original[0].id, a.id);
});

test("trusted retrieval requires tenant and trust threshold", () => {
  reset();

  rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "executor",
    content: "observed",
    evidenceRefs: ["e1"],
    confidence: 0.99,
  });

  const observed = queryTrustedPulseMemory({
    tenantId: "tenant-a",
  });

  assert.equal(observed.length, 0);
});

test("verified retrieval is deterministic", () => {
  reset();

  const low = rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "executor",
    content: "low",
    evidenceRefs: ["e-low"],
    confidence: 0.5,
  });

  const high = rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-a",
    source: "executor",
    content: "high",
    evidenceRefs: ["e-high"],
    confidence: 0.95,
  });

  assert.ok(low);
  assert.ok(high);

  verifyPulseMemory({
    id: low.id,
    tenantId: "tenant-a",
  });

  verifyPulseMemory({
    id: high.id,
    tenantId: "tenant-a",
  });

  const rows = queryTrustedPulseMemory({
    tenantId: "tenant-a",
    minimumTrust: "VERIFIED",
  });

  assert.equal(rows.length, 2);
  assert.equal(rows[0].id, high.id);
});

test("existing preference compatibility remains intact", () => {
  reset();

  const a = rememberPreference({
    scope: "Nimbus",
    tenantId: "tenant-a",
    key: "theme",
    value: "Noir",
  });

  const b = rememberPreference({
    scope: "Nimbus",
    tenantId: "tenant-a",
    key: "theme",
    value: "Nimbus",
  });

  assert.ok(a);
  assert.ok(b);

  const active = queryPulseMemory({
    kind: "preference",
    scope: "Nimbus",
    tenantId: "tenant-a",
    status: "ACTIVE",
  }).filter(function (row) {
    return (
      row.content &&
      typeof row.content === "object" &&
      (row.content as Record<string, unknown>)
        .key === "theme"
    );
  });

  assert.equal(active.length, 1);
  assert.equal(active[0].id, b.id);

  const old = listPulseMemory().find(
    function (row) {
      return row.id === a.id;
    },
  );

  assert.equal(
    old?.status,
    "SUPERSEDED",
  );
});
