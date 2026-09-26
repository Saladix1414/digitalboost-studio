import { preparePulsePlan } from "./DigitalBoostPulsePlanningEngine";

import {
  buildPulseGoal,
  PULSE_GOAL_ENGINE_CONTRACT,
  type PulseGoalDecision,
  type PulseGoalEvidenceRequirements,
  type PulseGoalPriority,
  type PulseGoalProvenance,
  type PulseIntentClassification,
} from "./DigitalBoostPulseGoalEngine";

import type {
  PulseIntentReconciliationRecord,
} from "./ai/DigitalBoostPulseIntentReconciliationRegistry";

export type PulsePlanStatus =
  | "DRAFT"
  | "READY"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED";

export type PulseMissionTerminalOutcome =
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type PulseGoal = {
  id: string;
  statement: string;
  desiredOutcome?: string;
  constraints: string[];
  successCriteria: string[];
  riskFloor: string;
  priority?: PulseGoalPriority;
  intent?: string;
  intentConfidence?: number;
  tenantId?: string;
  store?: string;
  section?: string;
  contextId?: string;
  contextVersion?: string;
  evidenceRequirements?: PulseGoalEvidenceRequirements;
  provenance?: PulseGoalProvenance;
  fingerprint?: string;
  decision?: PulseGoalDecision;
  clarificationRequired?: boolean;
  authorizationRequired?: boolean;
  goalEngineContract?: string;
};

export type PulsePlanStep = {
  id: string;
  action: string;
  title: string;
  dependsOn: string[];
  expected: Record<string, unknown>;
  checkpoint: boolean;
  approvalLikely: boolean;
  planning?: import("./DigitalBoostPulsePlanningEngine").PulsePlanningStepPolicy;
};

export type PulsePlan = {
  id: string;
  goal: PulseGoal;
  steps: PulsePlanStep[];
  status: PulsePlanStatus;
  createdAt: string;
  planningContract?: string;
  planningDecision?: import("./DigitalBoostPulsePlanningEngine").PulsePlanDecision;
  planFingerprint?: string;
  planningProvenance?: import("./DigitalBoostPulsePlanningEngine").PulsePlanProvenance;
  planningValidation?: import("./DigitalBoostPulsePlanningEngine").PulsePlanValidation;
  executionMode?: "SEQUENTIAL";
};

function nid(prefix: string) {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 5)
  );
}

function step(
  action: string,
  title: string,
  expected: Record<string, unknown>,
  extra: Partial<PulsePlanStep> = {},
): PulsePlanStep {
  return Object.assign(
    {
      id: nid("stp"),
      action,
      title,
      dependsOn: [],
      expected,
      checkpoint: false,
      approvalLikely: false,
    },
    extra,
  );
}

function goalQueryHint(
  action: string,
): string {
  switch (action) {
    case "seo-fix":
      return "corregir seo";

    case "campaigns":
      return "crear una campana";

    case "website-builder":
      return "cambiar el theme";

    case "hero":
      return "cambiar el hero";

    case "optimize":
      return "optimizar";

    case "studio":
      return "configurar tienda";

    case "seo":
      return "auditar seo";

    case "supplier":
      return "buscar proveedor";

    case "stock":
    case "inventory":
      return "revisar stock";

    case "pricing":
      return "actualizar precio";

    case "orders":
      return "estado del pedido";

    case "analyze":
      return "analizar";

    case "reason":
      return "analizar";

    case "explain":
      return "explicar";

    default:
      return action;
  }
}

