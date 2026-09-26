import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_TOOL_EXECUTION_EVIDENCE_CONTRACT,
  invokePulseToolWithEvidence,
  verifyPulseToolExecutionEvidence,
} from "../../src/DigitalBoostPulseToolExecutionEvidence";

test(
  "P0.8.5 contract is explicit",
  () => {
    assert.equal(
      PULSE_TOOL_EXECUTION_EVIDENCE_CONTRACT,
      "p0.8.5",
    );
  },
);

test(
  "valid observation creates invocation evidence",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-001",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        purpose: "OBSERVE",
        input: {
          score: 42,
        },
      });

    assert.equal(
      result.policy.decision,
      "ALLOW",
    );

    assert.ok(
      result.output !== undefined,
    );

    assert.equal(
      result.evidence.outcome,
      "INVOKED",
    );

    assert.equal(
      result.evidence.invoked,
      true,
    );

    assert.equal(
      result.evidence.registryValidated,
      true,
    );

    assert.equal(
      result.evidence.authority,
      "NONE",
    );

    assert.equal(
      result.evidence.sideEffect,
      "NONE",
    );

    assert.equal(
      verifyPulseToolExecutionEvidence(
        result.evidence,
      ),
      true,
    );
  },
);

test(
  "proposal invocation requires PROPOSE",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.nba",
        requestId: "req-p085-002",
        tenantId: "tenant-a",
        intent: "optimization",
        section: "operations",
        purpose: "OBSERVE",
        input: {
          facts: {},
        },
      });

    assert.equal(
      result.policy.decision,
      "DENY",
    );

    assert.equal(
      result.evidence.outcome,
      "POLICY_DENIED",
    );

    assert.equal(
      result.evidence.invoked,
      false,
    );

    assert.equal(
      result.output,
      undefined,
    );

    assert.equal(
      result.evidence.errorCode,
      "TOOL_PURPOSE_MISMATCH",
    );

    assert.equal(
      verifyPulseToolExecutionEvidence(
        result.evidence,
      ),
      true,
    );
  },
);

test(
  "unbound agent/tool relationship never invokes",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "sales",
        toolId: "pulse.score",
        requestId: "req-p085-003",
        tenantId: "tenant-a",
        intent: "catalog",
        section: "commerce",
      });

    assert.equal(
      result.policy.decision,
      "DENY",
    );

    assert.equal(
      result.policy.reasons.includes(
        "TOOL_NOT_BOUND_TO_AGENT" as never,
      ),
      true,
    );

    assert.equal(
      result.evidence.invoked,
      false,
    );

    assert.equal(
      result.evidence.outcome,
      "POLICY_DENIED",
    );
  },
);

test(
  "intent restriction blocks before boundary",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "marketing",
        toolId: "pulse.inspect",
        requestId: "req-p085-004",
        tenantId: "tenant-a",
        intent: "inventory",
        section: "marketing",
      });

    assert.equal(
      result.evidence.invoked,
      false,
    );

    assert.equal(
      result.policy.reasons.includes(
        "AGENT_INTENT_NOT_ALLOWED" as never,
      ),
      true,
    );
  },
);

test(
  "section restriction blocks before boundary",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "design",
        toolId: "pulse.map",
        requestId: "req-p085-005",
        tenantId: "tenant-a",
        intent: "content",
        section: "orders",
      });

    assert.equal(
      result.evidence.invoked,
      false,
    );

    assert.equal(
      result.policy.reasons.includes(
        "AGENT_SECTION_NOT_ALLOWED" as never,
      ),
      true,
    );
  },
);

test(
  "explicit capability mismatch blocks before boundary",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-006",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        requiredCapabilities: [
          "orders.read",
        ],
      });

    assert.equal(
      result.evidence.invoked,
      false,
    );

    assert.equal(
      result.policy.reasons.includes(
        "TOOL_CAPABILITY_NOT_DECLARED" as never,
      ),
      true,
    );
  },
);

test(
  "input fingerprint is present but raw input is not stored",
  () => {
    const secret =
      {
        token:
          "SHOULD_NOT_APPEAR_IN_EVIDENCE",
      };

    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-007",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        input: secret,
      });

    const serialized =
      JSON.stringify(
        result.evidence,
      );

    assert.equal(
      serialized.includes(
        secret.token,
      ),
      false,
    );

    assert.ok(
      result.evidence.inputFingerprint
        .length > 0,
    );
  },
);

test(
  "output fingerprint is present without embedding raw output",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-008",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        input: {},
      });

    const serialized =
      JSON.stringify(
        result.evidence,
      );

    assert.equal(
      serialized.includes(
        JSON.stringify(
          result.output,
        ),
      ),
      false,
    );

    assert.ok(
      result.evidence.outputFingerprint
        ?.length,
    );
  },
);

test(
  "timestamp does not change semantic evidence identity",
  () => {
    const first =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-009",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        input: {},
      });

    const second =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-009",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        input: {},
      });

    assert.equal(
      first.evidence.evidenceHash,
      second.evidence.evidenceHash,
    );

    assert.equal(
      first.evidence.evidenceId,
      second.evidence.evidenceId,
    );
  },
);

