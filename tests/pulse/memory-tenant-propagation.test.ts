import assert from "node:assert/strict";
import test from "node:test";

import {
  compilePlaybook,
} from "../../src/DigitalBoostPulseIntel";
import {
  verifyPulseMemory,
  queryPulseMemory,
  rememberPulse,
} from "../../src/DigitalBoostPulseMemory";

import { pushExecutionAudit } from "../../src/DigitalBoostPulseLog";
import {
  createPulseExecutionAttestation,
} from "../../src/DigitalBoostPulseOutcomeProof";
import {
  cancelPulseMission,
  startPulseMission,
} from "../../src/DigitalBoostPulseMission";
import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";
import {
  createPulseExperiment,
  startPulseExperiment,
  stopPulseExperiment,
} from "../../src/DigitalBoostPulseExperiment";

class Storage {
  private rows = new Map<string, string>();

  getItem(key: string): string | null {
    return this.rows.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.rows.set(key, value);
  }

  removeItem(key: string): void {
    this.rows.delete(key);
  }

  clear(): void {
    this.rows.clear();
  }
}

const storage = new Storage();

Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
});

function reset(): void {
  storage.clear();
}


function makeTenantVerificationEvidence(input: {
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
    plan_id: "plan_playbook_verification",
    step_id: "step_playbook_verification",
    step_index: 0,
    verification_status: "VERIFIED",
    verified: true,
  });

  const executionAttestation =
    createPulseExecutionAttestation({
      missionId: input.missionId,
      planId: "plan_playbook_verification",
      stepId: "step_playbook_verification",
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

test(
  "P0.6.1 explicit tenant propagates into mission outcome memory",
  () => {
    reset();

    const tenantA = "tenant-a";
    const tenantB = "tenant-b";
    const store = "SharedStore";

    const planA = compilePulseGoal({
      action: "analyze",
      store,
      tenantId: tenantA,
    });

    const planB = compilePulseGoal({
      action: "analyze",
      store,
      tenantId: tenantB,
    });

    assert.equal(planA.goal.tenantId, tenantA);
    assert.equal(planB.goal.tenantId, tenantB);

    const missionA = startPulseMission({
      store,
      tenantId: tenantA,
      plan: planA,
      requestId: "req-tenant-a",
    });

    const missionB = startPulseMission({
      store,
      tenantId: tenantB,
      plan: planB,
      requestId: "req-tenant-b",
    });

    cancelPulseMission(missionA.id);
    cancelPulseMission(missionB.id);

    const memoryA = queryPulseMemory({
      tenantId: tenantA,
      kind: "mission",
    });

    const memoryB = queryPulseMemory({
      tenantId: tenantB,
      kind: "mission",
    });

    assert.equal(memoryA.length, 1);
    assert.equal(memoryB.length, 1);

    assert.equal(
      (memoryA[0].content as Record<string, unknown>)
        .missionId,
      missionA.id,
    );

    assert.equal(
      (memoryB[0].content as Record<string, unknown>)
        .missionId,
      missionB.id,
    );

    assert.equal(memoryA[0].tenantId, tenantA);
    assert.equal(memoryB[0].tenantId, tenantB);
  },
);

test(
  "P0.6.1 same store does not cross tenant mission memory",
  () => {
    reset();

    const store = "SharedStore";

    const planA = compilePulseGoal({
      action: "analyze",
      store,
      tenantId: "tenant-a",
    });

    const missionA = startPulseMission({
      store,
      tenantId: "tenant-a",
      plan: planA,
      requestId: "req-a",
    });

    cancelPulseMission(missionA.id);

    const tenantB = queryPulseMemory({
      tenantId: "tenant-b",
      kind: "mission",
    });

    assert.equal(tenantB.length, 0);
  },
);

test(
  "P0.6.1 rejects explicit tenant mismatch with plan tenant",
  () => {
    reset();

    const plan = compilePulseGoal({
      action: "analyze",
      store: "SharedStore",
      tenantId: "tenant-a",
    });

    assert.throws(
      () =>
        startPulseMission({
          store: "SharedStore",
          tenantId: "tenant-b",
          plan,
          requestId: "req-mismatch",
        }),
      /PULSE_TENANT_MISMATCH/,
    );
  },
);

test(
  "P0.6.1 legacy mission remains compatible",
  () => {
    reset();

    const plan = compilePulseGoal({
      action: "analyze",
      store: "LegacyStore",
    });

    const mission = startPulseMission({
      store: "LegacyStore",
      plan,
      requestId: "req-legacy",
    });

    assert.equal(
      mission.plan.goal.tenantId,
      "LegacyStore",
    );
  },
);

test(
  "P0.6.1 explicit tenant is preserved for lesson fixture",
  () => {
    reset();

    const tenant = "tenant-experiment";
    const experimentId = "experiment-fixture";

    const lesson = rememberPulse({
      kind: "lesson",
      scope: "SharedStore",
      tenantId: tenant,
      store: "SharedStore",
      source: "executor",
      evidenceRefs: ["fixture-evidence"],
      confidence: 0.6,
      content: {
        experimentId,
        hypothesis: {
          statement: "hero title is present",
          metric: "hero_title_present",
          direction: "up",
        },
        result: "fixture",
      },
    });

    assert.ok(lesson);

    const lessons = queryPulseMemory({
      kind: "lesson",
      tenantId: tenant,
      scope: "SharedStore",
    });

    assert.equal(lessons.length, 1);
    assert.equal(lessons[0].tenantId, tenant);
    assert.equal(
      lessons[0].content &&
        typeof lessons[0].content === "object" &&
        (lessons[0].content as Record<string, unknown>)
          .experimentId,
      experimentId,
    );
  },
);

test(
  "P0.6.1 same-store experiments are isolated by explicit tenant",
  () => {
    reset();

    const variant = {
      id: "a",
      label: "A",
      action: "hero",
      payload: {},
    };

    const expA = createPulseExperiment({
      store: "SharedStore",
      tenantId: "tenant-a",
      hypothesis: {
        statement: "hero title is present",
        metric: "hero_title_present",
        direction: "up",
      },
      variants: [variant],
    });

    const expB = createPulseExperiment({
      store: "SharedStore",
      tenantId: "tenant-b",
      hypothesis: {
        statement: "hero title is present",
        metric: "hero_title_present",
        direction: "up",
      },
      variants: [variant],
    });

    assert.ok(expA);
    assert.ok(expB);

    assert.ok(
      startPulseExperiment(expA.id),
    );

    assert.ok(
      startPulseExperiment(expB.id),
    );
  },
);

test(
  "P0.6.1 explicit-tenant playbook requires verified lessons",
  () => {
    reset();

    const tenant = "tenant-playbook";

    const lesson = queryPulseMemory({
      tenantId: tenant,
      kind: "lesson",
    });

    assert.equal(lesson.length, 0);

    const noLessons = compilePlaybook(
      "PlaybookStore",
      tenant,
    );

    assert.equal(noLessons.ok, false);

    const stored = queryPulseMemory({
      tenantId: tenant,
      kind: "lesson",
    });

    assert.equal(stored.length, 0);
  },
);

test(
  "P0.6.1 verified lesson enters trusted playbook retrieval",
  () => {
    reset();

    const tenant = "tenant-playbook";
    const lesson = rememberPulse({
      kind: "lesson",
      scope: "PlaybookStore",
      tenantId: tenant,
      store: "PlaybookStore",
      source: "executor",
      evidenceRefs: ["fixture"],
      confidence: 0.6,
      content: {
        experimentId: "lesson-fixture",
        hypothesis: {
          statement: "hero title is present",
          metric: "hero_title_present",
          direction: "up",
        },
        result: "fixture",
      },
    });

    assert.ok(lesson);

    const evidence =
      makeTenantVerificationEvidence({
        tenantId: tenant,
        store: "PlaybookStore",
        missionId: "lesson-fixture",
        requestId: "req_lesson_fixture",
      });

    assert.equal(
      verifyPulseMemory({
        id: lesson.id,
        tenantId: tenant,
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

    const playbook = compilePlaybook(
      "PlaybookStore",
      tenant,
    );

    assert.equal(playbook.ok, true);
    assert.deepEqual(
      playbook.steps,
      ["review:" + lesson.id],
    );
  },
);
