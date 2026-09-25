import assert from "node:assert/strict";
import test from "node:test";

import {
  createPulseExecutionAttestation,
} from "../../src/DigitalBoostPulseOutcomeProof";

import {
  pushExecutionAudit,
} from "../../src/DigitalBoostPulseLog";

import {
  governPulseMemory,
  markPulseMemoryStale,
  queryTrustedPulseMemory,
  rememberPulse,
  rejectPulseMemory,
  verifyPulseMemory,
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
(globalThis as { localStorage?: MemoryStorage }).localStorage = storage;

function reset(): void {
  storage.clear();
}

function executionEvidence(input: {
  tenantId: string;
  store: string;
  missionId: string;
  requestId: string;
}) {
  const timestamp = new Date().toISOString();

  const executionAuditId = pushExecutionAudit({
    timestamp,
    tenant_id: input.tenantId,
    store_id: input.store,
    actor_type: "system",
    request_id: input.requestId,
    intent: "memory-verification",
    agent: "pulse",
    risk_level: "L1",
    tool: "memory-test",
    approval_required: false,
    status: "COMPLETED",
    result_summary: "MEMORY_VERIFICATION",
    mission_id: input.missionId,
    plan_id: "plan_memory_hardening",
    step_id: "step_memory_hardening",
    step_index: 0,
    verification_status: "VERIFIED",
    verified: true,
  });

  const executionAttestation =
    createPulseExecutionAttestation({
      missionId: input.missionId,
      planId: "plan_memory_hardening",
      stepId: "step_memory_hardening",
      stepIndex: 0,
      action: "memory-test",
      executionRequestId: input.requestId,
      verificationStatus: "VERIFIED",
      verified: true,
      executionAudit: {
        request_id: input.requestId,
        event: "MEMORY_VERIFICATION",
        state: "COMPLETED",
        action: "memory-test",
        timestamp,
        execution_audit_id: executionAuditId,
      },
      state: "COMPLETED",
    });

  return {
    executionAuditId,
    executionAttestation,
  };
}

function createMemory(input: {
  tenantId: string;
  store: string;
  missionId?: string;
  validUntil?: string;
}) {
  const item = rememberPulse({
    kind: "lesson",
    scope: input.store,
    tenantId: input.tenantId,
    store: input.store,
    source: "executor",
    content: {
      statement: "durable-memory-test",
    },
    missionId: input.missionId,
    validUntil: input.validUntil,
    evidenceRefs: [],
  });

  assert.ok(item);
  return item;
}

function verifyWithExecutionEvidence(
  item: NonNullable<ReturnType<typeof createMemory>>,
) {
  const evidence = executionEvidence({
    tenantId: item.tenantId,
    store: item.store,
    missionId:
      item.missionId ||
      "mission_memory_hardening",
    requestId:
      "req_" +
      item.id,
  });

  const verified = verifyPulseMemory({
    id: item.id,
    tenantId: item.tenantId,
    evidenceRefs: [
      evidence.executionAuditId,
    ],
    evidence: {
      executionAttestation:
        evidence.executionAttestation,
    },
  });

  assert.equal(verified, true);
}

test("fake evidence reference cannot promote memory", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_fake",
  });

  assert.equal(
    verifyPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      evidenceRefs: ["invented-evidence"],
    }),
    false,
  );

  assert.equal(
    queryTrustedPulseMemory({
      tenantId: "tenant-a",
    }).length,
    0,
  );
});

test("durable executor attestation can promote matching memory", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_valid",
  });

  verifyWithExecutionEvidence(item);

  const trusted =
    queryTrustedPulseMemory({
      tenantId: "tenant-a",
      store: "Nimbus",
    });

  assert.equal(trusted.length, 1);
  assert.equal(trusted[0].trust, "VERIFIED");
});

test("execution evidence cannot cross tenants", () => {
  reset();

  const itemA = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_cross",
  });

  const evidence = executionEvidence({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_cross",
    requestId: "req_cross",
  });

  assert.equal(
    verifyPulseMemory({
      id: itemA.id,
      tenantId: "tenant-b",
      evidenceRefs: [
        evidence.executionAuditId,
      ],
      evidence: {
        executionAttestation:
          evidence.executionAttestation,
      },
    }),
    false,
  );
});

test("superseded trusted memory is never resurrected", () => {
  reset();

  const oldItem = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_supersede_old",
  });

  verifyWithExecutionEvidence(oldItem);

  const newItem = rememberPulse({
    kind: "lesson",
    scope: "Nimbus",
    tenantId: "tenant-a",
    store: "Nimbus",
    source: "executor",
    content: {
      statement: "replacement",
    },
    supersedes: oldItem.id,
  });

  assert.ok(newItem);

  const evidence = executionEvidence({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_supersede_new",
    requestId: "req_supersede_new",
  });

  assert.equal(
    verifyPulseMemory({
      id: newItem.id,
      tenantId: "tenant-a",
      evidenceRefs: [
        evidence.executionAuditId,
      ],
      evidence: {
        executionAttestation:
          evidence.executionAttestation,
      },
    }),
    true,
  );

  const trusted =
    queryTrustedPulseMemory({
      tenantId: "tenant-a",
      includeStale: true,
    });

  assert.equal(
    trusted.some(
      (row) => row.id === oldItem.id,
    ),
    false,
  );

  assert.equal(
    trusted.some(
      (row) => row.id === newItem.id,
    ),
    true,
  );
});

test("expired memory is never returned as trusted", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_expired",
    validUntil:
      "2026-09-26T00:00:00.000Z",
  });

  const evidence = executionEvidence({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_expired",
    requestId: "req_expired",
  });

  assert.equal(
    verifyPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      evidenceRefs: [
        evidence.executionAuditId,
      ],
      evidence: {
        executionAttestation:
          evidence.executionAttestation,
      },
      now: Date.parse(
        "2026-09-25T12:00:00.000Z",
      ),
    }),
    true,
  );

  assert.equal(
    queryTrustedPulseMemory({
      tenantId: "tenant-a",
      now: Date.parse(
        "2026-09-27T00:00:00.000Z",
      ),
    }).length,
    0,
  );
});

test("expired memory cannot be promoted", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_expired_verify",
    validUntil:
      "2026-09-24T00:00:00.000Z",
  });

  const evidence = executionEvidence({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_expired_verify",
    requestId: "req_expired_verify",
  });

  assert.equal(
    verifyPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
      evidenceRefs: [
        evidence.executionAuditId,
      ],
      evidence: {
        executionAttestation:
          evidence.executionAttestation,
      },
      now: Date.parse(
        "2026-09-25T12:00:00.000Z",
      ),
    }),
    false,
  );
});

test("tenant is required for stale mutation", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
  });

  assert.equal(
    markPulseMemoryStale({
      id: item.id,
      tenantId: "tenant-b",
    }),
    false,
  );

  assert.equal(
    markPulseMemoryStale({
      id: item.id,
      tenantId: "tenant-a",
    }),
    true,
  );
});

test("tenant is required for rejection mutation", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
  });

  assert.equal(
    rejectPulseMemory({
      id: item.id,
      tenantId: "tenant-b",
    }),
    false,
  );

  assert.equal(
    rejectPulseMemory({
      id: item.id,
      tenantId: "tenant-a",
    }),
    true,
  );
});

test("stale and superseded states cannot become governed", () => {
  reset();

  const item = createMemory({
    tenantId: "tenant-a",
    store: "Nimbus",
    missionId: "mission_governed",
  });

  verifyWithExecutionEvidence(item);

  assert.equal(
    markPulseMemoryStale({
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
    false,
  );
});
