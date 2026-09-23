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
    });

  return {
    mission: missionAfterExecution,
    execution,
  };
}
