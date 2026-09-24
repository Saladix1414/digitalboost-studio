import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import {
  advancePulseMission,
  cancelPulseMission,
  startPulseMission,
} from "../../src/DigitalBoostPulseMission";

import {
  queryPulseMemory,
} from "../../src/DigitalBoostPulseMemory";

import {
  createPulseExecutionAttestation,
  verifyPulseGoalEvidenceBinding,
  verifyPulseExecutionAttestation,
} from "../../src/DigitalBoostPulseOutcomeProof";

import {
  pushAudit,
} from "../../src/DigitalBoostPulseLog";

const storage = new Map<string, string>();

function browser() {
  storage.clear();

  (globalThis as any).localStorage = {
    getItem(key: string) {
      return storage.has(key)
        ? storage.get(key)!
        : null;
    },

    setItem(key: string, value: string) {
      storage.set(key, String(value));
    },

    removeItem(key: string) {
      storage.delete(key);
    },
  };
}

beforeEach(browser);

test(
  "P0.4.5 COMPLETED cierra Mission + Plan + Memory + Audit",
  () => {
    const plan = compilePulseGoal({
      action: "analyze",
      store: "OutcomeComplete",
    });

    const started =
      startPulseMission({
        store: "OutcomeComplete",
        plan,
        requestId:
          "req_outcome_complete",
      });

    advancePulseMission(
      started.id,
      { ok: true },
    );

    advancePulseMission(
      started.id,
      { ok: true },
    );

    const completed =
      advancePulseMission(
        started.id,
        {
          ok: true,
          verificationStatus: "PASS",
          verified: true,
        },
      );

    assert.equal(
      completed?.state,
      "COMPLETED",
    );

    assert.equal(
      completed?.plan.status,
      "COMPLETED",
    );

    assert.equal(
      completed?.outcome?.status,
      "COMPLETED",
    );

    assert.equal(
      completed?.requestId,
      "req_outcome_complete",
    );

    assert.equal(
      completed?.outcome?.requestId,
      "req_outcome_complete",
    );

    assert.equal(
      completed?.outcome?.verified,
      true,
    );

      assert.ok(completed?.goalEvidenceBinding);
      assert.ok(completed?.goalEvidenceBinding?.id);
      assert.ok(completed?.goalEvidenceBinding?.binding_hash);
      assert.equal(
        verifyPulseGoalEvidenceBinding(
          completed!.goalEvidenceBinding!,
        ),
        true,
      );
      assert.equal(
        completed?.outcome?.goalEvidenceBindingId,
        completed?.goalEvidenceBinding?.id,
      );
      assert.equal(
        completed?.outcome?.goalEvidenceBindingHash,
        completed?.goalEvidenceBinding?.binding_hash,
      );

const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeComplete",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId === completed?.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    assert.equal(
      (memories[0].content as any)
        .outcome,
      "COMPLETED",
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    const outcomeAudits =
      audits.filter(
        (row) =>
          row.mission_id ===
            completed?.id &&
          row.mission_outcome ===
            "COMPLETED",
      );

    assert.equal(
      outcomeAudits.length,
      1,
    );

    assert.equal(
      outcomeAudits[0].plan_status,
      "COMPLETED",
    );

      assert.equal(
        outcomeAudits[0].goal_evidence_binding_id,
        completed?.goalEvidenceBinding?.id,
      );
      assert.equal(
        outcomeAudits[0].goal_evidence_binding_hash,
        completed?.goalEvidenceBinding?.binding_hash,
      );},
);

test(
  "P0.4.5 FAILED bloquea Plan y conserva error",
  () => {
    const started =
      startPulseMission({
        store: "OutcomeFailed",
        plan: compilePulseGoal({
          action: "analyze",
          store: "OutcomeFailed",
        }),
        requestId:
          "req_outcome_failed",
      });

    const failed =
      advancePulseMission(
        started.id,
        {
          ok: false,
          terminal: true,
          error:
            "external-check-failed",
        },
      );

    assert.equal(
      failed?.state,
      "FAILED",
    );

    assert.equal(
      failed?.plan.status,
      "BLOCKED",
    );

    assert.equal(
      failed?.outcome?.status,
      "FAILED",
    );

    assert.equal(
      failed?.outcome?.lastError,
      "external-check-failed",
    );

    const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeFailed",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId === failed?.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    assert.equal(
      (memories[0].content as any)
        .lastError,
      "external-check-failed",
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    assert.equal(
      audits.filter(
        (row) =>
          row.mission_id ===
            failed?.id &&
          row.mission_outcome ===
            "FAILED",
      ).length,
      1,
    );
  },
);