function compilePulseGoalLegacy(input: {
  q?: string;
  action: string;
  section?: string;
  store?: string;
  tenantId?: string;
  contextId?: string;
  contextVersion?: string;
  intentClassification?: PulseIntentClassification;
  intentReconciliationRecord?:
    PulseIntentReconciliationRecord;
}): PulsePlan {
  const action = input.action;

  const goalQuery =
    input.q?.trim() ||
    goalQueryHint(action);

  const goalResult =
    buildPulseGoal({
      q: goalQuery,
      action,
      section: input.section,
      store: input.store,
      tenantId:
        input.tenantId ||
        input.store,
      contextId:
        input.contextId,
      contextVersion:
        input.contextVersion,
      intentClassification:
        input.intentClassification,
      intentReconciliationRecord:
        input.intentReconciliationRecord,
    });

  const engineGoal =
    goalResult.goal;

  const goal: PulseGoal = {
    id: engineGoal.id,
    statement:
      engineGoal.statement,
    desiredOutcome:
      engineGoal.desiredOutcome,
    constraints: [
      ...engineGoal.constraints,
    ],
    successCriteria: [
      ...engineGoal.successCriteria,
    ],
    riskFloor:
      engineGoal.riskFloor,
    priority:
      engineGoal.priority,
    intent:
      engineGoal.intent,
    intentConfidence:
      engineGoal.intentConfidence,
    tenantId:
      engineGoal.tenantId,
    store:
      engineGoal.store,
    section:
      engineGoal.section,
    contextId:
      engineGoal.contextId,
    contextVersion:
      engineGoal.contextVersion,
    evidenceRequirements:
      engineGoal.evidenceRequirements,
    provenance:
      engineGoal.provenance,
    fingerprint:
      engineGoal.fingerprint,
    decision:
      goalResult.decision,
    clarificationRequired:
      goalResult.clarificationRequired,
    authorizationRequired:
      goalResult.authorizationRequired,
    goalEngineContract:
      PULSE_GOAL_ENGINE_CONTRACT,
  };

  const status: PulsePlanStatus =
    goalResult.decision === "BLOCK"
      ? "BLOCKED"
      : goalResult.decision === "CLARIFY"
        ? "DRAFT"
        : "READY";

  if (action === "studio") {
    const s1 = step(
      "website-builder",
      "Abrir canvas Inicio",
      { page: "Inicio" },
    );

    const s2 = step(
      "hero",
      "Escribir hero con voz",
      { kind: "hero" },
      {
        dependsOn: [s1.id],
        approvalLikely: true,
        checkpoint: true,
      },
    );

    const s3 = step(
      "website-builder",
      "Dejar un solo theme",
      { kind: "theme" },
      {
        dependsOn: [s2.id],
        approvalLikely: true,
      },
    );

    const s4 = step(
      "seo",
      "Revisar SEO de paginas",
      { domain: "seo" },
      {
        dependsOn: [s3.id],
      },
    );

    const s5 = step(
      "campaigns",
      "Campana solo con Pulse Card",
      { risk: "L3" },
      {
        dependsOn: [s4.id],
        approvalLikely: true,
        checkpoint: true,
      },
    );

    return {
      id: nid("plan"),
      goal,
      steps: [
        s1,
        s2,
        s3,
        s4,
        s5,
      ],
      status,
      createdAt:
        new Date().toISOString(),
    };
  }

  const inspect = step(
    "analyze",
    "Leer snapshot actual",
    { snapshot: "CURRENT" },
  );

  const propose = step(
    action,
    "Proponer accion contratada",
    { action },
    {
      dependsOn: [inspect.id],
      approvalLikely:
        goal.riskFloor !== "L0",
      checkpoint:
        goal.riskFloor !== "L0",
    },
  );

  const verify = step(
    "explain",
    "Declarar expected outcome",
    { verified: true },
    {
      dependsOn: [propose.id],
      checkpoint: true,
    },
  );

  return {
    id: nid("plan"),
    goal,
    steps: [
      inspect,
      propose,
      verify,
    ],
    status,
    createdAt:
      new Date().toISOString(),
  };
}

export function planCheckpointActions(
  plan: PulsePlan,
): string[] {
  return plan.steps
    .filter(function (s) {
      return s.checkpoint;
    })
    .map(function (s) {
      return s.action;
    });
}

export function planStatusForMissionOutcome(
  outcome: PulseMissionTerminalOutcome,
): PulsePlanStatus {
  if (outcome === "COMPLETED") {
    return "COMPLETED";
  }

  if (outcome === "CANCELLED") {
    return "CANCELLED";
  }

  return "BLOCKED";
}

export function closePulsePlan(
  plan: PulsePlan,
  outcome: PulseMissionTerminalOutcome,
): PulsePlan {
  const nextStatus =
    planStatusForMissionOutcome(
      outcome,
    );

  if (plan.status === nextStatus) {
    return plan;
  }

  return Object.assign({}, plan, {
    status: nextStatus,
  });
}

export function compilePulseGoal(
  input: Parameters<typeof compilePulseGoalLegacy>[0],
): PulsePlan {
  const legacyPlan = compilePulseGoalLegacy(input);
  return preparePulsePlan({
    plan: legacyPlan,
  }).plan;
}
