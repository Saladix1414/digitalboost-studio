import type {
  PulseMission,
} from "./DigitalBoostPulseMission";

import type {
  PulseApproval,
  PulseGovernanceState,
  PulsePolicyDecision,
} from "./DigitalBoostPulseGovernance";

import {
  decidePulseAutonomy,
  type PulseAutonomyContextStatus,
  type PulseAutonomyDecision,
  type PulseAutonomyExecutionStatus,
  type PulseAutonomyInput,
} from "./DigitalBoostPulseAutonomyPolicy";

export const
  PULSE_AUTONOMY_MISSION_ADAPTER_CONTRACT =
    "p0.9.1-a" as const;

/**
 * Runtime facts that are explicitly supplied to the
 * autonomy adapter.
 *
 * The adapter never infers governance, approval, execution,
 * verification, or retry authorization from unrelated mission
 * fields.
 */
export interface PulseAutonomyMissionRuntimeFacts {
  readonly governancePolicy?: PulsePolicyDecision;
  readonly governanceState?: PulseGovernanceState;
  readonly approval?: PulseApproval | null;
  readonly contextStatus?: PulseAutonomyContextStatus;
  readonly executionStatus?: PulseAutonomyExecutionStatus;
  readonly executionVerified?: boolean;
  readonly goalVerified?: boolean;
  readonly retryAllowed?: boolean;
}

/**
 * Purely maps an existing Mission snapshot plus explicit
 * runtime facts into the P0.9.0 autonomy input contract.
 *
 * No state is mutated.
 * No execution is performed.
 * No persistence is performed.
 */
export function createPulseAutonomyInputFromMission(
  mission: PulseMission,
  facts: PulseAutonomyMissionRuntimeFacts = {},
): PulseAutonomyInput {
  const currentStep =
    mission.plan.steps[mission.stepIndex];

  return {
    missionState:
      mission.state,

    currentStepPresent:
      Boolean(currentStep),

    approvalLikely:
      currentStep?.approvalLikely,

    governancePolicy:
      facts.governancePolicy,

    governanceState:
      facts.governanceState,

    approval:
      facts.approval,

    contextStatus:
      facts.contextStatus,

    executionStatus:
      facts.executionStatus,

    executionVerified:
      facts.executionVerified,

    goalVerified:
      facts.goalVerified,

    retries:
      mission.retries,

    maxRetries:
      mission.maxRetries,

    retryAllowed:
      facts.retryAllowed,
  };
}

/**
 * Pure convenience boundary for consumers that need the
 * decision immediately.
 *
 * This function still does not execute or mutate anything.
 */
export function decidePulseMissionAutonomy(
  mission: PulseMission,
  facts: PulseAutonomyMissionRuntimeFacts = {},
): PulseAutonomyDecision {
  return decidePulseAutonomy(
    createPulseAutonomyInputFromMission(
      mission,
      facts,
    ),
  );
}
