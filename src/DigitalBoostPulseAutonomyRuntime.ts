import {
  subscribePulseAutonomyToSignalBus,
  type PulseAutonomySignalSubscriber,
  type PulseAutonomySignalSubscriberEvent,
} from "./DigitalBoostPulseAutonomySignalSubscriber";

import {
  resolvePulseMissionFromSignal,
} from "./DigitalBoostPulseAutonomyMissionResolver";

export const
  PULSE_AUTONOMY_RUNTIME_CONTRACT =
    "p0.9.3-c" as const;

export type PulseAutonomyRuntimeStartStatus =
  | "STARTED"
  | "ALREADY_STARTED";

export interface PulseAutonomyRuntimeOptions {
  readonly onEvent?: (
    event: PulseAutonomySignalSubscriberEvent,
  ) => void;
}

export interface PulseAutonomyRuntimeHandle {
  readonly status:
    PulseAutonomyRuntimeStartStatus;

  readonly subscriber:
    PulseAutonomySignalSubscriber;
}

let runtimeSubscriber:
  PulseAutonomySignalSubscriber | null =
    null;

/**
 * Starts the P0.9.3 autonomy signal runtime exactly once
 * for the current module/runtime instance.
 *
 * The runtime:
 * - resolves Mission only from explicit signal.missionId;
 * - delegates evaluation to the existing P0.9.3-B subscriber;
 * - does not execute;
 * - does not approve;
 * - does not create Missions;
 * - does not mutate Mission state.
 */
export function startPulseAutonomyRuntime(
  options: PulseAutonomyRuntimeOptions = {},
): PulseAutonomyRuntimeHandle {
  if (runtimeSubscriber !== null) {
    return {
      status: "ALREADY_STARTED",
      subscriber: runtimeSubscriber,
    };
  }

  runtimeSubscriber =
    subscribePulseAutonomyToSignalBus({
      resolveMission(signal) {
        return {
          mission:
            resolvePulseMissionFromSignal(
              signal,
            ).mission,
        };
      },
      onEvent:
        options.onEvent,
    });

  return {
    status: "STARTED",
    subscriber: runtimeSubscriber,
  };
}

/**
 * Stops the singleton runtime subscription.
 *
 * This exists for controlled lifecycle teardown and tests.
 */
export function stopPulseAutonomyRuntime(): void {
  if (runtimeSubscriber === null) {
    return;
  }

  runtimeSubscriber.unsubscribe();
  runtimeSubscriber = null;
}

/**
 * Reports whether the runtime currently owns an active
 * signal-bus subscription.
 */
export function isPulseAutonomyRuntimeStarted(): boolean {
  return runtimeSubscriber !== null;
}
