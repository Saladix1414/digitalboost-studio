import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";

import { runCycle } from "../../src/DigitalBoostPulseCycle";
import {
  executePulseMissionStep,
} from "../../src/DigitalBoostPulseMissionExecutor";
import {
  evaluatePulsePolicy,
  createPulseApproval,
  approvePulseAction,
} from "../../src/DigitalBoostPulseGovernance";
import {
  currentContextVersion,
} from "../../src/DigitalBoostPulseContext";
import { createAtomicClaimStore } from "./atomic-claim-store";
import {
  repairPulseMission,
  getPulseMission,
  PULSE_MAX_REPAIR_GENERATIONS,
} from "../../src/DigitalBoostPulseMission";

import {
  verifyPulseGoalEvidenceBinding,
} from "../../src/DigitalBoostPulseOutcomeProof";

const storage = new Map<string, string>();
const atomicClaims = createAtomicClaimStore();

function browser() {
  storage.clear();

  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) =>
      storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
  };

  (globalThis as any).localStorage = localStorageMock;

  (globalThis as any).window = {
    localStorage: localStorageMock,
    __dbSetBlocks() {},
    dispatchEvent() {
      return true;
    },
  };
}

function seedCanvas() {
  const blocks = [{
    id: "hero",
    type: "hero",
    title: "Original",
    body: "Original body",
    cta: "Original CTA",
  }];

  localStorage.setItem("db-store-page-v1", "Inicio");
  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify(blocks),
  );
  localStorage.setItem(
    "db-store-canvas-v1",
    JSON.stringify(blocks),
  );
}

beforeEach(() => {
  browser();
  atomicClaims.reset();
});

test("P0.4.8 repara una Mission fallida por CONTEXT_STALE", () => {
  seedCanvas();

  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "RepairStore",
    action: "hero",
    title: "Hero repair",
    body: "Body repair",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);
const analyze = evaluatePulsePolicy(
    "analyze",
    "L0",
    false,
    "req_repair_analyze",
    {
      action: "analyze",
      target: "RepairStore:website-builder:analyze",
      actor: "merchant",
      tenant: "RepairStore",
      context_version: currentContextVersion({
        store: "RepairStore",
        section: "website-builder",
      }),
      proposal: { action: "analyze" },
    },
  );

  const first = executePulseMissionStep(
    cycle.mission.id,
    { envelope: analyze },
  );

  assert.equal(first.execution.state, "COMPLETED");
  assert.equal(first.mission?.stepIndex, 1);

  const draft = {
    kind: "hero",
    title: "Hero repair",
    body: "Body repair",
    cta: "Entrar",
  };

  const approvedContext = currentContextVersion({
    store: "RepairStore",
    section: "website-builder",
  });

  const hero = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_repair_hero",
    {
      action: "hero",
      target: "RepairStore:website-builder:hero",
      actor: "merchant",
      tenant: "RepairStore",
      context_version: approvedContext,
      proposal: draft,
    },
  );

  const approval = approvePulseAction(
    createPulseApproval(hero)!,
  );

  // Drift posterior al approval.
  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify([
      {
        id: "hero",
        type: "hero",
        title: "Context changed",
        body: "Changed",
        cta: "Changed",
      },
    ]),
  );

  localStorage.setItem(
    "db-store-canvas-v1",
    localStorage.getItem("db-store-canvas-v1:Inicio")!,
  );

  const failed = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: hero,
      approval,
      draft,
    },
  );

  assert.equal(failed.execution.state, "REJECTED");
  assert.equal(failed.execution.error, "CONTEXT_STALE");
  assert.equal(failed.mission?.state, "FAILED");
  assert.equal(failed.mission?.outcome?.status, "FAILED");

  const original = getPulseMission(cycle.mission.id)!;

  const repaired = repairPulseMission(original.id);

  assert.ok(repaired);
  assert.notEqual(repaired.id, original.id);
  assert.notEqual(repaired.planId, original.planId);
  assert.notEqual(repaired.requestId, original.requestId);

  assert.equal(
    repaired.repairedFromMissionId,
    original.id,
  );
  assert.equal(
    repaired.repairReason,
    "CONTEXT_STALE",
  );
  assert.equal(
    repaired.repairGeneration,
    1,
  );

  assert.equal(
    repaired.repairContextVersion,
    currentContextVersion({
      store: "RepairStore",
      section: "website-builder",
    }),
  );

  assert.equal(repaired.stepIndex, 0);
  assert.equal(
    repaired.plan.steps[0].action,
    "hero",
  );
  assert.equal(
    repaired.state,
    "AWAITING_APPROVAL",
  );

  assert.equal(original.state, "FAILED");
  assert.equal(original.outcome?.status, "FAILED");
  assert.equal(original.repairedFromMissionId, undefined);

  const audits = JSON.parse(
    localStorage.getItem("db-pulse-audit-v1") || "[]",
  ) as Array<Record<string, unknown>>;

  const repairAudit = audits.find(
    (row) =>
      row.mission_id === repaired.id &&
      row.result_summary ===
        "PULSE_MISSION_REPAIR:CONTEXT_STALE",
  );

  assert.ok(repairAudit);
  assert.equal(
    repairAudit?.repaired_from_mission_id,
    original.id,
  );
  assert.equal(
    repairAudit?.repair_reason,
    "CONTEXT_STALE",
  );
  assert.equal(
    repairAudit?.repair_generation,
    1,
  );
});

