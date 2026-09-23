import {
  getActionContract,
  hashProposal,
  stableSerialize,
} from "./DigitalBoostPulseContracts";

export const PULSE_OUTCOME_CONTRACT_VERSION = "pulse-outcome-v1";

export type PulseOutcomeStatus =
  "COMPLETED" | "FAILED" | "CANCELLED";

export type PulseOutcomeProofStatus =
  "PROVEN" | "UNPROVEN" | "FAILED";

export type PulseOutcomeAssuranceStatus =
  "ASSURED" | "PARTIAL" | "UNASSURED";

export type PulseGoalEvidenceBinding = {
  id: string;
  version: "pulse-goal-evidence-v1";
  goal_id: string;
  mission_id: string;
  plan_id: string;
  request_id: string;
  goal_fingerprint: string;
  plan_fingerprint: string;
  success_criteria: string[];
  policy: string;
  policy_version?: string;
  proposal_hash?: string;
  expected_steps: Array<{
    step_id: string;
    step_index: number;
    action: string;
    expected: Record<string, unknown>;
  }>;
  issued_at: string;
  binding_hash: string;
};

export function fingerprintPulseGoal(input: {
  id: string;
  statement: string;
  constraints: string[];
  successCriteria: string[];
  riskFloor: string;
}): string {
  return hashProposal({
    id: input.id,
    statement: input.statement,
    constraints: [...input.constraints],
    successCriteria: [...input.successCriteria],
    riskFloor: input.riskFloor,
  });
}

export function fingerprintPulsePlan(
  steps: Array<{
    id: string;
    action: string;
    title: string;
    dependsOn: string[];
    expected: Record<string, unknown>;
    checkpoint: boolean;
    approvalLikely: boolean;
  }>,
): string {
  return hashProposal({
    steps: steps.map(function (step, step_index) {
      return {
        step_index,
        id: step.id,
        action: step.action,
        title: step.title,
        dependsOn: [...step.dependsOn],
        expected: step.expected,
        checkpoint: step.checkpoint,
        approvalLikely: step.approvalLikely,
      };
    }),
  });
}

export function createPulseGoalEvidenceBinding(input: {
  goalId: string;
  missionId: string;
  planId: string;
  requestId: string;
  goalFingerprint: string;
  planFingerprint: string;
  successCriteria: string[];
  policy: string;
  policyVersion?: string;
  proposalHash?: string;
  expectedSteps: PulseGoalEvidenceBinding["expected_steps"];
}): PulseGoalEvidenceBinding {
  const base = {
    id: "geb_" + input.missionId,
    version: "pulse-goal-evidence-v1" as const,
    goal_id: input.goalId,
    mission_id: input.missionId,
    plan_id: input.planId,
    request_id: input.requestId,
    goal_fingerprint: input.goalFingerprint,
    plan_fingerprint: input.planFingerprint,
    success_criteria: [...input.successCriteria],
    policy: input.policy,
    expected_steps: input.expectedSteps,
    issued_at: new Date().toISOString(),
    ...(input.policyVersion !== undefined
      ? { policy_version: input.policyVersion }
      : {}),
    ...(input.proposalHash !== undefined
      ? { proposal_hash: input.proposalHash }
      : {}),
  };

  return {
    ...base,
    binding_hash: hashProposal(base),
  };
}

export function verifyPulseGoalEvidenceBinding(
  binding: PulseGoalEvidenceBinding,
): boolean {
  const { binding_hash, ...base } = binding;

  return (
    binding.version === "pulse-goal-evidence-v1" &&
    hashProposal(base) === binding_hash &&
    binding.success_criteria.includes("policy-evaluated") &&
    binding.success_criteria.includes(
      "expected-outcome-declared",
    )
  );
}

export type PulseGoalEvidenceReconciliationStatus =
  "MATCH" | "MISMATCH";

export type PulseGoalEvidenceReconciliationResult = {
  status: PulseGoalEvidenceReconciliationStatus;
  mismatches: string[];
};