test(
  "P0.4.5 CANCELLED cierra Plan y Memory",
  () => {
    const started =
      startPulseMission({
        store: "OutcomeCancelled",
        plan: compilePulseGoal({
          action: "analyze",
          store: "OutcomeCancelled",
        }),
        requestId:
          "req_outcome_cancelled",
      });

    const cancelled =
      cancelPulseMission(
        started.id,
      );

    assert.equal(
      cancelled?.state,
      "CANCELLED",
    );

    assert.equal(
      cancelled?.plan.status,
      "CANCELLED",
    );

    assert.equal(
      cancelled?.outcome?.status,
      "CANCELLED",
    );

    const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeCancelled",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId ===
          cancelled?.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    assert.equal(
      audits.filter(
        (row) =>
          row.mission_id ===
            cancelled?.id &&
          row.mission_outcome ===
            "CANCELLED",
      ).length,
      1,
    );
  },
);

test(
  "P0.4.5 outcome es idempotente",
  () => {
    const started =
      startPulseMission({
        store: "OutcomeIdempotent",
        plan: compilePulseGoal({
          action: "analyze",
          store: "OutcomeIdempotent",
        }),
        requestId:
          "req_outcome_idempotent",
      });

    advancePulseMission(
      started.id,
      { ok: true },
    );

    advancePulseMission(
      started.id,
      { ok: true },
    );

    const completed =
      advancePulseMission(
        started.id,
        {
          ok: true,
          verificationStatus: "PASS",
          verified: true,
        },
      );

    const firstId =
      completed?.outcome?.id;

    const second =
      advancePulseMission(
        started.id,
        { ok: true },
      );

    assert.equal(
      second?.outcome?.id,
      firstId,
    );

    const memories =
      queryPulseMemory({
        kind: "mission",
        scope: "OutcomeIdempotent",
        status: "ACTIVE",
      }).filter(
        (row) =>
          (row.content as any)
            .missionId ===
          started.id,
      );

    assert.equal(
      memories.length,
      1,
    );

    const audits =
      JSON.parse(
        localStorage.getItem(
          "db-pulse-audit-v1",
        ) || "[]",
      ) as Array<
        Record<string, unknown>
      >;

    assert.equal(
      audits.filter(
        (row) =>
          row.mission_id ===
            started.id &&
          row.mission_outcome ===
            "COMPLETED",
      ).length,
      1,
    );
  },
);

test("P0.4.11 Goal alterado impide ASSURED", () => {
  const plan = compilePulseGoal({
    action: "analyze",
    store: "ReconcileOutcome",
  });

  const started = startPulseMission({
    store: "ReconcileOutcome",
    plan,
    requestId: "req_reconcile_outcome",
  });

  const rows = JSON.parse(
    storage.get("db-pulse-missions-v1") || "[]",
  );

  assert.equal(rows.length, 1);

  rows[0].plan.goal.statement =
    rows[0].plan.goal.statement + " TAMPERED";

  storage.set(
    "db-pulse-missions-v1",
    JSON.stringify(rows),
  );

  advancePulseMission(started.id, { ok: true });
  advancePulseMission(started.id, { ok: true });

  const completed = advancePulseMission(
    started.id,
    {
      ok: true,
      verificationStatus: "PASS",
      verified: true,
    },
  );

  assert.equal(completed?.state, "COMPLETED");
  assert.equal(completed?.outcome?.proofStatus, "PROVEN");
  assert.equal(completed?.outcome?.verified, true);
  assert.equal(
    completed?.outcome?.assuranceStatus,
    "UNASSURED",
  );
});

