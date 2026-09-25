import { hashProposal } from "./DigitalBoostPulseContracts";
import type {
  PulsePlan,
  PulsePlanStep,
} from "./DigitalBoostPulsePlan";

export const PULSE_PLANNING_ENGINE_CONTRACT = "p0.5.3" as const;

export type PulsePlanDecision =
  | "ALLOW_PLAN"
  | "CLARIFY"
  | "BLOCK";

export type PulsePlanningStepPolicy = {
  stepFingerprint: string;
  riskFloor: string;
  approvalRequired: boolean;
  authorizationRequired: boolean;
  checkpointRequired: boolean;
  requiredEvidence: string[];
  verification: string[];
  preconditions: string[];
  rollback: string[];
};

export type PulsePlanValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  topoOrder: string[];
  dependencyMap: Record<string, string[]>;
  totalSteps: number;
  checkpointCount: number;
  approvalBoundaryCount: number;
};

export type PulsePlanProvenance = {
  engine: typeof PULSE_PLANNING_ENGINE_CONTRACT;
  source: "pulse-goal";
  goalId: string;
  goalFingerprint: string;
  tenantId: string;
  store: string;
  section: string;
  contextId: string;
  contextVersion: string;
  priority: string;
  riskFloor: string;
};

export type PulsePlanningResult = {
  plan: PulsePlan;
  decision: PulsePlanDecision;
  validation: PulsePlanValidation;
};

type PlanningGoal = PulsePlan["goal"];

function levelOf(value: string | undefined): number {
  const match = String(value || "").match(/^L([0-4])$/);
  return match ? Number(match[1]) : 0;
}

function isWriteAction(action: string): boolean {
  return !new Set([
    "analyze",
    "reason",
    "explain",
  ]).has(action);
}

function fallbackGoalFingerprint(goal: PlanningGoal): string {
  return hashProposal({
    id: goal.id,
    statement: goal.statement,
    desiredOutcome: goal.desiredOutcome || "",
    constraints: [...goal.constraints],
    successCriteria: [...goal.successCriteria],
    riskFloor: goal.riskFloor,
    priority: goal.priority || "",
    intent: goal.intent || "",
    intentConfidence: goal.intentConfidence ?? 0,
    tenantId: goal.tenantId || "",
    store: goal.store || "",
    section: goal.section || "",
    contextId: goal.contextId || "",
    contextVersion: goal.contextVersion || "",
    evidenceRequirements: {
      required: [...(goal.evidenceRequirements?.required || [])],
      prohibited: [...(goal.evidenceRequirements?.prohibited || [])],
    },
  });
}

function goalFingerprint(goal: PlanningGoal): string {
  return goal.fingerprint || fallbackGoalFingerprint(goal);
}

function dependencyOrdinals(
  steps: PulsePlanStep[],
): Map<string, number> {
  return new Map(
    steps.map((step, index) => [step.id, index]),
  );
}

function canonicalDependencyRefs(
  step: PulsePlanStep,
  steps: PulsePlanStep[],
): Array<number | string> {
  const ordinals = dependencyOrdinals(steps);

  return step.dependsOn.map((dependency) => {
    const ordinal = ordinals.get(dependency);
    return ordinal === undefined
      ? `missing:${dependency}`
      : ordinal;
  });
}

function canonicalStep(
  step: PulsePlanStep,
  steps: PulsePlanStep[],
) {
  return {
    action: step.action,
    title: step.title,
    dependsOn: canonicalDependencyRefs(step, steps),
    expected: step.expected,
    checkpoint: Boolean(step.checkpoint),
    approvalLikely: Boolean(step.approvalLikely),
    planning: step.planning
      ? {
          riskFloor: step.planning.riskFloor,
          approvalRequired: step.planning.approvalRequired,
          authorizationRequired:
            step.planning.authorizationRequired,
          checkpointRequired:
            step.planning.checkpointRequired,
          requiredEvidence: [
            ...step.planning.requiredEvidence,
          ],
          verification: [
            ...step.planning.verification,
          ],
          preconditions: [
            ...step.planning.preconditions,
          ],
          rollback: [
            ...step.planning.rollback,
          ],
        }
      : null,
  };
}