test("P0.4.8 reparación exige nuevo approval y puede continuar", () => {
  seedCanvas();

  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "RepairResume",
    action: "hero",
    title: "Hero resume",
    body: "Body resume",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);

  const originalBindingId =
    cycle.mission?.goalEvidenceBinding?.id;
  const originalBindingHash =
    cycle.mission?.goalEvidenceBinding?.binding_hash;

  assert.ok(originalBindingId);
  assert.ok(originalBindingHash);
  assert.equal(
    verifyPulseGoalEvidenceBinding(
      cycle.mission!.goalEvidenceBinding!,
    ),
    true,
  );

  const analyze = evaluatePulsePolicy(
    "analyze",
    "L0",
    false,
    "req_resume_analyze",
    {
      action: "analyze",
      target: "RepairResume:website-builder:analyze",
      actor: "merchant",
      tenant: "RepairResume",
      context_version: currentContextVersion({
        store: "RepairResume",
        section: "website-builder",
      }),
      proposal: { action: "analyze" },
    },
  );

  const first = executePulseMissionStep(
    cycle.mission.id,
    { envelope: analyze },
  );

  assert.equal(first.execution.state, "COMPLETED");
  assert.equal(first.mission?.stepIndex, 1);

  const draft = {
    kind: "hero",
    title: "Hero resume",
    body: "Body resume",
    cta: "Entrar",
  };

  const approvedContext = currentContextVersion({
    store: "RepairResume",
    section: "website-builder",
  });

  const hero = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_resume_hero",
    {
      action: "hero",
      target: "RepairResume:website-builder:hero",
      actor: "merchant",
      tenant: "RepairResume",
      context_version: approvedContext,
      proposal: draft,
    },
  );

  const approval = approvePulseAction(
    createPulseApproval(hero)!,
  );

  // Provocar drift después de la aprobación.
  localStorage.setItem(
    "db-store-canvas-v1:Inicio",
    JSON.stringify([
      {
        id: "hero",
        type: "hero",
        title: "Changed",
        body: "Changed",
        cta: "Changed",
      },
    ]),
  );

  localStorage.setItem(
    "db-store-canvas-v1",
    localStorage.getItem("db-store-canvas-v1:Inicio")!,
  );

  const failed = executePulseMissionStep(
    cycle.mission.id,
    {
      envelope: hero,
      approval,
      draft,
    },
  );

  assert.equal(failed.execution.state, "REJECTED");
  assert.equal(failed.execution.error, "CONTEXT_STALE");

  const repaired = repairPulseMission(cycle.mission.id);

  assert.ok(repaired);
  assert.equal(repaired?.state, "AWAITING_APPROVAL");

  assert.ok(repaired?.goalEvidenceBinding);
  assert.ok(repaired?.goalEvidenceBinding?.id);
  assert.ok(repaired?.goalEvidenceBinding?.binding_hash);
  assert.equal(
    verifyPulseGoalEvidenceBinding(
      repaired!.goalEvidenceBinding!,
    ),
    true,
  );
  assert.notEqual(
    repaired?.goalEvidenceBinding?.id,
    originalBindingId,
  );
  assert.notEqual(
    repaired?.goalEvidenceBinding?.binding_hash,
    originalBindingHash,
  );

