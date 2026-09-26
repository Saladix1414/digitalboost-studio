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
  evaluatePulseAutonomyController,
  PULSE_AUTONOMY_CONTROLLER_CONTRACT,
} from "../../src/DigitalBoostPulseAutonomyController";

function makeMission(
  overrides: Partial<PulseMission> = {},
): PulseMission {
  const plan =
    compilePulseGoal({
      action:
        "analyze",
      store:
        "AutonomyController",
    });

  return {
    id:
      "msn-p092-controller",
    store:
      "AutonomyController",
    planId:
      plan.id,
    state:
      "RUNNING",
    requestId:
      "req-p092-controller",
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

test(
  "P0.9.2 contract is explicit",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
      });

    assert.equal(
      result.contract,
      "p0.9.2",
    );

    assert.equal(
      result.contract,
      PULSE_AUTONOMY_CONTROLLER_CONTRACT,
    );
  },
);

test(
  "fresh governed mission maps CONTINUE to REENTER",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
      });

    assert.equal(
      result.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      result.control,
      "REENTER",
    );

    assert.equal(
      result.continueAllowed,
      true,
    );
  },
);

test(
  "approval requirement maps to WAIT_HUMAN",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "REQUIRE_APPROVAL",
        },
      });

    assert.equal(
      result.decision.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.control,
      "WAIT_HUMAN",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "approved current action returns to REENTER",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "REQUIRE_APPROVAL",
          approval: {
            approval_id:
              "approval-p092",
            request_id:
              "req-p092",
            action:
              "analyze",
            state:
              "APPROVED",
            created_at:
              "2026-09-26T00:00:00.000Z",
            updated_at:
              "2026-09-26T00:00:01.000Z",
          },
        },
      });

    assert.equal(
      result.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      result.control,
      "REENTER",
    );
  },
);

test(
  "PAUSED mission maps to WAIT_CONTROL",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission({
            state:
              "PAUSED",
          }),
      });

    assert.equal(
      result.decision.decision,
      "PAUSE",
    );

    assert.equal(
      result.control,
      "WAIT_CONTROL",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "unknown context maps to HANDOFF_HUMAN",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
          contextStatus:
            "UNKNOWN",
        },
      });

    assert.equal(
      result.decision.decision,
      "ESCALATE",
    );

    assert.equal(
      result.control,
      "HANDOFF_HUMAN",
    );

    assert.equal(
      result.requiresHuman,
      true,
    );
  },
);

test(
  "stale context maps to HALT",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
          contextStatus:
            "STALE",
        },
      });

    assert.equal(
      result.decision.decision,
      "STOP",
    );

    assert.equal(
      result.control,
      "HALT",
    );
  },
);

test(
  "rejected governance maps to HALT",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "REJECT",
        },
      });

    assert.equal(
      result.decision.decision,
      "STOP",
    );

    assert.equal(
      result.control,
      "HALT",
    );
  },
);

test(
  "completed mission maps to TERMINAL",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission({
            state:
              "COMPLETED",
          }),
      });

    assert.equal(
      result.decision.decision,
      "COMPLETE",
    );

    assert.equal(
      result.control,
      "TERMINAL",
    );

    assert.equal(
      result.terminal,
      true,
    );
  },
);

test(
  "failed mission maps to HALT",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission({
            state:
              "FAILED",
          }),
      });

    assert.equal(
      result.decision.decision,
      "STOP",
    );

    assert.equal(
      result.control,
      "HALT",
    );
  },
);

test(
  "explicit retry may map FAILED to REENTER",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission({
            retries:
              1,
            maxRetries:
              2,
          }),
        facts: {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "FAILED",
          retryAllowed:
            true,
        },
      });

    assert.equal(
      result.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      result.control,
      "REENTER",
    );
  },
);

test(
  "retry permission is fail-safe",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission({
            retries:
              1,
            maxRetries:
              2,
          }),
        facts: {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "FAILED",
        },
      });

    assert.equal(
      result.decision.decision,
      "STOP",
    );

    assert.equal(
      result.control,
      "HALT",
    );
  },
);

test(
  "approval checkpoint maps to WAIT_HUMAN",
  () => {
    const mission =
      makeMission();

    mission.plan.steps[0] = {
      ...mission.plan.steps[0],
      approvalLikely:
        true,
    };

    const result =
      evaluatePulseAutonomyController({
        mission,
        facts: {
          governancePolicy:
            "ALLOW",
          executionStatus:
            "NOT_STARTED",
        },
      });

    assert.equal(
      result.decision.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.control,
      "WAIT_HUMAN",
    );
  },
);

test(
  "signals are metadata triggers, not authority",
  () => {
    const base =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
      });

    const opportunity =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
        trigger:
          "OPPORTUNITY",
      });

    const risk =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
        trigger:
          "RISK",
      });

    const approval =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
        trigger:
          "APPROVAL_PENDING",
      });

    assert.equal(
      base.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      opportunity.decision.decision,
      base.decision.decision,
    );

    assert.equal(
      risk.decision.decision,
      base.decision.decision,
    );

    assert.equal(
      approval.decision.decision,
      base.decision.decision,
    );

    assert.equal(
      opportunity.trigger,
      "OPPORTUNITY",
    );

    assert.equal(
      risk.trigger,
      "RISK",
    );

    assert.equal(
      approval.trigger,
      "APPROVAL_PENDING",
    );
  },
);

test(
  "signal cannot manufacture approval",
  () => {
    const result =
      evaluatePulseAutonomyController({
        mission:
          makeMission(),
        facts: {
          governancePolicy:
            "ALLOW",
        },
        trigger:
          "APPROVAL_PENDING",
      });

    assert.equal(
      result.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      result.control,
      "REENTER",
    );
  },
);

test(
  "controller does not mutate mission",
  () => {
    const mission =
      makeMission({
        retries:
          1,
      });

    const before =
      JSON.stringify(
        mission,
      );

    evaluatePulseAutonomyController({
      mission,
      facts: {
        governancePolicy:
          "ALLOW",
      },
      trigger:
        "RISK",
    });

    assert.equal(
      JSON.stringify(mission),
      before,
    );
  },
);

test(
  "controller has no executor, persistence, or proactive dependency",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomyController.ts",
        "utf8",
      );

    const executableSource =
      source
        .replace(
          /\/\*[\s\S]*?\*\//g,
          "",
        )
        .replace(
          /\/\/.*$/gm,
          "",
        );

    assert.doesNotMatch(
      executableSource,
      /executePulseAction|executePulseMissionStep|pushAudit|pushExecutionAudit|localStorage|sessionStorage|DigitalBoostPulseProactive|PersistentApprovalRepository|ServerExecution/,
    );
  },
);

test(
  "controller uses P0.9.1-A adapter instead of constructing policy input directly",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomyController.ts",
        "utf8",
      );

    assert.match(
      source,
      /decidePulseMissionAutonomy/,
    );

    assert.doesNotMatch(
      source,
      /decidePulseAutonomy\s*\(/,
    );
  },
);
