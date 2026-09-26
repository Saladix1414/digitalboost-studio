import type {
  PulseMission,
} from "./DigitalBoostPulseMission";

import {
  decidePulseMissionAutonomy,
  type PulseAutonomyMissionRuntimeFacts,
} from "./DigitalBoostPulseAutonomyMissionAdapter";

import type {
  PulseAutonomyDecision,
} from "./DigitalBoostPulseAutonomyPolicy";

export const
  PULSE_AUTONOMY_CONTROLLER_CONTRACT =
    "p0.9.2" as const;

/**
 * Signals are triggers for reevaluation only.
 *
 * They are never treated as:
 * - approval;
 * - governance;
 * - execution authority;
 * - verification;
 * - proof.
 */
export type PulseAutonomyTriggerKind =
  | "OPPORTUNITY"
  | "RISK"
  | "STALE_CONTEXT"
  | "APPROVAL_PENDING"
  | "MANUAL_REEVALUATION"
  | "NONE";

/**
 * Control action emitted by the autonomy controller.
 *
 * This is a control-plane decision, not an execution command.
 */
export type PulseAutonomyControlAction =
  | "REENTER"
  | "WAIT_HUMAN"
  | "WAIT_CONTROL"
  | "HANDOFF_HUMAN"
  | "HALT"
  | "TERMINAL";

export interface PulseAutonomyControllerInput {
  readonly mission: PulseMission;

  /**
   * Runtime facts come from existing governed subsystems.
   * The controller does not invent authority.
   */
  readonly facts?: PulseAutonomyMissionRuntimeFacts;

  /**
   * Optional trigger for this evaluation cycle.
   *
   * Trigger metadata never changes the autonomy policy result.
   */
  readonly trigger?:
    | PulseAutonomyTriggerKind
    | undefined;
}

export interface PulseAutonomyControllerDecision {
  readonly contract:
    typeof PULSE_AUTONOMY_CONTROLLER_CONTRACT;

  readonly missionId:
    string;

  readonly decision:
    PulseAutonomyDecision;

  readonly control:
    PulseAutonomyControlAction;

  readonly reason:
    string;

  readonly requiresHuman:
    boolean;

  readonly terminal:
    boolean;

  readonly continueAllowed:
    boolean;

  readonly trigger:
    PulseAutonomyTriggerKind;
}

/**
 * Maps the canonical P0.9.0 decision into a control-plane action.
 *
 * This function intentionally has no execution dependency.
 */
function mapControlAction(
  decision:
    PulseAutonomyDecision,
): PulseAutonomyControlAction {
  switch (decision.decision) {
    case "CONTINUE":
      return "REENTER";

    case "AWAITING_APPROVAL":
      return "WAIT_HUMAN";

    case "PAUSE":
      return "WAIT_CONTROL";

    case "ESCALATE":
      return "HANDOFF_HUMAN";

    case "STOP":
      return "HALT";

    case "COMPLETE":
      return "TERMINAL";
  }
}

/**
 * Pure autonomy controller evaluation.
 *
 * Guarantees:
 * - no execution;
 * - no persistence;
 * - no approval;
 * - no mutation;
 * - no signal-to-authority conversion.
 */
export function evaluatePulseAutonomyController(
  input:
    PulseAutonomyControllerInput,
): PulseAutonomyControllerDecision {
  const decision =
    decidePulseMissionAutonomy(
      input.mission,
      input.facts ?? {},
    );

  const trigger =
    input.trigger ??
    "NONE";

  return {
    contract:
      PULSE_AUTONOMY_CONTROLLER_CONTRACT,

    missionId:
      input.mission.id,

    decision,

    control:
      mapControlAction(
        decision,
      ),

    reason:
      decision.reason,

    requiresHuman:
      decision.requiresHuman,

    terminal:
      decision.terminal,

    continueAllowed:
      decision.continueAllowed,

    trigger,
  };
}