// El approval original pertenece a la Mission vieja y no puede reutilizarse.
  assert.equal(
    repaired?.requestId === hero.request_id,
    false,
  );

  const freshContext = currentContextVersion({
    store: "RepairResume",
    section: "website-builder",
  });

  const repairedHero = evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    "req_resume_repaired_hero",
    {
      action: "hero",
      target: "RepairResume:website-builder:hero",
      actor: "merchant",
      tenant: "RepairResume",
      context_version: freshContext,
      proposal: draft,
    },
  );

  const freshApproval = approvePulseAction(
    createPulseApproval(repairedHero)!,
  );

  const resumed = executePulseMissionStep(
    repaired!.id,
    {
      envelope: repairedHero,
      approval: freshApproval,
      draft,
      claimStore: atomicClaims.store,
    },
  );

  assert.equal(resumed.execution.state, "COMPLETED");
  assert.equal(resumed.execution.verified, true);
  assert.equal(resumed.mission?.stepIndex, 1);
  assert.equal(resumed.mission?.state, "RUNNING");
});

test("P0.4.8 limita generaciones de repair y deja Audit", () => {
  seedCanvas();

  const limitedMission = {
    id: "mission_repair_limit",
    store: "RepairLimit",
    planId: "plan_repair_limit",
    requestId: "req_repair_limit",
    state: "FAILED",
    section: "website-builder",
    stepIndex: 0,
    retries: 0,
    maxRetries: 2,
    repairGeneration: PULSE_MAX_REPAIR_GENERATIONS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastError: "CONTEXT_STALE",
    plan: {
      id: "plan_repair_limit",
      goal: {
        id: "goal_repair_limit",
        statement: "repair limit",
        constraints: [],
        successCriteria: [],
        riskFloor: "L1",
      },
      steps: [{
        id: "step_repair_limit",
        action: "hero",
        title: "Hero",
        dependsOn: [],
        expected: {},
        checkpoint: true,
        approvalLikely: true,
      }],
      status: "BLOCKED",
      createdAt: new Date().toISOString(),
    },
    outcome: {
      id: "out_repair_limit",
      status: "FAILED",
    },
  };

  localStorage.setItem(
    "db-pulse-missions-v1",
    JSON.stringify([limitedMission]),
  );

  const repaired = repairPulseMission(
    "mission_repair_limit",
  );

  assert.equal(repaired, null);

  const audits = JSON.parse(
    localStorage.getItem("db-pulse-audit-v1") || "[]",
  ) as Array<Record<string, unknown>>;

  const audit = audits.at(-1);

  assert.equal(
    audit?.reason_code,
    "REPAIR_LIMIT",
  );
  assert.equal(
    audit?.result_summary,
    "PULSE_MISSION_REPAIR_LIMIT",
  );
  assert.equal(
    audit?.repair_generation,
    PULSE_MAX_REPAIR_GENERATIONS,
  );
});

test("P0.4.8 no repara una Mission no elegible", () => {
  seedCanvas();

  const cycle = runCycle({
    q: "mejora el hero",
    section: "website-builder",
    store: "NoRepair",
    action: "hero",
    title: "Hero",
    body: "Body",
    alreadyConfirm: false,
  });

  assert.ok(cycle.mission);
  assert.equal(
    repairPulseMission(cycle.mission.id),
    null,
  );
});