export function fingerprintPulsePlanPlanning(
  plan: PulsePlan,
): string {
  return hashProposal({
    contract: PULSE_PLANNING_ENGINE_CONTRACT,
    goalFingerprint: goalFingerprint(plan.goal),
    status: plan.status,
    planningDecision: plan.planningDecision || "",
    executionMode: plan.executionMode || "SEQUENTIAL",
    steps: plan.steps.map((step) =>
      canonicalStep(step, plan.steps),
    ),
    planningProvenance: plan.planningProvenance
      ? {
          engine: plan.planningProvenance.engine,
          source: plan.planningProvenance.source,
          goalId: plan.planningProvenance.goalId,
          goalFingerprint: plan.planningProvenance.goalFingerprint,
          tenantId: plan.planningProvenance.tenantId,
          store: plan.planningProvenance.store,
          section: plan.planningProvenance.section,
          contextId: plan.planningProvenance.contextId,
          contextVersion: plan.planningProvenance.contextVersion,
          priority: plan.planningProvenance.priority,
          riskFloor: plan.planningProvenance.riskFloor,
        }
      : null,
  });
}

function validatePlanGraph(
  steps: PulsePlanStep[],
): PulsePlanValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dependencyMap: Record<string, string[]> = {};

  const ids = new Set<string>();

  for (const step of steps) {
    if (!step.id) {
      errors.push("step-id-empty");
      continue;
    }

    if (ids.has(step.id)) {
      errors.push(`duplicate-step-id:${step.id}`);
    }

    ids.add(step.id);
    dependencyMap[step.id] = [...step.dependsOn];

    if (!step.action) {
      errors.push(`step-action-empty:${step.id}`);
    }

    if (step.dependsOn.includes(step.id)) {
      errors.push(`self-dependency:${step.id}`);
    }
  }

  for (const step of steps) {
    for (const dependency of step.dependsOn) {
      if (!ids.has(dependency)) {
        errors.push(
          `missing-dependency:${step.id}->${dependency}`,
        );
      }
    }
  }

  const state = new Map<string, 0 | 1 | 2>();
  const topoOrder: string[] = [];

  function visit(id: string): void {
    const current = state.get(id) || 0;

    if (current === 1) {
      errors.push(`dependency-cycle:${id}`);
      return;
    }

    if (current === 2) {
      return;
    }

    state.set(id, 1);

    for (const dependency of dependencyMap[id] || []) {
      if (ids.has(dependency)) {
        visit(dependency);
      }
    }

    state.set(id, 2);
    topoOrder.push(id);
  }

  for (const step of steps) {
    visit(step.id);
  }

  if (steps.length === 0) {
    errors.push("plan-has-no-steps");
  }

  const lastStep = steps[steps.length - 1];

  if (lastStep && !lastStep.checkpoint) {
    warnings.push("final-step-not-checkpoint");
  }

  const checkpointCount = steps.filter(
    (step) => step.checkpoint,
  ).length;

  const approvalBoundaryCount = steps.filter(
    (step) =>
      step.approvalLikely ||
      Boolean(step.planning?.approvalRequired),
  ).length;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    topoOrder,
    dependencyMap,
    totalSteps: steps.length,
    checkpointCount,
    approvalBoundaryCount,
  };
}

