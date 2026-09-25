import { preparePulsePlan } from "./DigitalBoostPulsePlanningEngine";
import type { PulsePlan, PulseMissionTerminalOutcome } from "./DigitalBoostPulsePlan";
import { closePulsePlan } from "./DigitalBoostPulsePlan";
import {
  createPulseOutcomeContract,
  createPulseOutcomeProof,
  createPulseGoalEvidenceBinding,
  verifyPulseGoalEvidenceBinding,
  reconcilePulseGoalEvidenceBinding,
  fingerprintPulseGoal,
  fingerprintPulsePlan,
  derivePulseOutcomeAssurance,
  type PulseOutcomeContract,
  type PulseOutcomeProof,
  type PulseOutcomeProofEvidence,
  type PulseOutcomeAssuranceStatus,
  type PulseGoalEvidenceBinding,
  type PulseExecutionAttestation,
} from "./DigitalBoostPulseOutcomeProof";
import { rememberMissionOutcome } from "./DigitalBoostPulseMemory";
import { hasPulseMissionOutcomeAudit, pushAudit, requestId } from "./DigitalBoostPulseLog";
import { currentContextVersion } from "./DigitalBoostPulseContext";
import { resolvePulseTenantAttribution } from "./DigitalBoostPulseTenant";
export type PulseMissionState = "RUNNING" | "PAUSED" | "AWAITING_APPROVAL" | "COMPLETED" | "FAILED" | "CANCELLED";
export type PulseMissionOutcome = {
  id: string; status: PulseMissionTerminalOutcome; missionId: string; planId: string;
  requestId: string; planStatus: string; terminalStepIndex: number; recordedAt: string;
  lastError?: string; verificationStatus?: string; verified?: boolean;
  outcomeContractId?: string;
  proofStatus?: "PROVEN" | "UNPROVEN" | "FAILED";
  proofHash?: string;
  proof?: PulseOutcomeProof;
  assuranceStatus?: PulseOutcomeAssuranceStatus;
  goalEvidenceBindingId?: string;
  goalEvidenceBindingHash?: string;
};
export type PulseMission = {
  id: string; store: string; planId: string; state: PulseMissionState;
  requestId: string;
  section?: string;
  repairedFromMissionId?: string;
  repairReason?: string;
  repairContextVersion?: string;
  repairGeneration?: number;
  stepIndex: number; retries: number; maxRetries: number;
  createdAt: string; updatedAt: string; lastError?: string; plan: PulsePlan;
  outcomeContract?: PulseOutcomeContract;
  goalEvidenceBinding?: PulseGoalEvidenceBinding;
  proofChain?: PulseOutcomeProofEvidence[];
  outcome?: PulseMissionOutcome;
};
const KEY = "db-pulse-missions-v1";
export const PULSE_MAX_REPAIR_GENERATIONS = 3;
function readAll(): PulseMission[] {
  if (typeof localStorage === "undefined") return [];
  try { const rows = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows : []; } catch { return []; }
}
function writeAll(rows: PulseMission[]) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(rows.slice(-80))); } catch {}
}
function nid() { return "msn_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 5); }
function outcomeId(missionId: string, status: PulseMissionTerminalOutcome) {
  return "mout_" + missionId + "_" + status.toLowerCase();
}
export function listPulseMissions(): PulseMission[] { return readAll(); }
export function getPulseMission(id: string): PulseMission | null {
  return readAll().filter(function (m) { return m.id === id; })[0] || null;
}

function save(mission: PulseMission): PulseMission {
  const rows = readAll();
  const idx = rows.findIndex(function (m) { return m.id === mission.id; });
  const next = Object.assign({}, mission, { updatedAt: new Date().toISOString() });
  if (idx >= 0) rows[idx] = next; else rows.push(next);
  writeAll(rows);
  return next;
}
function recordProofEvidence(
  mission: PulseMission,
  input: {
    verificationStatus?: string;
    verified?: boolean;
    executionAttestation?: PulseExecutionAttestation;
  },
): PulseMission {
  const step = mission.plan.steps[mission.stepIndex];
  if (!step) return mission;

  const evidence: PulseOutcomeProofEvidence = {
    step_id: step.id,
    step_index: mission.stepIndex,
    action: step.action,
    verification_status: input.verificationStatus,
    verified: input.verified,
    execution_attestation:
      input.executionAttestation,
    recorded_at: new Date().toISOString(),
  };

  return Object.assign({}, mission, {
    proofChain: [
      ...(mission.proofChain || []),
      evidence,
    ].slice(-160),
  });
}

function closeMissionOutcome(
  mission: PulseMission,
  input: {
    status: PulseMissionTerminalOutcome;
    lastError?: string;
    verificationStatus?: string;
    verified?: boolean;
  },
): PulseMission {
  if (mission.outcome) return mission;

  const contract =
    mission.outcomeContract ||
    createPulseOutcomeContract({
      missionId: mission.id,
      planId: mission.planId,
      requestId: mission.requestId,
      steps: mission.plan.steps.map(function (step) {
        return { id: step.id, action: step.action };
      }),
    });

  const plan = closePulsePlan(
    mission.plan,
    input.status,
  );

  const id = outcomeId(
    mission.id,
    input.status,
  );

  const recordedAt = new Date().toISOString();

  const proof = createPulseOutcomeProof({
    contract,
    outcome: input.status,
    planStatus: plan.status,
    evidence: mission.proofChain || [],
    recordedAt,
  });

  const goalEvidenceReconciliation =
    mission.goalEvidenceBinding
      ? reconcilePulseGoalEvidenceBinding({
          binding: mission.goalEvidenceBinding,
          goal: mission.plan.goal,
          missionId: mission.id,
          planId: mission.planId,
          requestId: mission.requestId,
          planningFingerprint:
            mission.plan.planFingerprint,
          planningContract:
            mission.plan.planningContract,
          steps: mission.plan.steps,
        })
      : null;

  const goalEvidenceVerified =
    !!mission.goalEvidenceBinding &&
    verifyPulseGoalEvidenceBinding(
      mission.goalEvidenceBinding,
    ) &&
    goalEvidenceReconciliation?.status === "MATCH";

  const assuranceStatus = derivePulseOutcomeAssurance({
    outcome: input.status,
    proofStatus: proof.status,
    verified: input.verified,
    goalEvidenceVerified,
  });

  const outcome: PulseMissionOutcome = {
    id,
    status: input.status,
    missionId: mission.id,
    planId: mission.planId,
    requestId: mission.requestId,
    planStatus: plan.status,
    terminalStepIndex: mission.stepIndex,
    recordedAt,
    lastError: input.lastError,
    verificationStatus: input.verificationStatus,
    verified: input.verified,
    outcomeContractId: contract.id,
    proofStatus: proof.status,
    proofHash: proof.proof_hash,
    assuranceStatus,
    goalEvidenceBindingId:
      mission.goalEvidenceBinding?.id,
    goalEvidenceBindingHash:
      mission.goalEvidenceBinding?.binding_hash,
    proof,
  };

  try {
    rememberMissionOutcome({
      scope: mission.store,
      tenantId: mission.plan.goal.tenantId || mission.store,
      missionId: mission.id,
      planId: mission.planId,
      requestId: mission.requestId,
      outcome: input.status,
      planStatus: plan.status,
      terminalStepIndex: mission.stepIndex,
      lastError: input.lastError,
      verificationStatus: input.verificationStatus,
      verified: input.verified,
      outcomeContractId: contract.id,
      proofStatus: proof.status,
      proofHash: proof.proof_hash,
      assuranceStatus,
      goalEvidenceBindingId: mission.goalEvidenceBinding?.id,
      goalEvidenceBindingHash: mission.goalEvidenceBinding?.binding_hash,
    });
  } catch {}

  const missionTenant = resolvePulseTenantAttribution({
    goalTenantId: mission.plan.goal.tenantId,
  });

  try {
    if (!hasPulseMissionOutcomeAudit(mission.id, id)) {
      pushAudit({
        timestamp: recordedAt,
        tenant_id: missionTenant.tenantId,
        store_id: mission.store,
        actor_type:
          input.status === "CANCELLED"
            ? "merchant"
            : "system",
        request_id: mission.requestId,
        intent: "mission-outcome",
        agent: "pulse",
        risk_level: mission.plan.goal.riskFloor,
        tool: "mission",
        approval_required: false,
        status: input.status,
        result_summary:
          "PULSE_MISSION_OUTCOME:" + input.status,
        mission_id: mission.id,
        plan_id: mission.planId,
        step_index: mission.stepIndex,
        mission_outcome: input.status,
        plan_status: plan.status,
        outcome_id: id,
        verification_status: input.verificationStatus,
        verified: input.verified,
        outcome_contract_id: contract.id,
        proof_status: proof.status,
        proof_hash: proof.proof_hash,
        assurance_status: assuranceStatus,
        goal_evidence_binding_id: mission.goalEvidenceBinding?.id,
        goal_evidence_binding_hash: mission.goalEvidenceBinding?.binding_hash,
      });
    }
  } catch {}

  return save(Object.assign({}, mission, {
    plan,
    outcomeContract: contract,
    proofChain: mission.proofChain || [],
    outcome,
  }));
}

export function startPulseMission(input: {
  store: string;
  tenantId?: string;
  plan: PulsePlan;
  requestId?: string;
  section?: string;
  goalEvidence?: {
    policy: string;
    policyVersion?: string;
    proposalHash?: string;
  };
}): PulseMission {

  const explicitTenantId =
    typeof input.tenantId === "string"
      ? input.tenantId.trim()
      : "";

  const planTenantId =
    typeof input.plan.goal.tenantId === "string"
      ? input.plan.goal.tenantId.trim()
      : "";

  if (explicitTenantId && !planTenantId) {
    throw new Error(
      "PULSE_TENANT_ID_MISSING_IN_PLAN",
    );
  }

  if (
    explicitTenantId &&
    planTenantId &&
    explicitTenantId !== planTenantId
  ) {
    throw new Error(
      "PULSE_TENANT_MISMATCH",
    );
  }

  const preparedMissionPlan =
    preparePulsePlan({
      plan: input.plan,
    }).plan;

  if (
    preparedMissionPlan.planningDecision !==
      "ALLOW_PLAN" ||
    !preparedMissionPlan.planningValidation?.valid
  ) {
    throw new Error(
      "PULSE_PLAN_NOT_EXECUTABLE",
    );
  }

  const first = preparedMissionPlan.steps[0];
  const awaiting = Boolean(first && first.approvalLikely);

  const missionId = nid();
  const missionRequestId =
    input.requestId || requestId();

  const outcomeContract =
    createPulseOutcomeContract({
      missionId,
      planId: preparedMissionPlan.id,
      requestId: missionRequestId,
      steps: preparedMissionPlan.steps.map(function (step) {
        return { id: step.id, action: step.action };
      }),
    });

  const goalEvidenceBinding =
    createPulseGoalEvidenceBinding({
      goalId: preparedMissionPlan.goal.id,
      missionId,
      planId: preparedMissionPlan.id,
      requestId: missionRequestId,
      goalFingerprint:
        fingerprintPulseGoal(preparedMissionPlan.goal),
      planFingerprint:
        fingerprintPulsePlan(preparedMissionPlan.steps),
      planningFingerprint:
        preparedMissionPlan.planFingerprint,
      planningContract:
        preparedMissionPlan.planningContract,
      successCriteria:
        preparedMissionPlan.goal.successCriteria,
      policy: input.goalEvidence?.policy || "UNKNOWN",
      policyVersion:
        input.goalEvidence?.policyVersion,
      proposalHash:
        input.goalEvidence?.proposalHash,
      expectedSteps:
        preparedMissionPlan.steps.map(function (step, step_index) {
          return {
            step_id: step.id,
            step_index,
            action: step.action,
            expected: step.expected,
          };
        }),
    });

  return save({
    id: missionId,
    store: input.store,
    planId: preparedMissionPlan.id,
    requestId: missionRequestId,
    section: input.section,
    state: awaiting
      ? "AWAITING_APPROVAL"
      : "RUNNING",
    stepIndex: 0,
    retries: 0,
    maxRetries: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    plan: preparedMissionPlan,
    outcomeContract,
    goalEvidenceBinding,
    proofChain: [],
  });
}

export function pausePulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || (m.state !== "RUNNING" && m.state !== "AWAITING_APPROVAL")) return null;
  return save(Object.assign({}, m, { state: "PAUSED" }));
}
export function resumePulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state !== "PAUSED") return null;
  const step = m.plan.steps[m.stepIndex];
  return save(Object.assign({}, m, { state: step && step.approvalLikely ? "AWAITING_APPROVAL" : "RUNNING" }));
}
export function cancelPulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state === "COMPLETED" || m.state === "FAILED" || m.state === "CANCELLED") return null;
  return closeMissionOutcome(Object.assign({}, m, { state: "CANCELLED" }), { status: "CANCELLED" });
}
export function retryPulseMission(id: string): PulseMission | null {
  const m = getPulseMission(id);
  if (!m || m.state !== "FAILED" || m.outcome) return m || null;
  if (m.retries >= m.maxRetries) return m;
  return save(Object.assign({}, m, { state: "RUNNING", retries: m.retries + 1, lastError: undefined }));
}
export function repairPulseMission(id: string): PulseMission | null {
  const source = getPulseMission(id);

  if (
    !source ||
    source.state !== "FAILED" ||
    !source.outcome ||
    source.lastError !== "CONTEXT_STALE"
  ) {
    return null;
  }

  const generation = source.repairGeneration || 0;

  const sourceTenant = resolvePulseTenantAttribution({
    goalTenantId: source.plan.goal.tenantId,
  });

  if (generation >= PULSE_MAX_REPAIR_GENERATIONS) {
    try {
      pushAudit({
        timestamp: new Date().toISOString(),
        tenant_id: sourceTenant.tenantId,
        store_id: source.store,
        actor_type: "system",
        request_id: source.requestId,
        intent: "mission-repair",
        agent: "pulse",
        risk_level: source.plan.goal.riskFloor,
        tool: "mission-repair",
        approval_required: false,
        status: "REJECTED",
        result_summary: "PULSE_MISSION_REPAIR_LIMIT",
        mission_id: source.id,
        plan_id: source.planId,
        reason_code: "REPAIR_LIMIT",
        repair_reason: "CONTEXT_STALE",
        repair_generation: generation,
      });
    } catch {}

    return null;
  }

  const failedIndex = source.stepIndex;
  const remaining = source.plan.steps.slice(failedIndex);

  if (remaining.length === 0) {
    return null;
  }

  const stepIdMap = new Map<string, string>();

  const repairedSteps = remaining.map(function (oldStep, index) {
    const nextId = "rstep_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 6) +
      "_" +
      index;

    stepIdMap.set(oldStep.id, nextId);

    return Object.assign({}, oldStep, {
      id: nextId,
      dependsOn: [],
    });
  });

  for (let i = 0; i < remaining.length; i++) {
    const oldStep = remaining[i];
    const nextStep = repairedSteps[i];

    nextStep.dependsOn = oldStep.dependsOn
      .filter(function (dependency) {
        return stepIdMap.has(dependency);
      })
      .map(function (dependency) {
        return stepIdMap.get(dependency)!;
      });
  }

  let repairedPlan: PulsePlan = {
    id:
      "rplan_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 6),
    goal: {
      id:
        source.plan.goal.id,

      statement: source.plan.goal.statement,
      desiredOutcome:
        source.plan.goal.desiredOutcome,
      constraints: [...source.plan.goal.constraints],
      successCriteria: [...source.plan.goal.successCriteria],
      riskFloor: source.plan.goal.riskFloor,
      priority:
        source.plan.goal.priority,
      intent:
        source.plan.goal.intent,
      intentConfidence:
        source.plan.goal.intentConfidence,
      tenantId:
        source.plan.goal.tenantId,
      store:
        source.plan.goal.store ||
        source.store,
      section:
        source.plan.goal.section ||
        source.section,
      contextId:
        source.plan.goal.contextId,
      contextVersion:
        source.plan.goal.contextVersion,
      evidenceRequirements:
        source.plan.goal.evidenceRequirements,
      provenance:
        source.plan.goal.provenance,
      fingerprint:
        source.plan.goal.fingerprint,
      decision:
        source.plan.goal.decision,
      clarificationRequired:
        source.plan.goal.clarificationRequired,
      authorizationRequired:
        source.plan.goal.authorizationRequired,
      goalEngineContract:
        source.plan.goal.goalEngineContract,
    },
    steps: repairedSteps,
    status: "READY",
    createdAt: new Date().toISOString(),
  };

  const newMissionId =
    "msn_repair_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 6);

  const newRequestId = requestId();

  let repairContextVersion: string | undefined;

  try {
    repairContextVersion = currentContextVersion({
      store: source.store,
      section: source.section,
    });
  } catch {}

  repairedPlan.goal = {
    ...repairedPlan.goal,
    contextVersion:
      repairContextVersion ||
      repairedPlan.goal.contextVersion,
    provenance:
      repairedPlan.goal.provenance
        ? {
            ...repairedPlan.goal.provenance,
            contextVersion:
              repairContextVersion ||
              repairedPlan.goal.provenance.contextVersion,
          }
        : repairedPlan.goal.provenance,
  };

  repairedPlan.goal = {
    ...repairedPlan.goal,
    fingerprint:
      fingerprintPulseGoal(repairedPlan.goal),
  };

  repairedPlan =
    preparePulsePlan({
      plan: repairedPlan,
    }).plan;

  if (
    repairedPlan.planningDecision !==
      "ALLOW_PLAN" ||
    !repairedPlan.planningValidation?.valid
  ) {
    return null;
  }

  const outcomeContract = createPulseOutcomeContract({
    missionId: newMissionId,
    planId: repairedPlan.id,
    requestId: newRequestId,
    steps: repairedPlan.steps.map(function (step) {
      return {
        id: step.id,
        action: step.action,
      };
    }),
  });


  const goalEvidenceBinding =
    createPulseGoalEvidenceBinding({
      goalId: repairedPlan.goal.id,
      missionId: newMissionId,
      planId: repairedPlan.id,
      requestId: newRequestId,
      goalFingerprint:
        fingerprintPulseGoal(repairedPlan.goal),
      planFingerprint:
        fingerprintPulsePlan(repairedPlan.steps),
      planningFingerprint:
        repairedPlan.planFingerprint,
      planningContract:
        repairedPlan.planningContract,
      successCriteria:
        repairedPlan.goal.successCriteria,
      policy:
        source.goalEvidenceBinding?.policy ||
        "UNKNOWN",
      policyVersion:
        source.goalEvidenceBinding?.policy_version,
      proposalHash:
        source.goalEvidenceBinding?.proposal_hash,
      expectedSteps:
        repairedPlan.steps.map(function (step, step_index) {
          return {
            step_id: step.id,
            step_index,
            action: step.action,
            expected: step.expected,
          };
        }),
    });

  const first = repairedPlan.steps[0];
  const repairedState =
    first && first.approvalLikely
      ? "AWAITING_APPROVAL"
      : "RUNNING";

  const repaired: PulseMission = {
    id: newMissionId,
    store: source.store,
    planId: repairedPlan.id,
    requestId: newRequestId,
    section: source.section,
    repairedFromMissionId: source.id,
    repairReason: "CONTEXT_STALE",
    repairContextVersion,
    repairGeneration: (source.repairGeneration || 0) + 1,
    state: repairedState,
    stepIndex: 0,
    retries: 0,
    maxRetries: source.maxRetries,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    plan: repairedPlan,
    outcomeContract,
    goalEvidenceBinding,
    proofChain: [],
  };

  const repairedMissionTenant = resolvePulseTenantAttribution({
    goalTenantId: repairedPlan.goal.tenantId,
  });

  try {
    pushAudit({
      timestamp: new Date().toISOString(),
      tenant_id: repairedMissionTenant.tenantId,
      store_id: source.store,
      actor_type: "system",
      request_id: newRequestId,
      intent: "mission-repair",
      agent: "pulse",
      risk_level: source.plan.goal.riskFloor,
      tool: "mission-repair",
      approval_required: false,
      status: "REPAIRED",
      result_summary: "PULSE_MISSION_REPAIR:CONTEXT_STALE",
      mission_id: newMissionId,
      plan_id: repairedPlan.id,
      reason_code: "CONTEXT_STALE",
      repair_context_version: repairContextVersion,
      repaired_from_mission_id: source.id,
      repair_reason: "CONTEXT_STALE",
      repair_generation: repaired.repairGeneration,
    });
  } catch {}

  return save(repaired);
}

