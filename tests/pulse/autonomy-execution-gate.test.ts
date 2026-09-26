import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  compilePulseGoal,
} from "../../src/DigitalBoostPulsePlan";

import type {
  PulseMission,
} from "../../src/DigitalBoostPulseMission";

import {
  evaluatePulsePolicy,
  approvePulseAction,
  createPulseApproval,
} from "../../src/DigitalBoostPulseGovernance";

import {
  currentContextVersion,
} from "../../src/DigitalBoostPulseContext";

import {
  evaluatePulseAutonomyBeforeExecution,
  PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,
} from "../../src/DigitalBoostPulseAutonomyExecutionGate";

function makeMission(
  overrides: Partial<PulseMission> = {},
): PulseMission {
  const plan =
    compilePulseGoal({
      action: "analyze",
      store: "Nimbus",
    });

  return {
    id:
      "mission-gate-p091-b",
    store:
      "Nimbus",
    planId:
      plan.id,
    state:
      "RUNNING",
    requestId:
      "req-gate-p091-b",
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

function analyzeEnvelope(
  requestId =
    "req-gate-analyze",
) {
  return evaluatePulsePolicy(
    "analyze",
    "L0",
    false,
    requestId,
    {
      action:
        "analyze",
      target:
        "Nimbus:website-builder:analyze",
      actor:
        "merchant",
      tenant:
        "Nimbus",
      context_version:
        currentContextVersion({
          store:
            "Nimbus",
          section:
            "website-builder",
        }),
      proposal: {
        action:
          "analyze",
      },
    },
  );
}

function heroEnvelope(
  requestId =
    "req-gate-hero",
) {
  return evaluatePulsePolicy(
    "hero",
    "L1",
    true,
    requestId,
    {
      action:
        "hero",
      target:
        "Nimbus:website-builder:hero",
      actor:
        "merchant",
      tenant:
        "Nimbus",
      context_version:
        currentContextVersion({
          store:
            "Nimbus",
          section:
            "website-builder",
        }),
      proposal: {
        kind:
          "hero",
        title:
          "Gate hero",
        body:
          "Gate body",
        cta:
          "Entrar",
      },
    },
  );
}

test(
  "P0.9.1-B contract is explicit",
  () => {
    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission:
          makeMission(),
        envelope:
          analyzeEnvelope(),
      });

    assert.equal(
      result.contract,
      PULSE_AUTONOMY_EXECUTION_GATE_CONTRACT,
    );

    assert.equal(
      result.contract,
      "p0.9.1-b",
    );
  },
);

test(
  "ALLOW + matching context admits execution",
  () => {
    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission:
          makeMission(),
        envelope:
          analyzeEnvelope(),
      });

    assert.equal(
      result.disposition,
      "ALLOW_EXECUTION",
    );

    assert.equal(
      result.decision.decision,
      "CONTINUE",
    );

    assert.equal(
      result.contextStatus,
      "MATCH",
    );
  },
);

test(
  "REQUIRE_APPROVAL delegates to canonical governance",
  () => {
    const envelope =
      heroEnvelope();

    assert.equal(
      envelope.requires_approval,
      true,
    );

    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission:
          makeMission(),
        envelope,
      });

    assert.equal(
      result.decision.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.disposition,
      "DEFER_TO_GOVERNANCE",
    );
  },
);

test(
  "approved required action admits execution",
  () => {
    const envelope =
      heroEnvelope(
        "req-gate-approved",
      );

    const created =
      createPulseApproval(
        envelope,
      );

    assert.ok(created);

    const approved =
      approvePulseAction(
        created,
      );

    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission:
          makeMission(),
        envelope,
        approval:
          approved,
      });

    assert.equal(
      result.disposition,
      "ALLOW_EXECUTION",
    );

    assert.equal(
      result.decision.decision,
      "CONTINUE",
    );
  },
);

test(
  "approvalLikely with ALLOW cannot become an execution authorization",
  () => {
    const mission =
      makeMission();

    mission.plan.steps[0] = {
      ...mission.plan.steps[0],
      approvalLikely:
        true,
    };

    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission,
        envelope:
          analyzeEnvelope(
            "req-gate-checkpoint",
          ),
      });

    assert.equal(
      result.decision.decision,
      "AWAITING_APPROVAL",
    );

    assert.equal(
      result.disposition,
      "BLOCK",
    );
  },
);

test(
  "UNKNOWN context escalates and hard-blocks",
  () => {
    /*
     * A missing binding/context version must reach the adapter
     * as UNAVAILABLE and therefore map to UNKNOWN.
     *
     * We construct the governance envelope explicitly instead
     * of using evaluatePulsePolicy(), because that function
     * normally builds a proposal binding for the action.
     */
    const envelope = {
      request_id:
        "req-gate-unknown-context",
      action:
        "hero",
      risk:
        "L1" as const,
      requires_approval:
        false,
      policy:
        "ALLOW" as const,
      state:
        "PROPOSED" as const,
      policy_version:
        "test",
    };

    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission:
          makeMission(),
        envelope,
      });

    assert.equal(
      result.contextStatus,
      "UNKNOWN",
    );

    assert.equal(
      result.decision.decision,
      "ESCALATE",
    );

    assert.equal(
      result.disposition,
      "BLOCK",
    );
  },
);

test(
  "governance REJECT delegates canonical rejection",
  () => {
    const envelope =
      evaluatePulsePolicy(
        "delete_database",
        "L4",
        false,
        "req-gate-reject",
        {
          action:
            "delete_database",
          target:
            "Nimbus:website-builder:delete_database",
          actor:
            "merchant",
          tenant:
            "Nimbus",
        },
      );

    assert.equal(
      envelope.policy,
      "REJECT",
    );

    const result =
      evaluatePulseAutonomyBeforeExecution({
        mission:
          makeMission(),
        envelope,
      });

    assert.equal(
      result.decision.decision,
      "STOP",
    );

    assert.equal(
      result.disposition,
      "DEFER_TO_GOVERNANCE",
    );
  },
);

test(
  "gate never persists or executes",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomyExecutionGate.ts",
        "utf8",
      );

    /*
     * Remove comments before checking forbidden executable
     * dependencies so architectural documentation does not
     * trigger the guard.
     */
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
      /executePulseAction|executePulseMissionStep|pushAudit|pushExecutionAudit|localStorage|sessionStorage|PersistentApprovalRepository|ServerExecution/,
    );
  },
);

test(
  "gate does not import MissionExecutor or raw tools",
  async () => {
    const source =
      await readFile(
        "src/DigitalBoostPulseAutonomyExecutionGate.ts",
        "utf8",
      );

    assert.doesNotMatch(
      source,
      /from ["'][^"']*(?:MissionExecutor|DigitalBoostPulseTools)/,
    );
  },
);