export function reconcilePulseGoalEvidenceBinding(input: {
  binding: PulseGoalEvidenceBinding;
  goal: {
    id: string;
    statement: string;
    constraints: string[];
    successCriteria: string[];
    riskFloor: string;
  };
  missionId: string;
  planId: string;
  requestId: string;
  steps: Array<{
    id: string;
    action: string;
    title: string;
    dependsOn: string[];
    expected: Record<string, unknown>;
    checkpoint: boolean;
    approvalLikely: boolean;
  }>;
}): PulseGoalEvidenceReconciliationResult {
  const mismatches: string[] = [];

  if (!verifyPulseGoalEvidenceBinding(input.binding))
    mismatches.push("BINDING_INTEGRITY");

  if (input.binding.goal_id !== input.goal.id)
    mismatches.push("GOAL_ID");

  if (input.binding.mission_id !== input.missionId)
    mismatches.push("MISSION_ID");

  if (input.binding.plan_id !== input.planId)
    mismatches.push("PLAN_ID");

  if (input.binding.request_id !== input.requestId)
    mismatches.push("REQUEST_ID");

  if (
    input.binding.goal_fingerprint !==
    fingerprintPulseGoal(input.goal)
  ) {
    mismatches.push("GOAL_FINGERPRINT");
  }

  if (
    input.binding.plan_fingerprint !==
    fingerprintPulsePlan(input.steps)
  ) {
    mismatches.push("PLAN_FINGERPRINT");
  }

  const expectedSteps = input.steps.map(
    function (step, step_index) {
      return {
        step_id: step.id,
        step_index,
        action: step.action,
        expected: step.expected,
      };
    },
  );

  if (
    stableSerialize(input.binding.expected_steps) !==
    stableSerialize(expectedSteps)
  ) {
    mismatches.push("EXPECTED_STEPS");
  }

  if (
    stableSerialize(input.binding.success_criteria) !==
    stableSerialize(input.goal.successCriteria)
  ) {
    mismatches.push("SUCCESS_CRITERIA");
  }

  return {
    status:
      mismatches.length > 0
        ? "MISMATCH"
        : "MATCH",
    mismatches,
  };
}

export function derivePulseOutcomeAssurance(input: {
  outcome: PulseOutcomeStatus;
  proofStatus?: PulseOutcomeProofStatus;
  verified?: boolean;
  goalEvidenceVerified: boolean;
}): PulseOutcomeAssuranceStatus {
  if (input.outcome !== "COMPLETED") {
    return "UNASSURED";
  }

  if (!input.goalEvidenceVerified) {
    return "UNASSURED";
  }

  if (input.proofStatus !== "PROVEN") {
    return "UNASSURED";
  }

  return input.verified === true
    ? "ASSURED"
    : "PARTIAL";
}

export type PulseOutcomeProofRequirement = {
  step_id: string;
  step_index: number;
  action: string;
};

export const PULSE_EXECUTION_ATTESTATION_VERSION =
  "pulse-execution-attestation-v1";

export type PulseExecutionAttestation = {
  version: typeof PULSE_EXECUTION_ATTESTATION_VERSION;
  source: "executor";
  mission_id: string;
  plan_id: string;
  step_id: string;
  step_index: number;
  action: string;
  execution_request_id: string;
  approval_id?: string;
  policy_version?: string;
  proposal_hash?: string;
  executed_proposal_hash?: string;
  expected_context_version?: string;
  current_context_version?: string;
  verification_status?: string;
  verified?: boolean;
  state:
    | "COMPLETED"
    | "FAILED"
    | "AWAITING_APPROVAL"
    | "REJECTED";
  recorded_at: string;
  attestation_hash: string;
};