export function advancePulseMission(
  id: string,
  input: {
    approved?: boolean;
    ok?: boolean;
    error?: string;
    terminal?: boolean;
    verificationStatus?: string;
    verified?: boolean;
    executionAttestation?: PulseExecutionAttestation;
  } = {},
): PulseMission | null {
  const m = getPulseMission(id);
  if (!m) return null;

  if (
    m.state === "CANCELLED" ||
    m.state === "COMPLETED" ||
    m.state === "FAILED"
  ) return m;

  if (m.state === "PAUSED") return null;

  const step = m.plan.steps[m.stepIndex];

  if (!step) {
    return closeMissionOutcome(
      Object.assign({}, m, { state: "COMPLETED" }),
      {
        status: "COMPLETED",
        verificationStatus: input.verificationStatus,
        verified: input.verified,
      },
    );
  }

  if (
    m.state === "AWAITING_APPROVAL" &&
    !input.approved &&
    !input.terminal
  ) return m;

  const withEvidence =
    recordProofEvidence(m, {
      verificationStatus:
        input.verificationStatus,
      verified: input.verified,
      executionAttestation:
        input.executionAttestation,
    });

  if (input.ok === false) {
    const error =
      input.error ||
      (
        input.terminal
          ? "step-failed-terminal"
          : "step-failed"
      );

    if (
      input.terminal ||
      m.retries + 1 > m.maxRetries
    ) {
      return closeMissionOutcome(
        Object.assign({}, withEvidence, {
          state: "FAILED",
          lastError: error,
        }),
        {
          status: "FAILED",
          lastError: error,
          verificationStatus:
            input.verificationStatus,
          verified: input.verified,
        },
      );
    }

    return save(
      Object.assign({}, withEvidence, {
        state: "RUNNING",
        retries: m.retries + 1,
        lastError: error,
      }),
    );
  }

  const nextIndex = m.stepIndex + 1;

  if (nextIndex >= m.plan.steps.length) {
    return closeMissionOutcome(
      Object.assign({}, withEvidence, {
        stepIndex: nextIndex,
        state: "COMPLETED",
        lastError: undefined,
      }),
      {
        status: "COMPLETED",
        verificationStatus:
          input.verificationStatus,
        verified: input.verified,
      },
    );
  }

  const nxt = m.plan.steps[nextIndex];

  return save(
    Object.assign({}, withEvidence, {
      stepIndex: nextIndex,
      state:
        nxt && nxt.approvalLikely
          ? "AWAITING_APPROVAL"
          : "RUNNING",
    }),
  );
}
