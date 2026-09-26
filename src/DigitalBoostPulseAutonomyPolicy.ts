/**
 * PULSE Controlled Autonomy Policy — P0.9.0
 *
 * Decision-only control plane.
 *
 * Responsibilities:
 * - decide whether a governed mission may continue;
 * - pause when human/context input is required;
 * - wait for approval when governance requires it;
 * - escalate when evidence/verification is insufficient;
 * - stop on terminal or safety violations;
 * - complete only when the goal is verified.
 *
 * This module:
 * - does NOT execute tools;
 * - does NOT mutate Mission state;
 * - does NOT create approvals;
 * - does NOT approve anything;
 * - does NOT persist state;
 * - does NOT call the Executor;
 * - does NOT grant authority.
 */

import type {
  PulseGovernanceState,
  PulsePolicyDecision,
  PulseApproval,
} from "./DigitalBoostPulseGovernance";

import type {
  PulseMissionState,
} from "./DigitalBoostPulseMission";

export const PULSE_AUTONOMY_POLICY_CONTRACT =
  "p0.9.0" as const;

export type PulseAutonomyDecision =
  | "CONTINUE"
  | "PAUSE"
  | "AWAITING_APPROVAL"
  | "ESCALATE"
  | "STOP"
  | "COMPLETE";

export type PulseAutonomyContextStatus =
  | "MATCH"
  | "UNKNOWN"
  | "STALE"
  | "CHANGED";

export type PulseAutonomyExecutionStatus =
  | "NOT_STARTED"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "UNVERIFIED";

export type PulseAutonomyReason =
  | "MISSION_READY"
  | "MISSION_PAUSED"
  | "MISSION_COMPLETED"
  | "MISSION_FAILED"
  | "MISSION_CANCELLED"
  | "CURRENT_STEP_MISSING"
  | "GOAL_VERIFIED"
  | "GOAL_NOT_VERIFIED"
  | "POLICY_REJECTED"
  | "GOVERNANCE_REJECTED"
  | "APPROVAL_REQUIRED"
  | "APPROVAL_PENDING"
  | "APPROVAL_REJECTED"
  | "CONTEXT_STALE"
  | "CONTEXT_CHANGED"
  | "CONTEXT_UNKNOWN"
  | "EXECUTION_COMPLETED_VERIFIED"
  | "EXECUTION_COMPLETED_UNVERIFIED"
  | "EXECUTION_FAILED_RETRY_ALLOWED"
  | "EXECUTION_FAILED_RETRY_EXHAUSTED"
  | "EXECUTION_REJECTED"
  | "EXECUTION_UNVERIFIED"
  | "CHECKPOINT_REQUIRES_HUMAN_REVIEW"
  | "INVALID_AUTONOMY_INPUT";

export interface PulseAutonomyInput {
  readonly missionState: PulseMissionState;

  /**
   * Whether the mission currently has an executable step.
   */
  readonly currentStepPresent: boolean;

  /**
   * Whether the current or next step is marked as likely
   * to require approval.
   */
  readonly approvalLikely?: boolean;

  /**
   * Current governance result for the active step.
   */
  readonly governancePolicy?: PulsePolicyDecision;

  readonly governanceState?: PulseGovernanceState;

  /**
   * Existing approval object, when one exists.
   */
  readonly approval?: PulseApproval | null;

  /**
   * Current context comparison.
   *
   * UNKNOWN is intentionally not treated as MATCH.
   */
  readonly contextStatus?: PulseAutonomyContextStatus;

  /**
   * Result of the most recent execution attempt.
   */
  readonly executionStatus?: PulseAutonomyExecutionStatus;

  /**
   * Whether the most recent execution was independently
   * verified by the existing execution/verification chain.
   */
  readonly executionVerified?: boolean;

  /**
   * Goal-level verification.
   *
   * COMPLETE is only possible with explicit goal verification.
   */
  readonly goalVerified?: boolean;

  /**
   * Retry controls are consumed from Mission state.
   * P0.9.0 never increments them.
   */
  readonly retries?: number;
  readonly maxRetries?: number;

  /**
   * Retry permission must be explicitly supplied.
   * Default behavior is fail-safe: no automatic retry.
   */
  readonly retryAllowed?: boolean;
}

