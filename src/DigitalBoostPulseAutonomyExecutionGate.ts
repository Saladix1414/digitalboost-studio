import type {
  PulseMission,
} from "./DigitalBoostPulseMission";

import type {
  PulseApproval,
  PulseDecisionEnvelope,
} from "./DigitalBoostPulseGovernance";

import {
  checkPulseContextDrift,
} from "./DigitalBoostPulseContextDrift";

import {
  decidePulseMissionAutonomy,
} from "./DigitalBoostPulseAutonomyMissionAdapter";

import type {
  PulseAutonomyContextStatus,
  PulseAutonomyDecision,
} from "./DigitalBoostPulseAutonomyPolicy";

export const
  PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT =
    "p0.9.1-b" as const;

export type PulseAutonomyGateDisposition =
  | "ALLOW_EXECUTION"
  | "DEFER_TO_GOVERNANCE"
  | "BLOCK";

export interface PulseAutonomyExecutionGateInput {
  readonly mission: PulseMission;
  readonly envelope: PulseDecisionEnvelope;
  readonly approval?: PulseApproval | null;
}

export interface PulseAutonomyExecutionGateResult {
  readonly contract:
    typeof PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT;

  readonly disposition:
    PulseAutonomyGateDisposition;

  readonly decision:
    PulseAutonomyDecision;

  readonly reason:
    string;

  readonly contextStatus:
    PulseAutonomyContextStatus;
}

function mapContextStatus(
  status:
    "MATCH" |
    "DRIFT" |
    "UNAVAILABLE",
): PulseAutonomyContextStatus {
  switch (status) {
    case "MATCH":
      return "MATCH";

    case "DRIFT":
      /*
       * Existing execution semantics already treat proposal
       * context drift as stale context. Preserve that mapping.
       */
      return "STALE";

    case "UNAVAILABLE":
    default:
      /*
       * P0.9.0 deliberately treats unknown context as unsafe
       * for autonomous continuation.
       */
      return "UNKNOWN";
  }
}

/**
 * Pure pre-execution autonomy admission.
 *
 * This function never executes, persists, approves, or mutates.
 *
 * CONTINUE:
 *   autonomy permits entry into the existing executor path.
 *
 * AWAITING_APPROVAL:
 *   delegated only when the canonical governance envelope
 *   actually requires approval.
 *
 * STOP:
 *   delegated to the existing canonical governance/execution
 *   rejection path so existing Mission terminal semantics are
 *   preserved.
 *
 * ESCALATE / PAUSE / COMPLETE:
 *   hard block before executePulseAction().
 */
export function evaluatePulseAutonomyBeforeExecution(
  input:
    PulseAutonomyExecutionGateInput,
): PulseAutonomyExecutionGateResult {
  const drift =
    checkPulseContextDrift(
      input.envelope.binding,
      input.envelope.action,
    );

  const contextStatus =
    mapContextStatus(
      drift.status,
    );

  const decision =
    decidePulseMissionAutonomy(
      input.mission,
      {
        governancePolicy:
          input.envelope.policy,

        governanceState:
          input.envelope.state,

        approval:
          input.approval ?? null,

        contextStatus,

        /*
         * The gate evaluates entry into a new execution
         * attempt. It does not fabricate an execution result.
         */
        executionStatus:
          "NOT_STARTED",
      },
    );

  if (
    decision.decision ===
    "CONTINUE"
  ) {
    return {
      contract:
        PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,

      disposition:
        "ALLOW_EXECUTION",

      decision,

      reason:
        decision.reason,

      contextStatus,
    };
  }

  if (
    decision.decision ===
    "AWAITING_APPROVAL"
  ) {
    /*
     * Important security distinction:
     *
     * approvalLikely alone must never be converted into
     * an executable authorization when Governance says ALLOW.
     *
     * Only the canonical Governance approval path may be
     * delegated back to the Executor.
     */
    if (
      input.envelope.requires_approval ===
      true
    ) {
      return {
        contract:
          PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,

        disposition:
          "DEFER_TO_GOVERNANCE",

        decision,

        reason:
          decision.reason,

        contextStatus,
      };
    }

    return {
      contract:
        PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,

      disposition:
        "BLOCK",

      decision,

      reason:
        decision.reason,

      contextStatus,
    };
  }

  /*
   * STOP is intentionally delegated to the canonical
   * Governance/Approval/Context rejection path.
   *
   * The autonomy policy is not allowed to replace the
   * existing execution authority or terminal-state semantics.
   */
  if (
    decision.decision ===
    "STOP"
  ) {
    return {
      contract:
        PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,

      disposition:
        "DEFER_TO_GOVERNANCE",

      decision,

      reason:
        decision.reason,

      contextStatus,
    };
  }

  return {
    contract:
      PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,

    disposition:
      "BLOCK",

    decision,

    reason:
      decision.reason,

    contextStatus,
  };
}
