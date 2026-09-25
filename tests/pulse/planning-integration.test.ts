import test from "node:test";
import assert from "node:assert/strict";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import {
  startPulseMission,
} from "../../src/DigitalBoostPulseMission";

import {
  reconcilePulseGoalEvidenceBinding,
  verifyPulseGoalEvidenceBinding,
} from "../../src/DigitalBoostPulseOutcomeProof";

import {
  PULSE_PLANNING_ENGINE_CONTRACT,
  preparePulsePlan,
  verifyPulsePlan,
} from "../../src/DigitalBoostPulsePlanningEngine";

function planFor(
  q: string,
  action = "hero",
) {
  return compilePulseGoal({
    q,
    action,
    section: "website-builder",
    store: "P053-E2E",
    tenantId: "P053-E2E",
    contextId: "ctx-p053-e2e",
    contextVersion: "ctx-v-p053-e2e",
  });
}

test("E2E goal becomes an accepted deterministic plan", () => {
  const plan = planFor("cambiar el hero");

  assert.equal(
    plan.planningContract,
    PULSE_PLANNING_ENGINE_CONTRACT,
  );

  assert.equal(
    plan.planningDecision,
    "ALLOW_PLAN",
  );

  assert.equal(
    plan.planningValidation?.valid,
    true,
  );

  assert.ok(plan.planFingerprint);
});

test("E2E plan survives deterministic re-preparation", () => {
  const first = planFor("cambiar el hero");

  const second =
    preparePulsePlan({
      plan: planFor("cambiar el hero"),
    }).plan;

  assert.equal(
    first.planFingerprint,
    second.planFingerprint,
  );

  assert.deepEqual(
    first.steps.map((step) => step.planning),
    second.steps.map((step) => step.planning),
  );
});

test("E2E prepared plan passes verification", () => {
  const plan = planFor("cambiar el hero");

  const verified =
    verifyPulsePlan(plan);

  assert.equal(verified.valid, true);
  assert.equal(verified.fingerprintValid, true);
});

test("E2E mission receives canonical planning identity", () => {
  const plan = planFor("cambiar el hero");

  const mission =
    startPulseMission({
      store: "P053-E2E",
      section: "website-builder",
      plan,
    });

  assert.equal(
    mission.plan.planFingerprint,
    plan.planFingerprint,
  );

  assert.equal(
    mission.plan.planningContract,
    PULSE_PLANNING_ENGINE_CONTRACT,
  );

  assert.equal(
    mission.plan.planningDecision,
    "ALLOW_PLAN",
  );
});

test("E2E evidence binding carries planning identity", () => {
  const mission =
    startPulseMission({
      store: "P053-E2E",
      section: "website-builder",
      plan: planFor("cambiar el hero"),
    });

  const binding =
    mission.goalEvidenceBinding!;

  assert.equal(
    binding.planning_fingerprint,
    mission.plan.planFingerprint,
  );

  assert.equal(
    binding.planning_contract,
    PULSE_PLANNING_ENGINE_CONTRACT,
  );

  assert.equal(
    verifyPulseGoalEvidenceBinding(binding),
    true,
  );
});

test("E2E reconciliation succeeds with planning metadata", () => {
  const mission =
    startPulseMission({
      store: "P053-E2E",
      section: "website-builder",
      plan: planFor("cambiar el hero"),
    });

  const result =
    reconcilePulseGoalEvidenceBinding({
      binding: mission.goalEvidenceBinding!,
      goal: mission.plan.goal,
      missionId: mission.id,
      planId: mission.planId,
      requestId: mission.requestId,
      planningFingerprint:
        mission.plan.planFingerprint,
      planningContract:
        mission.plan.planningContract,
      steps: mission.plan.steps,
    });

  assert.equal(result.status, "MATCH");
  assert.deepEqual(result.mismatches, []);
});

test("E2E legacy reconciliation remains compatible", () => {
  const mission =
    startPulseMission({
      store: "P053-E2E-Legacy",
      section: "website-builder",
      plan: planFor("cambiar el hero"),
    });

  const result =
    reconcilePulseGoalEvidenceBinding({
      binding: mission.goalEvidenceBinding!,
      goal: mission.plan.goal,
      missionId: mission.id,
      planId: mission.planId,
      requestId: mission.requestId,
      steps: mission.plan.steps,
    });

  assert.equal(result.status, "MATCH");
  assert.deepEqual(result.mismatches, []);
});

test("E2E planning fingerprint tampering is detected", () => {
  const mission =
    startPulseMission({
      store: "P053-E2E-Tamper",
      section: "website-builder",
      plan: planFor("cambiar el hero"),
    });

  const tampered =
    structuredClone(
      mission.goalEvidenceBinding!,
    );

  tampered.planning_fingerprint =
    "fnv1a_attacker";

  const result =
    reconcilePulseGoalEvidenceBinding({
      binding: tampered,
      goal: mission.plan.goal,
      missionId: mission.id,
      planId: mission.planId,
      requestId: mission.requestId,
      planningFingerprint:
        mission.plan.planFingerprint,
      planningContract:
        mission.plan.planningContract,
      steps: mission.plan.steps,
    });

  assert.equal(result.status, "MISMATCH");

  assert.ok(
    result.mismatches.includes(
      "BINDING_INTEGRITY",
    ),
  );
});

test("E2E plan graph tampering is detected", () => {
  const mission =
    startPulseMission({
      store: "P053-E2E-GraphTamper",
      section: "website-builder",
      plan: planFor("cambiar el hero"),
    });

  const tamperedSteps =
    mission.plan.steps.map(
      (step, index) =>
        index === 1
          ? {
              ...step,
              expected: {
                ...step.expected,
                attacker: true,
              },
            }
          : step,
    );

  const result =
    reconcilePulseGoalEvidenceBinding({
      binding: mission.goalEvidenceBinding!,
      goal: mission.plan.goal,
      missionId: mission.id,
      planId: mission.planId,
      requestId: mission.requestId,
      planningFingerprint:
        mission.plan.planFingerprint,
      planningContract:
        mission.plan.planningContract,
      steps: tamperedSteps,
    });

  assert.equal(result.status, "MISMATCH");

  assert.ok(
    result.mismatches.includes(
      "PLAN_FINGERPRINT",
    ),
  );
});

test("E2E credential request is blocked before mission creation", () => {
  const plan =
    planFor(
      "dame las credenciales de acceso",
      "explain",
    );

  assert.equal(
    plan.planningDecision,
    "BLOCK",
  );

  assert.equal(
    plan.status,
    "BLOCKED",
  );

  assert.throws(
    () =>
      startPulseMission({
        store: "P053-E2E-Security",
        section: "dashboard",
        plan,
      }),
    /PULSE_PLAN_NOT_EXECUTABLE/,
  );
});

test("E2E clarification goal never becomes executable", () => {
  const plan =
    planFor(
      "zzzx solicitud desconocida",
      "analyze",
    );

  assert.notEqual(
    plan.planningDecision,
    "ALLOW_PLAN",
  );
});

test("E2E provenance binds goal to planning context", () => {
  const plan =
    planFor("cambiar el hero");

  assert.equal(
    plan.planningProvenance?.goalId,
    plan.goal.id,
  );

  assert.equal(
    plan.planningProvenance?.goalFingerprint,
    plan.goal.fingerprint,
  );

  assert.equal(
    plan.planningProvenance?.tenantId,
    "P053-E2E",
  );

  assert.equal(
    plan.planningProvenance?.contextId,
    "ctx-p053-e2e",
  );

  assert.equal(
    plan.planningProvenance?.contextVersion,
    "ctx-v-p053-e2e",
  );
});