function stepPolicy(
  goal: PlanningGoal,
  step: PulsePlanStep,
  index: number,
  total: number,
  allSteps: PulsePlanStep[],
): PulsePlanningStepPolicy {
  const goalRisk = levelOf(goal.riskFloor);
  const actionRisk = isWriteAction(step.action) ? 1 : 0;
  const effectiveRisk = Math.max(goalRisk, actionRisk);

  const authorizationRequired = Boolean(
    goal.authorizationRequired ||
      effectiveRisk >= 3,
  );

  const approvalRequired = Boolean(
    authorizationRequired ||
      effectiveRisk >= 2 ||
      step.approvalLikely,
  );

  const checkpointRequired = Boolean(
    step.checkpoint ||
      approvalRequired ||
      index === total - 1,
  );

  const requiredEvidence = [
    ...(goal.evidenceRequirements?.required || []),
    "step-execution-recorded",
  ];

  const verification = [
    ...(goal.successCriteria || []),
  ];

  if (index === total - 1) {
    verification.push("plan-outcome-verified");
  }

  const preconditions = [
    "goal-authorized",
    "dependencies-satisfied",
  ];

  const rollback = [
    "preserve-audit-trail",
    "stop-before-next-step-on-verification-failure",
  ];

  const seed = hashProposal({
    action: step.action,
    title: step.title,
    dependsOn: canonicalDependencyRefs(
      step,
      allSteps,
    ),
    expected: step.expected,
    riskFloor: goal.riskFloor,
    approvalRequired,
    authorizationRequired,
    checkpointRequired,
    requiredEvidence,
    verification,
    preconditions,
    rollback,
  });

  return {
    stepFingerprint: seed,
    riskFloor: `L${Math.min(4, effectiveRisk)}`,
    approvalRequired,
    authorizationRequired,
    checkpointRequired,
    requiredEvidence: [...new Set(requiredEvidence)],
    verification: [...new Set(verification)],
    preconditions,
    rollback,
  };
}

function decisionFor(
  goal: PlanningGoal,
  validation: PulsePlanValidation,
): PulsePlanDecision {
  if (!validation.valid) {
    return "BLOCK";
  }

  if (
    goal.decision === "BLOCK" ||
    goal.authorizationRequired === false &&
      goal.decision === "BLOCK"
  ) {
    return "BLOCK";
  }

  if (
    goal.decision === "CLARIFY" ||
    goal.clarificationRequired
  ) {
    return "CLARIFY";
  }

  return "ALLOW_PLAN";
}

function statusForDecision(
  original: PulsePlan["status"],
  decision: PulsePlanDecision,
): PulsePlan["status"] {
  if (decision === "BLOCK") {
    return "BLOCKED";
  }

  if (decision === "CLARIFY") {
    return "DRAFT";
  }

  if (original === "COMPLETED" || original === "CANCELLED") {
    return original;
  }

  return "READY";
}

export function preparePulsePlan(
  input: {
    plan: PulsePlan;
  },
): PulsePlanningResult {
  const source = input.plan;
  const goal = source.goal;

  const validation = validatePlanGraph(source.steps);

  const preparedSteps = source.steps.map(
    (step, index, all) => {
      const planning = stepPolicy(
        goal,
        step,
        index,
        all.length,
        all,
      );

      return {
        ...step,
        checkpoint:
          step.checkpoint || planning.checkpointRequired,
        approvalLikely:
          step.approvalLikely || planning.approvalRequired,
        planning,
        dependsOn: [...step.dependsOn],
      };
    },
  );

  const preparedValidation = validatePlanGraph(
    preparedSteps,
  );

  const decision = decisionFor(
    goal,
    preparedValidation,
  );

  const preparedPlan: PulsePlan = {
    ...source,
    status: statusForDecision(
      source.status,
      decision,
    ),
    steps: preparedSteps,
    planningContract:
      PULSE_PLANNING_ENGINE_CONTRACT,
    planningDecision: decision,
    executionMode: "SEQUENTIAL",
    planningValidation: preparedValidation,
    planningProvenance: {
      engine: PULSE_PLANNING_ENGINE_CONTRACT,
      source: "pulse-goal",
      goalId: goal.id,
      goalFingerprint: goalFingerprint(goal),
      tenantId:
        goal.tenantId ||
        goal.store ||
        "",
      store: goal.store || "",
      section: goal.section || "",
      contextId: goal.contextId || "",
      contextVersion:
        goal.contextVersion || "",
      priority: goal.priority || "",
      riskFloor: goal.riskFloor,
    },
  };

  preparedPlan.planFingerprint =
    fingerprintPulsePlanPlanning(preparedPlan);

  return {
    plan: preparedPlan,
    decision,
    validation: preparedValidation,
  };
}

export function verifyPulsePlan(
  plan: PulsePlan,
): PulsePlanValidation & {
  fingerprintValid: boolean;
} {
  const validation = validatePlanGraph(
    plan.steps,
  );

  const expectedFingerprint =
    fingerprintPulsePlanPlanning(plan);

  return {
    ...validation,
    fingerprintValid:
      !plan.planFingerprint ||
      plan.planFingerprint === expectedFingerprint,
  };
}