test("P0.4.11 Plan alterado impide ASSURED", () => {
  const plan = compilePulseGoal({
    action: "analyze",
    store: "ReconcilePlan",
  });

  const started = startPulseMission({
    store: "ReconcilePlan",
    plan,
    requestId: "req_reconcile_plan",
  });

  const rows = JSON.parse(
    storage.get("db-pulse-missions-v1") || "[]",
  );

  rows[0].plan.steps[1].expected = {
    ...rows[0].plan.steps[1].expected,
    tampered: true,
  };

  storage.set(
    "db-pulse-missions-v1",
    JSON.stringify(rows),
  );

  advancePulseMission(started.id, { ok: true });
  advancePulseMission(started.id, { ok: true });

  const completed = advancePulseMission(
    started.id,
    {
      ok: true,
      verificationStatus: "PASS",
      verified: true,
    },
  );

  assert.equal(completed?.state, "COMPLETED");
  assert.equal(completed?.outcome?.proofStatus, "PROVEN");
  assert.equal(completed?.outcome?.verified, true);
  assert.equal(
    completed?.outcome?.assuranceStatus,
    "UNASSURED",
  );
});


test("P0.4.12 advance directo no prueba una mutacion sin execution attestation", () => {
  const plan = compilePulseGoal({
    action: "hero",
    store: "AttestationGap",
  });

  const started = startPulseMission({
    store: "AttestationGap",
    plan,
    requestId: "req_attestation_gap",
  });

  const first = advancePulseMission(
    started.id,
    { ok: true },
  );

  assert.equal(first?.stepIndex, 1);
  assert.equal(first?.state, "AWAITING_APPROVAL");

  const second = advancePulseMission(
    started.id,
    {
      approved: true,
      ok: true,
      verificationStatus: "PASS",
      verified: true,
    },
  );

  assert.equal(second?.stepIndex, 2);

  const completed = advancePulseMission(
    started.id,
    {
      approved: true,
      ok: true,
      verificationStatus: "PASS",
      verified: true,
    },
  );

  assert.equal(completed?.state, "COMPLETED");
  assert.equal(
    completed?.outcome?.proofStatus,
    "UNPROVEN",
  );
  assert.equal(
    completed?.outcome?.assuranceStatus,
    "UNASSURED",
  );
  assert.ok(
    completed?.outcome?.proof?.unattested_steps
      .includes(plan.steps[1].id),
  );
});


test("P0.4.13 pushAudit genérico no puede satisfacer execution provenance", () => {
  const requestId = "req_p0413_forged";
  const missionId = "msn_p0413_forged";
  const planId = "plan_p0413_forged";
  const stepId = "stp_p0413_forged";
  const stepIndex = 0;
  const action = "hero";
  const event = "PULSE_ACTION_COMPLETED";
  const executionAuditId = "pexaud_p0413_forged";
  const timestamp = "2026-09-24T00:00:00.000Z";

  const attestation = createPulseExecutionAttestation({
    missionId,
    planId,
    stepId,
    stepIndex,
    action,
    executionRequestId: requestId,
    state: "COMPLETED",
    executionAudit: {
      request_id: requestId,
      event,
      state: "COMPLETED",
      action,
      timestamp,
      execution_audit_id: executionAuditId,
    },
  });

  pushAudit({
    timestamp,
    tenant_id: "digitalboost",
    store_id: "digitalboost",
    actor_type: "merchant",
    request_id: requestId,
    intent: "",
    agent: "",
    risk_level: "L1",
    tool: action,
    approval_required: true,
    status: "COMPLETED",
    result_summary: event,
    mission_id: missionId,
    plan_id: planId,
    step_id: stepId,
    step_index: stepIndex,

    // Intento deliberado de falsificar la autoridad de ejecución.
    execution_issuer: "executor",
    execution_audit_id: executionAuditId,
  });

  const rows = JSON.parse(
    storage.get("db-pulse-audit-v1") || "[]",
  );

  const forgedRow = rows.find(
    (row: any) =>
      row.request_id === requestId,
  );

  assert.ok(forgedRow);

  // pushAudit() debe neutralizar los campos reservados.
  assert.equal(
    forgedRow.execution_issuer,
    undefined,
  );

  assert.equal(
    forgedRow.execution_audit_id,
    undefined,
  );

  // Sin Execution Audit auténtico, la attestation no puede verificarse.
  assert.equal(
    verifyPulseExecutionAttestation(attestation),
    false,
  );
});
