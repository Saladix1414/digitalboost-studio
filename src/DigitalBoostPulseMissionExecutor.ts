import {
  getPulseMission,
  advancePulseMission,
  type PulseMission,
} from "./DigitalBoostPulseMission";

import {
  executePulseAction,
  type PulseExecutionContext,
  type PulseExecutionOutcome,
} from "./DigitalBoostPulseExecutor";

import {
  createPulseExecutionAttestation,
} from "./DigitalBoostPulseOutcomeProof";

import {
  evaluatePulseAutonomyBeforeExecution,
} from "./DigitalBoostPulseAutonomyExecutionGate";

export type PulseMissionStepExecutionContext =
  PulseExecutionContext;

export type PulseMissionStepExecutionResult = {
  mission: PulseMission | null;
  execution: PulseExecutionOutcome;
};

export function executePulseMissionStep(
  missionId: string,
  context: PulseMissionStepExecutionContext,
): PulseMissionStepExecutionResult {
  const mission = getPulseMission(missionId);

  if (!mission) {
    throw new Error("Pulse mission not found.");
  }

  if (
    mission.state !== "RUNNING" &&
    mission.state !== "AWAITING_APPROVAL"
  ) {
    throw new Error(
      "Pulse mission is not executable in its current state.",
    );
  }

  const step = mission.plan.steps[mission.stepIndex];

  if (!step) {
    throw new Error("Pulse mission has no current step.");
  }

  if (context.envelope.action !== step.action) {
    throw new Error(
      "Mission step action does not match execution action.",
    );
  }

  const autonomyGate =
    evaluatePulseAutonomyBeforeExecution({
      mission,
      envelope:
        context.envelope,
      approval:
        context.approval,
    });

  /*
   * Only CONTINUE may enter the execution path directly.
   *
   * DEFER_TO_GOVERNANCE is intentionally passed to the
   * existing executor because Governance/Approval remains
   * the canonical execution authority.
   *
   * BLOCK is a hard autonomy stop. No execution call is made.
   */
  if (
    autonomyGate.disposition ===
    "BLOCK"
  ) {
    throw new Error(
      "PULSE_AUTONOMY_GATE_BLOCKED:" +
      autonomyGate.decision.decision +
      ":" +
      autonomyGate.reason,
    );
  }

  const execution = executePulseAction({
    ...context,
    trace: {
      mission_id: mission.id,
      plan_id: mission.planId,
      step_id: step.id,
      step_index: mission.stepIndex,
    },
  });

  if (execution.state === "AWAITING_APPROVAL") {
    return {
      mission: getPulseMission(missionId),
      execution,
    };
  }

  const executionAttestation =
      createPulseExecutionAttestation({
        missionId: mission.id,
        planId: mission.planId,
        stepId: step.id,
        stepIndex: mission.stepIndex,
        action: step.action,
        executionRequestId:
          context.envelope.request_id,
        approvalId:
          context.envelope.approval_id ||
          context.approval?.id,
        policyVersion:
          context.envelope.policy_version,
        proposalHash:
          context.envelope.binding?.proposal_hash,
        executedProposalHash:
          typeof execution.audit.metadata
            ?.executed_proposal_hash === "string"
            ? execution.audit.metadata
                ?.executed_proposal_hash
            : undefined,
        expectedContextVersion:
          context.envelope.binding?.context_version,
        currentContextVersion:
          typeof execution.audit.metadata
            ?.current_context_version === "string"
            ? execution.audit.metadata
                ?.current_context_version
            : undefined,
        verificationStatus:
          execution.audit.metadata
            ?.verification_status,
        verified: execution.verified,
        state: execution.state,
        executionAudit: {
          request_id:
            execution.audit.request_id,
          event:
            execution.audit.metadata
              ?.execution_audit_event ??
            "",
          state:
            execution.audit.state,
          action:
            execution.audit.action,
          timestamp:
            execution.audit.timestamp,
          execution_audit_id:
            typeof execution.audit.metadata
              ?.execution_audit_id === "string"
              ? execution.audit.metadata
                  .execution_audit_id
              : "",
        },
      });

  const missionAfterExecution =
    advancePulseMission(missionId, {
      approved: execution.state !== "REJECTED",
      ok: execution.state === "COMPLETED",
      terminal: execution.state === "REJECTED",
      error:
        execution.error ||
        (execution.state === "REJECTED"
          ? "governance-rejected"
          : undefined),
      verificationStatus:
        execution.audit.metadata?.verification_status,
      verified: execution.verified,
      executionAttestation,
    });

  return {
    mission: missionAfterExecution,
    execution,
  };
}
