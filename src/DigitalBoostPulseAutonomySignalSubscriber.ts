import type {
  PulseMission,
} from "./DigitalBoostPulseMission";

import {
  onPulseSignal,
  type PulseSignal,
} from "./DigitalBoostPulseProactive";

import {
  evaluatePulseAutonomyFromSignal,
  type PulseAutonomySignalBridgeDecision,
} from "./DigitalBoostPulseAutonomySignalBridge";

export const
  PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT =
    "p0.9.3-b" as const;

export type PulseAutonomySignalSubscriberStatus =
  | "EVALUATED"
  | "SIGNAL_ONLY"
  | "DUPLICATE"
  | "RESOLUTION_FAILED";

export interface PulseAutonomySignalResolution {
  readonly mission:
    PulseMission | null;
}

export interface PulseAutonomySignalSubscriberEvent {
  readonly contract:
    typeof PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT;

  readonly status:
    PulseAutonomySignalSubscriberStatus;

  readonly signalId:
    string;

  readonly signalKind:
    PulseSignal["kind"];

  readonly signalAction:
    string;

  readonly missionId?:
    string;

  readonly reason?:
    string;

  readonly evaluation?:
    PulseAutonomySignalBridgeDecision;
}

export interface PulseAutonomySignalSubscriberOptions {
  readonly resolveMission:
    (
      signal: PulseSignal,
    ) =>
      PulseAutonomySignalResolution;

  readonly onEvent?:
    (
      event:
        PulseAutonomySignalSubscriberEvent,
    ) =>
      void;
}

export interface PulseAutonomySignalSubscriber {
  readonly unsubscribe:
    () =>
      void;

  readonly reset:
    () =>
      void;
}

/**
 * Builds a stable deduplication key.
 *
 * Mission identity is part of the key so that a signal may be
 * evaluated once for a newly-resolved Mission even if it was
 * previously observed while no Mission existed.
 */
function dedupeKey(
  signal: PulseSignal,
  mission: PulseMission | null,
): string {
  return (
    (mission
      ? mission.id
      : "signal-only") +
    ":" +
    signal.id
  );
}

/**
 * Subscribes the autonomy control plane to the existing
 * proactive signal bus.
 *
 * The subscriber:
 * - never creates Mission;
 * - never creates Approval;
 * - never executes;
 * - never persists;
 * - never interprets signal.action as execution authority;
 * - deduplicates repeated signals in memory.
 */
export function subscribePulseAutonomyToSignalBus(
  options:
    PulseAutonomySignalSubscriberOptions,
):
  PulseAutonomySignalSubscriber {
  const seen =
    new Set<string>();

  let unsubscribed =
    false;

  const publish =
    (
      event:
        PulseAutonomySignalSubscriberEvent,
    ) => {
      try {
        options.onEvent?.(
          event,
        );
      } catch {
        /*
         * Observer failures must never break the signal bus.
         */
      }
    };

  const handler =
    (
      signal:
        PulseSignal,
    ) => {
      if (unsubscribed) return;

      let resolution:
        PulseAutonomySignalResolution;

      try {
        resolution =
          options.resolveMission(
            signal,
          );
      } catch {
        const key =
          dedupeKey(
            signal,
            null,
          );

        if (seen.has(key)) {
          publish({
            contract:
              PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
            status:
              "DUPLICATE",
            signalId:
              signal.id,
            signalKind:
              signal.kind,
            signalAction:
              signal.action,
            reason:
              "MISSION_RESOLUTION_DUPLICATE",
          });

          return;
        }

        seen.add(key);

        publish({
          contract:
            PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
          status:
            "RESOLUTION_FAILED",
          signalId:
            signal.id,
          signalKind:
            signal.kind,
          signalAction:
            signal.action,
          reason:
            "MISSION_RESOLUTION_FAILED",
        });

        return;
      }

      const mission =
        resolution.mission;

      const key =
        dedupeKey(
          signal,
          mission,
        );

      if (seen.has(key)) {
        publish({
          contract:
            PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
          status:
            "DUPLICATE",
          signalId:
            signal.id,
          signalKind:
            signal.kind,
          signalAction:
            signal.action,
          missionId:
            mission?.id,
          reason:
            "SIGNAL_ALREADY_EVALUATED",
        });

        return;
      }

      seen.add(key);

      if (!mission) {
        publish({
          contract:
            PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
          status:
            "SIGNAL_ONLY",
          signalId:
            signal.id,
          signalKind:
            signal.kind,
          signalAction:
            signal.action,
          reason:
            "NO_MISSION_RESOLVED",
        });

        return;
      }

      const evaluation =
        evaluatePulseAutonomyFromSignal({
          mission,
          signal,
        });

      publish({
        contract:
          PULSE_AUTONOMY_SIGNAL_SUBSCRIBER_CONTRACT,
        status:
          "EVALUATED",
        signalId:
          signal.id,
        signalKind:
          signal.kind,
        signalAction:
          signal.action,
        missionId:
          mission.id,
        evaluation,
      });
    };

  const unsubscribe =
    onPulseSignal(
      handler,
    );

  return {
    unsubscribe:
      () => {
        if (unsubscribed) return;

        unsubscribed = true;
        unsubscribe();
      },

    reset:
      () => {
        seen.clear();
      },
  };
}