export function createPulseExecutionAttestation(input: {
  missionId: string;
  planId: string;
  stepId: string;
  stepIndex: number;
  action: string;
  executionRequestId: string;
  approvalId?: string;
  policyVersion?: string;
  proposalHash?: string;
  executedProposalHash?: string;
  expectedContextVersion?: string;
  currentContextVersion?: string;
  verificationStatus?: string;
  verified?: boolean;
  state:
    | "COMPLETED"
    | "FAILED"
    | "AWAITING_APPROVAL"
    | "REJECTED";
}): PulseExecutionAttestation {
  const base = {
    version:
      PULSE_EXECUTION_ATTESTATION_VERSION as const,
    source: "executor" as const,
    mission_id: input.missionId,
    plan_id: input.planId,
    step_id: input.stepId,
    step_index: input.stepIndex,
    action: input.action,
    execution_request_id:
      input.executionRequestId,
    state: input.state,
    recorded_at: new Date().toISOString(),
    ...(input.approvalId !== undefined
      ? { approval_id: input.approvalId }
      : {}),
    ...(input.policyVersion !== undefined
      ? { policy_version: input.policyVersion }
      : {}),
    ...(input.proposalHash !== undefined
      ? { proposal_hash: input.proposalHash }
      : {}),
    ...(input.executedProposalHash !== undefined
      ? {
          executed_proposal_hash:
            input.executedProposalHash,
        }
      : {}),
    ...(input.expectedContextVersion !== undefined
      ? {
          expected_context_version:
            input.expectedContextVersion,
        }
      : {}),
    ...(input.currentContextVersion !== undefined
      ? {
          current_context_version:
            input.currentContextVersion,
        }
      : {}),
    ...(input.verificationStatus !== undefined
      ? {
          verification_status:
            input.verificationStatus,
        }
      : {}),
    ...(input.verified !== undefined
      ? { verified: input.verified }
      : {}),
  };

  return {
    ...base,
    attestation_hash: hashProposal(base),
  };
}

export function verifyPulseExecutionAttestation(
  attestation: PulseExecutionAttestation,
): boolean {
  const {
    attestation_hash,
    ...base
  } = attestation;

  return (
    attestation.version ===
      PULSE_EXECUTION_ATTESTATION_VERSION &&
    attestation.source === "executor" &&
    typeof attestation.execution_request_id ===
      "string" &&
    attestation.execution_request_id.length > 0 &&
    hashProposal(base) === attestation_hash
  );
}

export type PulseOutcomeProofEvidence = {
  step_id: string;
  step_index: number;
  action: string;
  verification_status?: string;
  verified?: boolean;
  execution_attestation?: PulseExecutionAttestation;
  recorded_at: string;
};

export type PulseOutcomeContract = {
  id: string;
  version: typeof PULSE_OUTCOME_CONTRACT_VERSION;
  mission_id: string;
  plan_id: string;
  request_id: string;
  required_proof_steps: PulseOutcomeProofRequirement[];
  issued_at: string;
  contract_hash: string;
};

export type PulseOutcomeProof = {
  id: string;
  contract_id: string;
  contract_hash: string;
  version: typeof PULSE_OUTCOME_CONTRACT_VERSION;
  mission_id: string;
  plan_id: string;
  outcome: PulseOutcomeStatus;
  plan_status: string;
  status: PulseOutcomeProofStatus;
  verified_steps: string[];
  missing_steps: string[];
  failed_steps: string[];
  unattested_steps: string[];
  evidence: PulseOutcomeProofEvidence[];
  recorded_at: string;
  hash_algorithm: "fnv1a";
  proof_hash: string;
};

function contractBase(c: PulseOutcomeContract) {
  return {
    id: c.id,
    version: c.version,
    mission_id: c.mission_id,
    plan_id: c.plan_id,
    request_id: c.request_id,
    required_proof_steps: c.required_proof_steps,
    issued_at: c.issued_at,
  };
}

function planStatusFor(outcome: PulseOutcomeStatus) {
  if (outcome === "COMPLETED") return "COMPLETED";
  if (outcome === "CANCELLED") return "CANCELLED";
  return "BLOCKED";
}

export function createPulseOutcomeContract(input: {
  missionId: string;
  planId: string;
  requestId: string;
  steps: Array<{ id: string; action: string }>;
}): PulseOutcomeContract {
  const required_proof_steps =
    input.steps
      .map((step, step_index) => ({
        step_id: step.id,
        step_index,
        action: step.action,
      }))
      .filter(
        (step) =>
          getActionContract(step.action)?.class === "mutate",
      );

  const base = {
    id: "oct_" + input.missionId,
    version: PULSE_OUTCOME_CONTRACT_VERSION as const,
    mission_id: input.missionId,
    plan_id: input.planId,
    request_id: input.requestId,
    required_proof_steps,
    issued_at: new Date().toISOString(),
  };

  return {
    ...base,
    contract_hash: hashProposal(base),
  };
}

