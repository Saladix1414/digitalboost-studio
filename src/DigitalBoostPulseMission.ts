import type { PulsePlan, PulseMissionTerminalOutcome } from "./DigitalBoostPulsePlan";
import { closePulsePlan } from "./DigitalBoostPulsePlan";
import {
  createPulseOutcomeContract,
  createPulseOutcomeProof,
  type PulseOutcomeContract,
  type PulseOutcomeProof,
  type PulseOutcomeProofEvidence,
} from "./DigitalBoostPulseOutcomeProof";
import { rememberMissionOutcome } from "./DigitalBoostPulseMemory";
import { hasPulseMissionOutcomeAudit, pushAudit, requestId } from "./DigitalBoostPulseLog";
export type PulseMissionState = "RUNNING" | "PAUSED" | "AWAITING_APPROVAL" | "COMPLETED" | "FAILED" | "CANCELLED";
export type PulseMissionOutcome = {
  id: string; status: PulseMissionTerminalOutcome; missionId: string; planId: string;
  requestId: string; planStatus: string; terminalStepIndex: number; recordedAt: string;
  lastError?: string; verificationStatus?: string; verified?: boolean;
  outcomeContractId?: string;
  proofStatus?: "PROVEN" | "UNPROVEN" | "FAILED";
  proofHash?: string;
  proof?: PulseOutcomeProof;
};
export type PulseMission = {
  id: string; store: string; planId: string; state: PulseMissionState;
  requestId: string;
  stepIndex: number; retries: number; maxRetries: number;
  createdAt: string; updatedAt: string; lastError?: string; plan: PulsePlan;
  outcomeContract?: PulseOutcomeContract;
  proofChain?: PulseOutcomeProofEvidence[];
  outcome?: PulseMissionOutcome;
};
const KEY = "db-pulse-missions-v1";
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
    proof,
  };

  try {
    rememberMissionOutcome({
      scope: mission.store,
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
    });
  } catch {}

  try {
    if (!hasPulseMissionOutcomeAudit(mission.id, id)) {
      pushAudit({
        timestamp: recordedAt,
        tenant_id: "digitalboost",
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
  plan: PulsePlan;
  requestId?: string;
}): PulseMission {
  const first = input.plan.steps[0];
  const awaiting = Boolean(first && first.approvalLikely);

  const missionId = nid();
  const missionRequestId =
    input.requestId || requestId();

  const outcomeContract =
    createPulseOutcomeContract({
      missionId,
      planId: input.plan.id,
      requestId: missionRequestId,
      steps: input.plan.steps.map(function (step) {
        return { id: step.id, action: step.action };
      }),
    });

  return save({
    id: missionId,
    store: input.store,
    planId: input.plan.id,
    requestId: missionRequestId,
    state: awaiting
      ? "AWAITING_APPROVAL"
      : "RUNNING",
    stepIndex: 0,
    retries: 0,
    maxRetries: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    plan: input.plan,
    outcomeContract,
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
export function advancePulseMission(
  id: string,
  input: {
    approved?: boolean;
    ok?: boolean;
    error?: string;
    terminal?: boolean;
    verificationStatus?: string;
    verified?: boolean;
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
    !input.approved
  ) return m;

  const withEvidence =
    recordProofEvidence(m, {
      verificationStatus:
        input.verificationStatus,
      verified: input.verified,
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