export interface PulseAutonomyDecision {
  readonly contract: typeof PULSE_AUTONOMY_POLICY_CONTRACT;
  readonly decision: PulseAutonomyDecision;
  readonly reason: PulseAutonomyReason;

  readonly continueAllowed: boolean;
  readonly requiresHuman: boolean;
  readonly terminal: boolean;

  readonly policyVersion?: string;
  readonly missionState: PulseMissionState;
  readonly governancePolicy?: PulsePolicyDecision;
  readonly governanceState?: PulseGovernanceState;
  readonly approvalState?:
    | PulseApproval["state"]
    | undefined;

  readonly retries: number;
  readonly maxRetries: number;
}

function normalizedRetries(
  value: number | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function normalizedMaxRetries(
  value: number | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function result(
  input: PulseAutonomyInput,
  decision: PulseAutonomyDecision,
  reason: PulseAutonomyReason,
): PulseAutonomyDecision {
  const retries =
    normalizedRetries(input.retries);

  const maxRetries =
    normalizedMaxRetries(input.maxRetries);

  return {
    contract:
      PULSE_AUTONOMY_POLICY_CONTRACT,
    decision,
    reason,
    continueAllowed:
      decision === "CONTINUE",
    requiresHuman:
      decision === "PAUSE" ||
      decision === "AWAITING_APPROVAL" ||
      decision === "ESCALATE",
    terminal:
      decision === "STOP" ||
      decision === "COMPLETE",
    policyVersion:
      undefined,
    missionState:
      input.missionState,
    governancePolicy:
      input.governancePolicy,
    governanceState:
      input.governanceState,
    approvalState:
      input.approval?.state,
    retries,
    maxRetries,
  };
}

export function decidePulseAutonomy(
  input: PulseAutonomyInput,
): PulseAutonomyDecision {
  if (
    !input ||
    typeof input !== "object"
  ) {
    return {
      contract:
        PULSE_AUTONOMY_POLICY_CONTRACT,
      decision: "STOP",
      reason: "INVALID_AUTONOMY_INPUT",
      continueAllowed: false,
      requiresHuman: false,
      terminal: true,
      missionState:
        "FAILED",
      retries: 0,
      maxRetries: 0,
    };
  }

  /*
   * Terminal Mission states always dominate continuation.
   */
  if (
    input.missionState ===
    "COMPLETED"
  ) {
    return result(
      input,
      "COMPLETE",
      "MISSION_COMPLETED",
    );
  }

  if (
    input.missionState ===
    "CANCELLED"
  ) {
    return result(
      input,
      "STOP",
      "MISSION_CANCELLED",
    );
  }

  if (
    input.missionState ===
    "FAILED"
  ) {
    return result(
      input,
      "STOP",
      "MISSION_FAILED",
    );
  }

  /*
   * Explicit pause is a human/control-plane state.
   */
  if (
    input.missionState ===
    "PAUSED"
  ) {
    return result(
      input,
      "PAUSE",
      "MISSION_PAUSED",
    );
  }

  /*
   * Governance rejection always dominates.
   */
  if (
    input.governancePolicy ===
      "REJECT" ||
    input.governanceState ===
      "REJECTED"
  ) {
    return result(
      input,
      "STOP",
      input.governanceState ===
        "REJECTED"
        ? "GOVERNANCE_REJECTED"
        : "POLICY_REJECTED",
    );
  }

  /*
   * Approval rejection is terminal for this execution path.
   */
  if (
    input.approval?.state ===
    "REJECTED"
  ) {
    return result(
      input,
      "STOP",
      "APPROVAL_REJECTED",
    );
  }

  /*
   * Context integrity has priority over autonomy.
   *
   * We deliberately do not treat UNKNOWN as safe.
   */
  if (
    input.contextStatus ===
    "STALE"
  ) {
    return result(
      input,
      "STOP",
      "CONTEXT_STALE",
    );
  }

  if (
    input.contextStatus ===
    "CHANGED"
  ) {
    return result(
      input,
      "STOP",
      "CONTEXT_CHANGED",
    );
  }

  if (
    input.contextStatus ===
    "UNKNOWN"
  ) {
    return result(
      input,
      "ESCALATE",
      "CONTEXT_UNKNOWN",
    );
  }

  /*
   * Current-action approval gate.
   *
   * governancePolicy=REQUIRE_APPROVAL means the active action
   * itself requires approval.
   *
   * approvalLikely is intentionally NOT evaluated here.
   * It represents an approval checkpoint in the mission flow
   * and is handled after execution state is known.
   */
  if (
    input.governancePolicy ===
    "REQUIRE_APPROVAL"
  ) {
    if (
      input.approval?.state ===
      "APPROVED"
    ) {
      // Current action is approved; continue evaluation.
    } else {
      return result(
        input,
        "AWAITING_APPROVAL",
        input.approval
          ? "APPROVAL_PENDING"
          : "APPROVAL_REQUIRED",
      );
    }
  }

  /*
   * Execution results.
   */
  if (
    input.executionStatus ===
    "REJECTED"
  ) {
    return result(
      input,
      "STOP",
      "EXECUTION_REJECTED",
    );
  }

  if (
    input.executionStatus ===
    "UNVERIFIED"
  ) {
    return result(
      input,
      "ESCALATE",
      "EXECUTION_UNVERIFIED",
    );
  }

  if (
    input.executionStatus ===
      "COMPLETED" &&
    input.executionVerified !== true
  ) {
    return result(
      input,
      "ESCALATE",
      "EXECUTION_COMPLETED_UNVERIFIED",
    );
  }

  if (
    input.executionStatus ===
      "FAILED"
  ) {
    const retries =
      normalizedRetries(
        input.retries,
      );

    const maxRetries =
      normalizedMaxRetries(
        input.maxRetries,
      );

    if (
      input.retryAllowed === true &&
      retries < maxRetries
    ) {
      return result(
        input,
        "CONTINUE",
        "EXECUTION_FAILED_RETRY_ALLOWED",
      );
    }

    return result(
      input,
      "STOP",
      "EXECUTION_FAILED_RETRY_EXHAUSTED",
    );
  }

  /*
   * No current step means Mission wants to terminate.
   * P0.9.0 requires explicit goal verification before doing so.
   */
  if (
    !input.currentStepPresent
  ) {
    if (
      input.goalVerified === true
    ) {
      return result(
        input,
        "COMPLETE",
        "GOAL_VERIFIED",
      );
    }

    return result(
      input,
      "ESCALATE",
      "GOAL_NOT_VERIFIED",
    );
  }

  /*
   * A successfully completed + verified step may continue
   * into the next governed step.
   */
  if (
    input.executionStatus ===
      "COMPLETED" &&
    input.executionVerified === true
  ) {
    if (
      input.approvalLikely === true
    ) {
      return result(
        input,
        "AWAITING_APPROVAL",
        "CHECKPOINT_REQUIRES_HUMAN_REVIEW",
      );
    }

    return result(
      input,
      "CONTINUE",
      "EXECUTION_COMPLETED_VERIFIED",
    );
  }

  /*
   * A fresh step may begin only when no approval checkpoint
   * is currently blocking it.
   *
   * approvalLikely is a mission checkpoint signal. It must not
   * silently become autonomous continuation.
   */
  if (
    input.executionStatus ===
      undefined ||
    input.executionStatus ===
      "NOT_STARTED"
  ) {
    if (
      input.approvalLikely ===
        true &&
      input.approval?.state !==
        "APPROVED"
    ) {
      return result(
        input,
        "AWAITING_APPROVAL",
        input.approval
          ? "APPROVAL_PENDING"
          : "APPROVAL_REQUIRED",
      );
    }

    if (
      input.governancePolicy ===
        "ALLOW" ||
      input.governancePolicy ===
        undefined ||
      input.approval?.state ===
        "APPROVED"
    ) {
      return result(
        input,
        "CONTINUE",
        "MISSION_READY",
      );
    }
  }

  /*
   * Unknown combinations fail closed via escalation rather
   * than silently becoming autonomous execution.
   */
  return result(
    input,
    "ESCALATE",
    "INVALID_AUTONOMY_INPUT",
  );
}
