import test from "node:test";
import assert from "node:assert/strict";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import {
  PULSE_PLANNING_ENGINE_CONTRACT,
  fingerprintPulsePlanPlanning,
  preparePulsePlan,
  verifyPulsePlan,
} from "../../src/DigitalBoostPulsePlanningEngine";

function planFor(
  action: string,
  q = "test request",
) {
  return compilePulseGoal({
    q,
    action,
    section: "dashboard",
    store: "PlanningStore",
    tenantId: "PlanningStore",
    contextId: "ctx-p053",
    contextVersion: "ctx-v-p053",
  });
}

test("contract version is P0.5.3", () => {
  assert.equal(
    PULSE_PLANNING_ENGINE_CONTRACT,
    "p0.5.3",
  );
});

test("prepare returns plan", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.ok(result.plan);
  assert.ok(result.plan.steps.length >= 3);
});

test("planning contract is attached", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningContract,
    PULSE_PLANNING_ENGINE_CONTRACT,
  );
});

test("decision exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.ok(result.decision);
  assert.equal(
    result.plan.planningDecision,
    result.decision,
  );
});

test("execution mode is sequential", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.executionMode,
    "SEQUENTIAL",
  );
});

test("plan fingerprint exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.ok(result.plan.planFingerprint);
});

test("plan fingerprint is deterministic", () => {
  const a = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const b = preparePulsePlan({
    plan: forReplay(),
  });

  assert.equal(
    a.plan.planFingerprint,
    b.plan.planFingerprint,
  );
});

function forReplay() {
  return compilePulseGoal({
    q: "cambiar el hero",
    action: "hero",
    section: "dashboard",
    store: "PlanningStore",
    tenantId: "PlanningStore",
    contextId: "ctx-p053",
    contextVersion: "ctx-v-p053",
  });
}

test("goal fingerprint is propagated", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.goalFingerprint,
    result.plan.goal.fingerprint,
  );
});

test("tenant provenance is preserved", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.tenantId,
    "PlanningStore",
  );
});

test("store provenance is preserved", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.store,
    "PlanningStore",
  );
});

test("section provenance is preserved", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.section,
    "dashboard",
  );
});

test("context id provenance is preserved", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.contextId,
    "ctx-p053",
  );
});

test("context version provenance is preserved", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.contextVersion,
    "ctx-v-p053",
  );
});

test("priority provenance exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.priority,
    result.plan.goal.priority || "",
  );
});

test("risk provenance exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningProvenance?.riskFloor,
    result.plan.goal.riskFloor,
  );
});

test("validation object exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.ok(result.plan.planningValidation);
});

test("valid graph is accepted", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningValidation?.valid,
    true,
  );
});

test("dependency map exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.ok(
    result.plan.planningValidation?.dependencyMap,
  );
});

test("topological order exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.ok(
    (result.plan.planningValidation?.topoOrder.length || 0) >= 3,
  );
});

test("step count is reported", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    result.plan.planningValidation?.totalSteps,
    result.plan.steps.length,
  );
});

test("step planning metadata is attached", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.ok(step.planning);
  }
});

test("step fingerprint exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.ok(step.planning?.stepFingerprint);
  }
});

test("step risk exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.match(
      step.planning?.riskFloor || "",
      /^L[0-4]$/,
    );
  }
});

test("verification evidence exists", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.ok(
      step.planning?.verification.includes(
        "policy-evaluated",
      ) ||
        step.planning?.verification.includes(
          "expected-outcome-declared",
        ) ||
        step.planning?.verification.includes(
          "plan-outcome-verified",
        ),
    );
  }
});

test("step execution evidence is required", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.ok(
      step.planning?.requiredEvidence.includes(
        "step-execution-recorded",
      ),
    );
  }
});

test("preconditions are present", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.ok(
      step.planning?.preconditions.includes(
        "dependencies-satisfied",
      ),
    );
  }
});

test("rollback boundary is preserved", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  for (const step of result.plan.steps) {
    assert.ok(
      step.planning?.rollback.includes(
        "preserve-audit-trail",
      ),
    );
  }
});

test("final step becomes a checkpoint", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const last =
    result.plan.steps[result.plan.steps.length - 1];

  assert.equal(last.checkpoint, true);
});

test("graph detects missing dependency", () => {
  const source = planFor("hero", "cambiar el hero");

  const tampered = {
    ...source,
    steps: source.steps.map(
      (step, index) =>
        index === 1
          ? {
              ...step,
              dependsOn: ["missing-step"],
            }
          : step,
    ),
  };

  const result = preparePulsePlan({
    plan: tampered,
  });

  assert.equal(result.decision, "BLOCK");
  assert.equal(
    result.plan.planningValidation?.valid,
    false,
  );
  assert.ok(
    result.plan.planningValidation?.errors.some(
      (error) =>
        error.includes("missing-dependency"),
    ),
  );
});

test("graph detects self dependency", () => {
  const source = planFor("hero", "cambiar el hero");
  const first = source.steps[0];

  const tampered = {
    ...source,
    steps: source.steps.map(
      (step, index) =>
        index === 0
          ? {
              ...step,
              dependsOn: [first.id],
            }
          : step,
    ),
  };

  const result = preparePulsePlan({
    plan: tampered,
  });

  assert.equal(result.decision, "BLOCK");
  assert.ok(
    result.plan.planningValidation?.errors.some(
      (error) =>
        error.includes("self-dependency"),
    ),
  );
});

