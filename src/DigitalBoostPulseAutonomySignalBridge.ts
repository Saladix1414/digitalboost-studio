import type {
  PulseMission,
} from "./DigitalBoostPulseMission";

import type {
  PulseSignal,
  PulseSignalKind,
} from "./DigitalBoostPulseProactive";

import {
  evaluatePulseAutonomyController,
  type PulseAutonomyControllerDecision,
  type PulseAutonomyTriggerKind,
} from "./DigitalBoostPulseAutonomyController";

export const
  PULSE_AUTONOMY_SIGNAL_BRIDGE_CONTRACT =
    "p0.9.3-a" as const;

export interface PulseAutonomySignalBridgeInput {
  readonly mission: PulseMission;
  readonly signal: PulseSignal;
}

export interface PulseAutonomySignalBridgeDecision {
  readonly contract:
    typeof PULSE_AUTONOMY_SIGNAL_BRIDGE_CONTRACT;

  readonly signalId:
    string;

  readonly signalKind:
    PulseSignalKind;

  readonly signalAction:
    string;

  readonly trigger:
    PulseAutonomyTriggerKind;

  readonly controller:
    PulseAutonomyControllerDecision;
}

/**
 * Converts a proactive signal into controller metadata.
 *
 * A signal is never treated as:
 * - approval;
 * - governance;
 * - execution authority;
 * - verification;
 * - proof.
 */
function mapSignalTrigger(
  kind:
    PulseSignalKind,
): PulseAutonomyTriggerKind {
  switch (kind) {
    case "opportunity":
      return "OPPORTUNITY";

    case "risk":
      return "RISK";

    case "stale-context":
      return "STALE_CONTEXT";

    case "approval-pending":
      return "APPROVAL_PENDING";
  }
}

/**
 * Pure Signal → Controller bridge.
 *
 * The bridge:
 * - does not execute;
 * - does not persist;
 * - does not approve;
 * - does not create missions;
 * - does not mutate Mission;
 * - does not use signal.action as execution authority.
 */
export function evaluatePulseAutonomyFromSignal(
  input:
    PulseAutonomySignalBridgeInput,
): PulseAutonomySignalBridgeDecision {
  const trigger =
    mapSignalTrigger(
      input.signal.kind,
    );

  const controller =
    evaluatePulseAutonomyController({
      mission:
        input.mission,

      trigger,
    });

  return {
    contract:
      PULSE_AUTONOMY_SIGNAL_BRIDGE_CONTRACT,

    signalId:
      input.signal.id,

    signalKind:
      input.signal.kind,

    signalAction:
      input.signal.action,

    trigger,

    controller,
  };
}
