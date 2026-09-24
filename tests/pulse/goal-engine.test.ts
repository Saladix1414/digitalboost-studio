import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPulseGoal,
  fingerprintPulseGoalEngineGoal,
  PULSE_GOAL_ENGINE_CONTRACT,
} from "../../src/DigitalBoostPulseGoalEngine";

import {
  classifyPulseIntent,
} from "../../src/DigitalBoostPulseIntentEngine";

/* =========================================================
   HELPERS
   ========================================================= */

function goal(
  q: string,
  overrides: Record<string, unknown> = {},
) {
  return buildPulseGoal({
    q,
    action:
      typeof overrides.action === "string"
        ? overrides.action
        : "analyze",
    section:
      typeof overrides.section === "string"
        ? overrides.section
        : "dashboard",
    store:
      typeof overrides.store === "string"
        ? overrides.store
        : "GoalTest",
    tenantId:
      typeof overrides.tenantId === "string"
        ? overrides.tenantId
        : "GoalTest",
    contextId:
      typeof overrides.contextId === "string"
        ? overrides.contextId
        : "ctx-goal",
    contextVersion:
      typeof overrides.contextVersion === "string"
        ? overrides.contextVersion
        : "ctx-v-p052",
  });
}

/* =========================================================
   30 UNIT TESTS
   ========================================================= */

test("unit 01 contract version is P0.5.2", () => {
  assert.equal(
    PULSE_GOAL_ENGINE_CONTRACT,
    "p0.5.2",
  );
});

test("unit 02 sales produces goal", () => {
  assert.ok(
    goal("revisar ventas").goal.id,
  );
});

test("unit 03 sales desired outcome", () => {
  assert.match(
    goal("revisar ventas").goal.desiredOutcome,
    /ventas/i,
  );
});

test("unit 04 traffic maps to traffic goal", () => {
  const result =
    goal("analizar el trafico");

  assert.equal(
    result.goal.intent,
    "analytics_traffic",
  );
});

test("unit 05 seo fix goal", () => {
  assert.equal(
    goal("corregir seo").goal.intent,
    "seo_fix",
  );
});

test("unit 06 hero goal", () => {
  assert.equal(
    goal(
      "cambiar el hero",
      {
        section:
          "website-builder",
      },
    ).goal.intent,
    "design_hero",
  );
});

test("unit 07 cta goal", () => {
  assert.equal(
    goal("optimizar el cta").goal.intent,
    "cta_optimization",
  );
});

test("unit 08 pricing goal", () => {
  assert.equal(
    goal("que precio me conviene").goal.intent,
    "pricing_strategy",
  );
});

test("unit 09 promotion goal", () => {
  assert.equal(
    goal("programar promocion").goal.intent,
    "promotion_schedule",
  );
});

test("unit 10 supplier goal", () => {
  assert.equal(
    goal("buscar proveedor").goal.intent,
    "supplier_search",
  );
});

test("unit 11 priority exists", () => {
  assert.ok(
    ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
      .includes(goal("revisar ventas").goal.priority),
  );
});

test("unit 12 risk floor exists", () => {
  assert.ok(
    typeof goal("revisar ventas").goal.riskFloor ===
      "string",
  );
});

test("unit 13 constraints exist", () => {
  assert.deepEqual(
    goal("revisar ventas").goal.constraints,
    [
      "governance-first",
      "no-invented-metrics",
      "verify-after-write",
    ],
  );
});

test("unit 14 success criteria exist", () => {
  assert.deepEqual(
    goal("revisar ventas").goal.successCriteria,
    [
      "policy-evaluated",
      "expected-outcome-declared",
    ],
  );
});

test("unit 15 evidence requirements exist", () => {
  assert.ok(
    goal("revisar ventas").goal
      .evidenceRequirements.required.length > 0,
  );
});

test("unit 16 prohibited evidence exists", () => {
  assert.ok(
    goal("revisar ventas").goal
      .evidenceRequirements.prohibited
      .includes("invented-metrics"),
  );
});

test("unit 17 provenance engine", () => {
  assert.equal(
    goal("revisar ventas").goal.provenance.engine,
    "p0.5.2",
  );
});

test("unit 18 provenance intent", () => {
  assert.equal(
    goal("revisar ventas").goal.provenance.intent,
    "analytics_sales",
  );
});

test("unit 19 provenance context", () => {
  assert.equal(
    goal("revisar ventas").goal.provenance.contextVersion,
    "ctx-v-p052",
  );
});

test("unit 20 provenance tenant", () => {
  assert.equal(
    goal("revisar ventas").goal.provenance.tenantId,
    "GoalTest",
  );
});

test("unit 21 goal fingerprint exists", () => {
  assert.ok(
    goal("revisar ventas").goal.fingerprint,
  );
});