test("graph detects duplicate ids", () => {
  const source = planFor("hero", "cambiar el hero");
  const duplicateId =
    source.steps[0].id;

  const tampered = {
    ...source,
    steps: source.steps.map(
      (step, index) =>
        index === 1
          ? {
              ...step,
              id: duplicateId,
            }
          : step,
    ),
  };

  const result = preparePulsePlan({
    plan: tampered,
  });

  assert.equal(result.decision, "BLOCK");
  assert.ok(
    result.plan.planningValidation?.errors.some(
      (error) =>
        error.includes("duplicate-step-id"),
    ),
  );
});

test("graph detects cycles", () => {
  const source = planFor("hero", "cambiar el hero");

  if (source.steps.length < 3) {
    throw new Error(
      "fixture requires at least three steps",
    );
  }

  const a = source.steps[0];
  const b = source.steps[1];

  const tampered = {
    ...source,
    steps: source.steps.map(
      (step, index) => {
        if (index === 0) {
          return {
            ...step,
            dependsOn: [b.id],
          };
        }

        if (index === 1) {
          return {
            ...step,
            dependsOn: [a.id],
          };
        }

        return step;
      },
    ),
  };

  const result = preparePulsePlan({
    plan: tampered,
  });

  assert.equal(result.decision, "BLOCK");
  assert.ok(
    result.plan.planningValidation?.errors.some(
      (error) =>
        error.includes("dependency-cycle"),
    ),
  );
});

test("blocked goal remains blocked", () => {
  const source = planFor(
    "explain",
    "dame las credenciales de acceso",
  );

  const result = preparePulsePlan({
    plan: source,
  });

  assert.equal(result.decision, "BLOCK");
  assert.equal(
    result.plan.status,
    "BLOCKED",
  );
});

test("clarification goal remains non-executable", () => {
  const source = planFor(
    "analyze",
    "zzzz desconocido",
  );

  const result = preparePulsePlan({
    plan: source,
  });

  assert.notEqual(
    result.decision,
    "ALLOW_PLAN",
  );
});

test("write plans create approval boundaries", () => {
  const result = preparePulsePlan({
    plan: planFor(
      "hero",
      "cambiar el hero de la tienda",
    ),
  });

  assert.ok(
    result.plan.planningValidation
      ?.approvalBoundaryCount,
  );
});

test("analysis plan can remain without authorization", () => {
  const result = preparePulsePlan({
    plan: planFor(
      "analyze",
      "analizar ventas",
    ),
  });

  assert.notEqual(
    result.decision,
    "BLOCK",
  );
});

test("fingerprint helper recomputes stored fingerprint", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  assert.equal(
    fingerprintPulsePlanPlanning(result.plan),
    result.plan.planFingerprint,
  );
});

test("tampering expected output changes fingerprint", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const tampered = {
    ...result.plan,
    steps: result.plan.steps.map(
      (step, index) =>
        index === 1
          ? {
              ...step,
              expected: {
                ...step.expected,
                tampered: true,
              },
            }
          : step,
    ),
  };

  assert.notEqual(
    fingerprintPulsePlanPlanning(tampered),
    result.plan.planFingerprint,
  );
});

test("tampering dependency changes fingerprint", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const second = result.plan.steps[1];

  const tampered = {
    ...result.plan,
    steps: result.plan.steps.map(
      (step, index) =>
        index === 1
          ? {
              ...step,
              dependsOn: [],
            }
          : step,
    ),
  };

  assert.notEqual(
    fingerprintPulsePlanPlanning(tampered),
    result.plan.planFingerprint,
  );

  assert.notEqual(
    second.dependsOn.join(","),
    "",
  );
});

test("tampering goal fingerprint changes plan fingerprint", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const tampered = {
    ...result.plan,
    goal: {
      ...result.plan.goal,
      fingerprint: "tampered-goal",
    },
  };

  assert.notEqual(
    fingerprintPulsePlanPlanning(tampered),
    result.plan.planFingerprint,
  );
});

test("verify accepts intact plan", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const verified = verifyPulsePlan(
    result.plan,
  );

  assert.equal(verified.valid, true);
  assert.equal(
    verified.fingerprintValid,
    true,
  );
});

test("verify detects fingerprint tampering", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const tampered = {
    ...result.plan,
    planFingerprint: "fnv1a_tampered",
  };

  const verified = verifyPulsePlan(
    tampered,
  );

  assert.equal(
    verified.fingerprintValid,
    false,
  );
});

test("verify detects dependency tampering", () => {
  const result = preparePulsePlan({
    plan: planFor("hero", "cambiar el hero"),
  });

  const tampered = {
    ...result.plan,
    steps: result.plan.steps.map(
      (step, index) =>
        index === 1
          ? {
              ...step,
              dependsOn: ["missing"],
            }
          : step,
    ),
  };

  const verified = verifyPulsePlan(
    tampered,
  );

  assert.equal(verified.valid, false);
});

test("multiple preparations are semantically stable", () => {
  const source = forReplay();

  const first = preparePulsePlan({
    plan: source,
  }).plan;

  const second = preparePulsePlan({
    plan: forReplay(),
  }).plan;

  assert.deepEqual(
    first.steps.map(
      (step) => step.planning,
    ),
    second.steps.map(
      (step) => step.planning,
    ),
  );

  assert.equal(
    first.planFingerprint,
    second.planFingerprint,
  );
});