test(
  "different request identity changes evidence identity",
  () => {
    const first =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-010-a",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        input: {},
      });

    const second =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-010-b",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
        input: {},
      });

    assert.notEqual(
      first.evidence.evidenceHash,
      second.evidence.evidenceHash,
    );

    assert.notEqual(
      first.evidence.evidenceId,
      second.evidence.evidenceId,
    );
  },
);

test(
  "tenant is required",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-011",
          tenantId: "",
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_TENANT_REQUIRED/,
    );
  },
);

test(
  "wildcard/global tenant fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-012",
          tenantId: "*",
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_INVALID_TENANT/,
    );

    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-013",
          tenantId: "global",
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_INVALID_TENANT/,
    );
  },
);

test(
  "context identity must be supplied as a pair",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-014",
          tenantId: "tenant-a",
          contextId: "ctx-a",
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_CONTEXT_BINDING_INCOMPLETE/,
    );

    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-015",
          tenantId: "tenant-a",
          contextVersion: "ctxv-a",
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_CONTEXT_BINDING_INCOMPLETE/,
    );
  },
);

test(
  "complete context identity is preserved",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-016",
        tenantId: "tenant-a",
        contextId: "ctx-a",
        contextVersion: "ctxv-a",
        intent: "analysis",
        section: "analytics",
      });

    assert.equal(
      result.evidence.contextId,
      "ctx-a",
    );

    assert.equal(
      result.evidence.contextVersion,
      "ctxv-a",
    );

    assert.equal(
      verifyPulseToolExecutionEvidence(
        result.evidence,
      ),
      true,
    );
  },
);

test(
  "trace identity must be complete",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-017",
          tenantId: "tenant-a",
          missionId: "mission-a",
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_TRACE_INCOMPLETE/,
    );
  },
);

test(
  "step index requires complete trace",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-018",
          tenantId: "tenant-a",
          stepIndex: 0,
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_STEP_INDEX_INVALID/,
    );
  },
);

test(
  "invalid step index fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "req-p085-019",
          tenantId: "tenant-a",
          missionId: "mission-a",
          planId: "plan-a",
          stepId: "step-a",
          stepIndex: -1,
          intent: "analysis",
          section: "analytics",
        }),
      /P0.8.5_STEP_INDEX_INVALID/,
    );
  },
);

test(
  "complete trace is preserved",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-020",
        tenantId: "tenant-a",
        missionId: "mission-a",
        planId: "plan-a",
        stepId: "step-a",
        stepIndex: 3,
        intent: "analysis",
        section: "analytics",
      });

    assert.equal(
      result.evidence.missionId,
      "mission-a",
    );

    assert.equal(
      result.evidence.planId,
      "plan-a",
    );

    assert.equal(
      result.evidence.stepId,
      "step-a",
    );

    assert.equal(
      result.evidence.stepIndex,
      3,
    );
  },
);

test(
  "policy contract and boundary contract are preserved",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-021",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
      });

    assert.equal(
      result.evidence.policyContract,
      "p0.8.4",
    );

    assert.equal(
      result.evidence.boundaryContract,
      "p0.8.2",
    );
  },
);

test(
  "evidence does not grant authority",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-022",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
      });

    assert.equal(
      result.evidence.authority,
      "NONE",
    );

    assert.equal(
      result.evidence.sideEffect,
      "NONE",
    );

    assert.equal(
      result.evidence.policyResolved,
      true,
    );
  },
);

test(
  "tampering with evidence is detected",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-023",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
      });

    const tampered = {
      ...result.evidence,
      toolId:
        "pulse.orders",
    };

    assert.equal(
      verifyPulseToolExecutionEvidence(
        tampered,
      ),
      false,
    );
  },
);

test(
  "tampering with authority is detected",
  () => {
    const result =
      invokePulseToolWithEvidence({
        agentId: "ops",
        toolId: "pulse.score",
        requestId: "req-p085-024",
        tenantId: "tenant-a",
        intent: "analysis",
        section: "analytics",
      });

    const tampered = {
      ...result.evidence,
      authority:
        "EXECUTION",
    } as never;

    assert.equal(
      verifyPulseToolExecutionEvidence(
        tampered,
      ),
      false,
    );
  },
);

test(
  "missing agent fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "",
          toolId: "pulse.score",
          requestId: "req-p085-025",
          tenantId: "tenant-a",
        }),
      /P0.8.5_AGENT_REQUIRED/,
    );
  },
);

test(
  "missing tool fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "",
          requestId: "req-p085-026",
          tenantId: "tenant-a",
        }),
      /P0.8.5_TOOL_REQUIRED/,
    );
  },
);

test(
  "missing request id fails closed",
  () => {
    assert.throws(
      () =>
        invokePulseToolWithEvidence({
          agentId: "ops",
          toolId: "pulse.score",
          requestId: "",
          tenantId: "tenant-a",
        }),
      /P0.8.5_REQUEST_ID_REQUIRED/,
    );
  },
);