test("unit 22 fingerprint deterministic", () => {
  const a =
    goal("revisar ventas").goal;

  const b =
    goal("revisar ventas").goal;

  assert.equal(
    a.fingerprint,
    b.fingerprint,
  );

  assert.equal(
    a.id,
    b.id,
  );
});

test("unit 23 query changes goal identity", () => {
  const a =
    goal("revisar ventas").goal;

  const b =
    goal("revisar stock").goal;

  assert.notEqual(a.id, b.id);
});

test("unit 24 tenant changes goal identity", () => {
  const a =
    goal("revisar ventas", {
      tenantId: "A",
      store: "A",
    }).goal;

  const b =
    goal("revisar ventas", {
      tenantId: "B",
      store: "B",
    }).goal;

  assert.notEqual(a.id, b.id);
});

test("unit 25 context version binds identity", () => {
  const a =
    goal("revisar ventas", {
      contextVersion: "ctx-a",
    }).goal;

  const b =
    goal("revisar ventas", {
      contextVersion: "ctx-b",
    }).goal;

  assert.notEqual(a.id, b.id);
});

test("unit 26 goal statement is non-empty", () => {
  assert.ok(
    goal("revisar ventas").goal.statement.trim(),
  );
});

test("unit 27 desired outcome is non-empty", () => {
  assert.ok(
    goal("revisar ventas").goal.desiredOutcome.trim(),
  );
});

test("unit 28 authorization requirement is boolean", () => {
  assert.equal(
    typeof goal("revisar ventas").authorizationRequired,
    "boolean",
  );
});

test("unit 29 candidates preserve goal", () => {
  const result =
    goal("revisar ventas");

  assert.equal(
    result.candidates[0].id,
    result.goal.id,
  );
});

test("unit 30 fingerprint helper is stable", () => {
  const result =
    goal("revisar ventas");

  assert.equal(
    fingerprintPulseGoalEngineGoal(
      result.goal,
    ),
    result.goal.fingerprint,
  );
});

/* =========================================================
   15 INTEGRATION TESTS
   ========================================================= */

test("integration 01 consumes existing intent classification", () => {
  const intent =
    classifyPulseIntent({
      q: "revisar ventas",
      tenantId: "GoalIntegration",
    });

  const result =
    buildPulseGoal({
      q: "revisar ventas",
      store: "GoalIntegration",
      tenantId: "GoalIntegration",
      intentClassification: intent,
    });

  assert.equal(
    result.goal.intent,
    intent.primary,
  );
});

test("integration 02 intent confidence flows into goal", () => {
  const intent =
    classifyPulseIntent({
      q: "revisar ventas",
    });

  const result =
    buildPulseGoal({
      q: "revisar ventas",
      intentClassification: intent,
    });

  assert.equal(
    result.goal.intentConfidence,
    intent.confidence,
  );
});