export function createPulseOutcomeProof(input: {
  contract: PulseOutcomeContract;
  outcome: PulseOutcomeStatus;
  planStatus: string;
  evidence: PulseOutcomeProofEvidence[];
  recordedAt?: string;
}): PulseOutcomeProof {
  const evidence = input.evidence.slice(-160);
  const verified_steps: string[] = [];
  const missing_steps: string[] = [];
  const failed_steps: string[] = [];
  const unattested_steps: string[] = [];

  for (const required of input.contract.required_proof_steps) {
    const row = [...evidence]
      .reverse()
      .find(
        (item) =>
          item.step_id === required.step_id &&
          item.step_index === required.step_index &&
          item.action === required.action,
      );

    if (!row) {
      missing_steps.push(required.step_id);
      continue;
    }

    if (row.verification_status === "FAIL") {
      failed_steps.push(required.step_id);
      continue;
    }

    const attestation =
      row.execution_attestation;

    const attested =
      !!attestation &&
      verifyPulseExecutionAttestation(
        attestation,
      ) &&
      attestation.mission_id ===
        input.contract.mission_id &&
      attestation.plan_id ===
        input.contract.plan_id &&
      attestation.step_id ===
        required.step_id &&
      attestation.step_index ===
        required.step_index &&
      attestation.action ===
        required.action &&
      (!row.verification_status ||
        attestation.verification_status ===
          row.verification_status) &&
      (!row.verified ||
        (
          attestation.state === "COMPLETED" &&
          attestation.verified === true
        ));

    if (!attested) {
      missing_steps.push(required.step_id);
      unattested_steps.push(required.step_id);
      continue;
    }

    if (row.verified === true) {
      verified_steps.push(required.step_id);
    } else {
      missing_steps.push(required.step_id);
    }
  }

  const status: PulseOutcomeProofStatus =
    failed_steps.length > 0
      ? "FAILED"
      : missing_steps.length > 0
        ? "UNPROVEN"
        : "PROVEN";

  const base = {
    id:
      "oprf_" +
      input.contract.mission_id +
      "_" +
      input.outcome.toLowerCase(),
    contract_id: input.contract.id,
    contract_hash: input.contract.contract_hash,
    version: PULSE_OUTCOME_CONTRACT_VERSION as const,
    mission_id: input.contract.mission_id,
    plan_id: input.contract.plan_id,
    outcome: input.outcome,
    plan_status: input.planStatus,
    status,
    verified_steps,
    missing_steps,
    failed_steps,
    unattested_steps,
    evidence,
    recorded_at:
      input.recordedAt || new Date().toISOString(),
    hash_algorithm: "fnv1a" as const,
  };

  return {
    ...base,
    proof_hash: hashProposal(base),
  };
}

export function verifyPulseOutcomeProof(
  contract: PulseOutcomeContract,
  proof: PulseOutcomeProof,
): boolean {
  if (
    hashProposal(contractBase(contract)) !==
    contract.contract_hash
  ) {
    return false;
  }

  if (proof.contract_id !== contract.id) return false;
  if (proof.contract_hash !== contract.contract_hash)
    return false;
  if (proof.mission_id !== contract.mission_id)
    return false;
  if (proof.plan_id !== contract.plan_id) return false;

  if (
    proof.plan_status !==
    planStatusFor(proof.outcome)
  ) {
    return false;
  }

  const rebuilt = createPulseOutcomeProof({
    contract,
    outcome: proof.outcome,
    planStatus: proof.plan_status,
    evidence: proof.evidence,
    recordedAt: proof.recorded_at,
  });

  return (
    rebuilt.status === proof.status &&
    stableSerialize(rebuilt.verified_steps) ===
      stableSerialize(proof.verified_steps) &&
    stableSerialize(rebuilt.missing_steps) ===
      stableSerialize(proof.missing_steps) &&
    stableSerialize(rebuilt.failed_steps) ===
      stableSerialize(proof.failed_steps) &&
    stableSerialize(rebuilt.unattested_steps) ===
      stableSerialize(proof.unattested_steps) &&
    rebuilt.proof_hash === proof.proof_hash
  );
}
