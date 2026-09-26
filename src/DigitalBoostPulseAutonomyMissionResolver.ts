import {
  getPulseMission,
  type PulseMission,
} from "./DigitalBoostPulseMission";

import type {
  PulseSignal,
} from "./DigitalBoostPulseProactive";

export const
  PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT =
    "p0.9.3-c-resolver" as const;

export type PulseAutonomyMissionResolutionReason =
  | "RESOLVED"
  | "NO_MISSION_ID"
  | "MISSION_NOT_FOUND";

export interface PulseAutonomyMissionResolution {
  readonly contract:
    typeof PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT;

  readonly mission:
    PulseMission | null;

  readonly missionId?: string;

  readonly reason:
    PulseAutonomyMissionResolutionReason;
}

/**
 * Deterministic Signal → Mission resolver.
 *
 * Correlation is valid only when the signal explicitly carries
 * a Mission identity.
 *
 * This resolver deliberately does NOT use:
 * - signal.action;
 * - signal.title;
 * - signal.body;
 * - signal.source;
 * - signal.significance;
 * - store matching;
 * - section matching;
 * - "latest mission";
 * - semantic similarity;
 * - time proximity.
 *
 * A signal without explicit missionId remains SIGNAL_ONLY.
 */
export function resolvePulseMissionFromSignal(
  signal: PulseSignal,
): PulseAutonomyMissionResolution {
  const missionId =
    typeof signal.missionId === "string"
      ? signal.missionId.trim()
      : "";

  if (!missionId) {
    return {
      contract:
        PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT,
      mission: null,
      reason: "NO_MISSION_ID",
    };
  }

  const mission =
    getPulseMission(missionId);

  if (!mission) {
    return {
      contract:
        PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT,
      mission: null,
      missionId,
      reason: "MISSION_NOT_FOUND",
    };
  }

  return {
    contract:
      PULSE_AUTONOMY_MISSION_RESOLVER_CONTRACT,
    mission,
    missionId,
    reason: "RESOLVED",
  };
}