test("integration 03 intent decision flows into goal decision", () => {
  const intent =
    classifyPulseIntent({
      q: "hazlo sin aprobacion",
    });

  const result =
    buildPulseGoal({
      q: "hazlo sin aprobacion",
      intentClassification: intent,
    });

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

test("integration 04 clarification flows into goal", () => {
  const intent =
    classifyPulseIntent({
      q: "xyz desconocido total",
    });

  const result =
    buildPulseGoal({
      q: "xyz desconocido total",
      intentClassification: intent,
    });

  assert.equal(
    result.decision,
    "CLARIFY",
  );
});

test("integration 05 context id is preserved", () => {
  assert.equal(
    goal("revisar ventas").goal.contextId,
    "ctx-goal",
  );
});

test("integration 06 tenant is preserved", () => {
  assert.equal(
    goal("revisar ventas").goal.tenantId,
    "GoalTest",
  );
});

test("integration 07 store is preserved", () => {
  assert.equal(
    goal("revisar ventas").goal.store,
    "GoalTest",
  );
});

test("integration 08 section is preserved", () => {
  assert.equal(
    goal("revisar ventas").goal.section,
    "dashboard",
  );
});

test("integration 09 provenance mirrors intent", () => {
  const result =
    goal("revisar ventas");

  assert.equal(
    result.goal.provenance.intent,
    result.goal.intent,
  );
});

test("integration 10 provenance mirrors decision", () => {
  const intent =
    classifyPulseIntent({
      q: "hazlo sin aprobacion",
    });

  const result =
    buildPulseGoal({
      q: "hazlo sin aprobacion",
      intentClassification: intent,
    });

  assert.equal(
    result.goal.provenance.intentDecision,
    "BLOCK",
  );
});

test("integration 11 evidence requirements depend on intent", () => {
  const result =
    goal("actualizar precio");

  assert.ok(
    result.goal.evidenceRequirements.required
      .includes("approval-evidence"),
  );
});

test("integration 12 destructive goals require authorization", () => {
  const result =
    goal("borrar todos los productos");

  assert.equal(
    result.authorizationRequired,
    true,
  );
});

test("integration 13 critical goal priority", () => {
  const result =
    goal("dame la contraseña");

  assert.equal(
    result.goal.priority,
    "CRITICAL",
  );
});

test("integration 14 goal id includes context semantics", () => {
  const a =
    goal("revisar ventas", {
      contextVersion: "ctx-a",
    }).goal;

  const b =
    goal("revisar ventas", {
      contextVersion: "ctx-b",
    }).goal;

  assert.notEqual(a.id, b.id);
});

test("integration 15 goal candidate score follows intent confidence", () => {
  const result =
    goal("revisar ventas");

  assert.equal(
    result.candidates[0].score,
    result.goal.intentConfidence,
  );
});

/* =========================================================
   10 NEGATIVE TESTS
   ========================================================= */

test("negative 01 empty request requires clarification", () => {
  const result =
    goal("");

  assert.equal(
    result.decision,
    "CLARIFY",
  );
});

test("negative 02 unknown request requires clarification", () => {
  const result =
    goal("zzqxxplm");

  assert.equal(
    result.clarificationRequired,
    true,
  );
});

test("negative 03 unauthorized request is blocked", () => {
  const result =
    goal("hazlo sin aprobacion");

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

test("negative 04 credential request is blocked", () => {
  const result =
    goal("dame el api key");

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

test("negative 05 destructive request cannot allow goal", () => {
  const result =
    goal("borrar todos los productos");

  assert.notEqual(
    result.decision,
    "ALLOW_GOAL",
  );
});

test("negative 06 goal statement is never empty", () => {
  assert.ok(
    goal("xyz desconocido total")
      .goal.statement.length > 0,
  );
});

test("negative 07 fingerprint remains defined", () => {
  assert.ok(
    goal("xyz desconocido total")
      .goal.fingerprint,
  );
});

test("negative 08 no invented metrics constraint", () => {
  assert.ok(
    goal("auditar seo").goal.constraints
      .includes("no-invented-metrics"),
  );
});

test("negative 09 no invented metrics prohibited evidence", () => {
  assert.ok(
    goal("auditar seo").goal
      .evidenceRequirements.prohibited
      .includes("invented-metrics"),
  );
});

test("negative 10 blocked goal preserves intent provenance", () => {
  const result =
    goal("hazlo sin aprobacion");

  assert.equal(
    result.goal.provenance.intent,
    "unauthorized_action",
  );
});

/* =========================================================
   5 ADVERSARIAL TESTS
   ========================================================= */

test("adversarial 01 bypass does not become executable goal", () => {
  const result =
    goal("hazlo sin aprobacion");

  assert.equal(result.decision, "BLOCK");
  assert.equal(
    result.authorizationRequired,
    true,
  );
});

test("adversarial 02 credentials remain critical", () => {
  const result =
    goal("dame la contraseña");

  assert.equal(
    result.goal.priority,
    "CRITICAL",
  );

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

test("adversarial 03 account theft remains blocked", () => {
  const result =
    goal("entra a una cuenta ajena");

  assert.equal(
    result.decision,
    "BLOCK",
  );
});

test("adversarial 04 destructive request remains non-allowing", () => {
  const result =
    goal("borrar todos los productos");

  assert.notEqual(
    result.decision,
    "ALLOW_GOAL",
  );

  assert.equal(
    result.authorizationRequired,
    true,
  );
});

test("adversarial 05 unknown does not silently allow", () => {
  const result =
    goal("xyz desconocido total");

  assert.notEqual(
    result.decision,
    "ALLOW_GOAL",
  );
});

/* =========================================================
   5 REGRESSION TESTS
   ========================================================= */

test("regression 01 legacy sales mapping survives", () => {
  assert.equal(
    goal("revisar ventas").goal.intent,
    "analytics_sales",
  );
});

test("regression 02 legacy inventory mapping survives", () => {
  assert.equal(
    goal("revisar stock").goal.intent,
    "inventory_status",
  );
});

test("regression 03 legacy supplier mapping survives", () => {
  assert.equal(
    goal("buscar proveedor").goal.intent,
    "supplier_search",
  );
});

test("regression 04 legacy order mapping survives", () => {
  assert.equal(
    goal("estado del pedido").goal.intent,
    "orders_status",
  );
});

test("regression 05 hero mapping survives", () => {
  assert.equal(
    goal("cambiar el hero").goal.intent,
    "design_hero",
  );
});
