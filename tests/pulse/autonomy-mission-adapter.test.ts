import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import type {
  PulseMission,
} from "../../src/DigitalBoostPulseMission";

import {
  decidePulseMissionAutonomy,
  createPulseAutonomyInputFromMission,
  PULSE_AUTONOMY_MISSION_ADAPTER_CONTRACT,
} from "../../src/DigitalBoostPulseAutonomyMissionAdapter";

function makeMission(
  overrides: Partial<PulseMission> = {},
): PulseMission {
  const plan =
    compilePulseGoal({
      action: "hero",
      store: "Nimbus",
    });

  return {
    id:
      "mission-p091-a",
    store:
      "Nimbus",
    planId:
      plan.id,
    state:
      "RUNNING",
    requestId:
      "req-p091-a",
    section:
      "website-builder",
    stepIndex:
      0,
    retries:
      0,
    maxRetries:
      2,
    createdAt:
      "2026-09-26T00:00:00.000Z",
    updatedAt:
      "2026-09-26T00:00:00.000Z",
    plan,
    ...overrides,
  };
}

function missionWithApprovalCheckpoint():
  PulseMission {
  const mission =
    makeMission();

  return {
    ...mission,
    plan: {
      ...mission.plan,
      steps:
        mission.plan.steps.map(
          (step, index) =>
            index === 0
              ? {
                  ...step,
                  approvalLikely:
                    true,
                }
              : step,
        ),
    },
  };
}

test(
  "P0.9.1-A contract is explicit",
  () => {
    assert.equal(
      PULSE_AUTONOMY_MISSION_ADAPTER_CONTRACT,
      "p0.9.1-a",
    );
  },
);

test(
  "adapter maps mission identity/state without execution semantics",
  () => {
    const mission =
      makeMission({
        state:
          "RUNNING",
        stepIndex:
          0,
        retries:
          1,
        maxRetries:
          3,
      });

    const input =
      createPulseAutonomyInputFromMission(
        mission,
      );

    assert.equal(
      input.missionState,
      "RUNNING",
    );

    assert.equal(
      input.currentStepPresent,
      true,
    );

    assert.equal(
      input.retries,
      1,
    );

    assert.equal(
      input.maxRetries,
      3,
    );

    assert.equal(
      input.executionStatus,
      undefined,
    );

    assert.equal(
      input.executionVerified,
      undefined,
    );
  },
);

test(
  "adapter maps current step approvalLikely",
  () => {
    const mission =
      missionWithApprovalCheckpoint();

    const input =
      createPulseAutonomyInputFromMission(
        mission,
      );

    assert.equal(
      input.currentStepPresent,
      true,
    );

    assert.equal(
      input.approvalLikely,
      true,
    );
  },
);

test(
  "adapter reports no current step from mission position",
  () => {
    const mission =
      makeMission({
        stepIndex:
          makeMission().plan.steps.length,
      });

    const input =
      createPulseAutonomyInputFromMission(
        mission,
      );

    assert.equal(
      input.currentStepPresent,
      false,
    );

    assert.equal(
      input.approvalLikely,
      undefined,
    );
  },
);

test(
  "adapter passes governance facts explicitly",
  () => {
    const mission =
      makeMission();

    const input =
      createPulseAutonomyInputFromMission(
        mission,
        {
          governancePolicy:
            "REQUIRE_APPROVAL",
          governanceState:
            "AWAITING_APPROVAL",
        },
      );

    assert.equal(
      input.governancePolicy,
      "REQUIRE_APPROVAL",
    );

    assert.equal(
      input.governanceState,
      "AWAITING_APPROVAL",
    );
  },
);

test(
  "adapter passes approval object explicitly",
  () => {
    const mission =
      makeMission();

    const approval = {
      approval_id:
        "approval-p091",
      request_id:
        "req-p091",
      action:
        "hero",
      state:
        "APPROVED" as const,
      created_at:
        "2026-09-26T00:00:00.000Z",
      updated_at:
        "2026-09-26T00:00:01.000Z",
    };

    const input =
      createPulseAutonomyInputFromMission(
        mission,
        {
          approval,
        },
      );

    assert.equal(
      input.approval,
      approval,
    );
  },
);

test(
  "adapter passes context and execution facts explicitly",
  () => {
    const mission =
      makeMission();

    const input =
      createPulseAutonomyInputFromMission(
        mission,
        {
          contextStatus:
            "MATCH",
          executionStatus:
            "COMPLETED",
          executionVerified:
            true,
        },
      );

    assert.equal(
      input.contextStatus,
      "MATCH",
    );

    assert.equal(
      input.executionStatus,
      "COMPLETED",
    );

    assert.equal(
      input.executionVerified,
      true,
    );
  },
);

test(
  "adapter never infers execution from mission state",
  () => {
    const mission =
      makeMission({
        state:
          "COMPLETED",
      });

    const input =
      createPulseAutonomyInputFromMission(
        mission,
      );

    assert.equal(
      input.missionState,
      "COMPLETED",
    );

    assert.equal(
      input.executionStatus,
      undefined,
    );

    assert.equal(
      input.executionVerified,
      undefined,
    );
  },
);

test(
  "retry authorization is explicit and does not mutate mission retries",
  () => {
    const mission =
      makeMission({
        retries:
          1,
        maxRetries:
          2,
      });

    const input =
      createPulseAutonomyInputFromMission(
        mission,
        {
          retryAllowed:
            true,
        },
      );

    assert.equal(
      input.retryAllowed,
      true,
    );

    assert.equal(
      mission.retries,
      1,
    );
  },
);

test(
  "adapter preserves fail-safe retry default",
  () => {
    const mission =
      makeMission({
        retries:
          0,
        maxRetries:
          2,
      });

    const input =
      createPulseAutonomyInputFromMission(
        mission,
      );

    assert.equal(
      input.retryAllowed,
      undefined,
    );
  },
);

test(
  "RUNNING + ALLOW produces CONTINUE",
  () => {
    const mission =
      makeMission();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
        },
      );

    assert.equal(
      result.decision,
      "CONTINUE",
    );
  },
);

test(
  "REQUIRE_APPROVAL without approval produces AWAITING_APPROVAL",
  () => {
    const mission =
      makeMission();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "REQUIRE_APPROVAL",
        },
      );

    assert.equal(
      result.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "approved current action remains CONTINUE",
  () => {
    const mission =
      makeMission();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "REQUIRE_APPROVAL",
          approval: {
            approval_id:
              "approval-p091-approved",
            request_id:
              "req-p091-approved",
            action:
              "hero",
            state:
              "APPROVED",
            created_at:
              "2026-09-26T00:00:00.000Z",
            updated_at:
              "2026-09-26T00:00:01.000Z",
          },
        },
      );

    assert.equal(
      result.decision,
      "CONTINUE",
    );
  },
);

test(
  "stale context stops autonomy",
  () => {
    const mission =
      makeMission();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
          contextStatus:
            "STALE",
        },
      );

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "CONTEXT_STALE",
    );
  },
);

test(
  "unverified execution escalates",
  () => {
    const mission =
      makeMission();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "COMPLETED",
          executionVerified:
            false,
        },
      );

    assert.equal(
      result.decision,
      "ESCALATE",
    );

    assert.equal(
      result.reason,
      "EXECUTION_COMPLETED_UNVERIFIED",
    );
  },
);

test(
  "verified completion at approval checkpoint waits for human",
  () => {
    const mission =
      missionWithApprovalCheckpoint();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "COMPLETED",
          executionVerified:
            true,
        },
      );

    assert.equal(
      result.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.reason,
      "CHECKPOINT_REQUIRES_HUMAN_REVIEW",
    );
  },
);

test(
  "missing step requires verified goal before completion",
  () => {
    const mission =
      makeMission({
        stepIndex:
          makeMission().plan.steps.length,
      });

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
          goalVerified:
            false,
        },
      );

    assert.equal(
      result.decision,
      "ESCALATE",
    );

    assert.equal(
      result.reason,
      "GOAL_NOT_VERIFIED",
    );
  },
);

test(
  "failed execution retries only when explicitly allowed",
  () => {
    const mission =
      makeMission({
        retries:
          1,
        maxRetries:
          2,
      });

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "FAILED",
          retryAllowed:
            true,
        },
      );

    assert.equal(
      result.decision,
      "CONTINUE",
    );

    assert.equal(
      result.reason,
      "EXECUTION_FAILED_RETRY_ALLOWED",
    );
  },
);

test(
  "failed execution stops when retry permission is absent",
  () => {
    const mission =
      makeMission({
        retries:
          1,
        maxRetries:
          2,
      });

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "FAILED",
        },
      );

    assert.equal(
      result.decision,
      "STOP",
    );
  },
);

test(
  "adapter source has no persistence or executor dependency",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomyMissionAdapter.ts",
        "utf8",
      );

    assert.doesNotMatch(
      source,
      /from ["'][^"']*(?:Executor|MissionExecutor|PulseLog|PersistentApprovalRepository|ServerExecution)/,
    );

    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|pushAudit|pushExecutionAudit|executePulseAction/,
    );
  },
);

test(
  "adapter wrapper delegates through P0.9.0 policy",
  () => {
    const mission =
      makeMission();

    const result =
      decidePulseMissionAutonomy(
        mission,
        {
          governancePolicy:
            "REJECT",
        },
      );

    assert.equal(
      result.contract,
      "p0.9.0",
    );

    assert.equal(
      result.decision,
      "STOP",
    );

    assert.equal(
      result.reason,
      "POLICY_REJECTED",
    );
  },
);
