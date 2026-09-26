import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_AGENT_TOOL_POLICY_CONTRACT,
  assertPulseAgentToolPolicyAllowed,
  isPulseAgentToolPolicyAllowed,
  resolvePulseAgentToolPolicy,
  validatePulseAgentToolPolicyCatalog,
} from "../../src/DigitalBoostPulseAgentToolPolicy";

function allow(
  input:
    Parameters<
      typeof resolvePulseAgentToolPolicy
    >[0],
) {
  const result =
    resolvePulseAgentToolPolicy(
      input,
    );

  assert.equal(
    result.decision,
    "ALLOW",
  );

  assert.equal(
    result.policyResolved,
    true,
  );

  assert.equal(
    result.authority,
    "NONE",
  );

  assert.equal(
    result.sideEffect,
    "NONE",
  );

  return result;
}

function deny(
  input:
    Parameters<
      typeof resolvePulseAgentToolPolicy
    >[0],

  expectedReason:
    string,
) {
  const result =
    resolvePulseAgentToolPolicy(
      input,
    );

  assert.equal(
    result.decision,
    "DENY",
  );

  assert.equal(
    result.policyResolved,
    false,
  );

  assert.ok(
    result.reasons.includes(
      expectedReason as never,
    ),
  );

  return result;
}

test(
  "P0.8.4 contract is stable",
  () => {
    assert.equal(
      PULSE_AGENT_TOOL_POLICY_CONTRACT,
      "p0.8.4",
    );
  },
);

test(
  "catalog has no broken agent -> tool references",
  () => {
    assert.deepEqual(
      validatePulseAgentToolPolicyCatalog(),
      [],
    );
  },
);

test(
  "ops can observe with pulse.score",
  () => {
    const result =
      allow({
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
        purpose: "OBSERVE",
      });

    assert.deepEqual(
      result.reasons,
      ["POLICY_RESOLVED"],
    );
  },
);

test(
  "ops can propose with pulse.nba",
  () => {
    allow({
      agentId: "ops",
      toolId: "pulse.nba",
      intent: "optimization",
      section: "operations",
      purpose: "PROPOSE",
    });
  },
);

test(
  "proposal tool cannot resolve as OBSERVE",
  () => {
    deny(
      {
        agentId: "ops",
        toolId: "pulse.nba",
        intent: "optimization",
        section: "operations",
        purpose: "OBSERVE",
      },
      "TOOL_PURPOSE_MISMATCH",
    );
  },
);

test(
  "existing P0.8.3 binding is primary policy",
  () => {
    /**
     * sales -> orders is valid because it is explicitly bound,
     * even though sales does not declare orders.read internally.
     */
    allow({
      agentId: "sales",
      toolId: "pulse.orders",
      intent: "catalog",
      section: "commerce",
      purpose: "OBSERVE",
    });

    /**
     * marketing -> inspect is also valid because it is explicitly
     * bound. Capability coverage is not treated as blanket equality.
     */
    allow({
      agentId: "marketing",
      toolId: "pulse.inspect",
      intent: "marketing",
      section: "seo",
      purpose: "OBSERVE",
    });
  },
);

test(
  "unbound tool is denied",
  () => {
    deny(
      {
        agentId: "sales",
        toolId: "pulse.score",
        intent: "catalog",
        section: "commerce",
        purpose: "OBSERVE",
      },
      "TOOL_NOT_BOUND_TO_AGENT",
    );
  },
);

test(
  "intent restriction fails closed",
  () => {
    deny(
      {
        agentId: "marketing",
        toolId: "pulse.inspect",
        intent: "inventory",
        section: "marketing",
        purpose: "OBSERVE",
      },
      "AGENT_INTENT_NOT_ALLOWED",
    );
  },
);

test(
  "section restriction fails closed",
  () => {
    deny(
      {
        agentId: "design",
        toolId: "pulse.map",
        intent: "content",
        section: "orders",
        purpose: "OBSERVE",
      },
      "AGENT_SECTION_NOT_ALLOWED",
    );
  },
);

test(
  "constrained agent requires intent",
  () => {
    deny(
      {
        agentId: "ops",
        toolId: "pulse.score",
        section: "analytics",
        purpose: "OBSERVE",
      },
      "AGENT_INTENT_REQUIRED",
    );
  },
);

test(
  "constrained agent requires section",
  () => {
    deny(
      {
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        purpose: "OBSERVE",
      },
      "AGENT_SECTION_REQUIRED",
    );
  },
);

test(
  "section-neutral agents accept omitted section",
  () => {
    allow({
      agentId: "pulse",
      toolId: "pulse.range",
      intent: "analysis",
      purpose: "OBSERVE",
    });

    allow({
      agentId: "a2a",
      toolId: "pulse.nba",
      intent: "recommendation",
      purpose: "PROPOSE",
    });
  },
);

test(
  "explicit capability must be declared by agent",
  () => {
    deny(
      {
        agentId: "sales",
        toolId: "pulse.orders",
        intent: "catalog",
        section: "commerce",
        purpose: "OBSERVE",
        requiredCapabilities: [
          "orders.read",
        ],
      },
      "AGENT_CAPABILITY_NOT_DECLARED",
    );
  },
);

test(
  "explicit capability must also be declared by tool",
  () => {
    deny(
      {
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
        purpose: "OBSERVE",
        requiredCapabilities: [
          "orders.read",
        ],
      },
      "TOOL_CAPABILITY_NOT_DECLARED",
    );
  },
);

test(
  "matching explicit capability is accepted",
  () => {
    const result =
      allow({
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
        purpose: "OBSERVE",
        requiredCapabilities: [
          "diagnostics.read",
          "diagnostics.read",
        ],
      });

    assert.deepEqual(
      result.requiredCapabilities,
      ["diagnostics.read"],
    );
  },
);

test(
  "unknown agent is denied",
  () => {
    deny(
      {
        agentId: "unknown-agent",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
        purpose: "OBSERVE",
      },
      "AGENT_UNKNOWN",
    );
  },
);

test(
  "unknown tool is denied",
  () => {
    deny(
      {
        agentId: "ops",
        toolId: "pulse.unknown",
        intent: "analysis",
        section: "analytics",
        purpose: "OBSERVE",
      },
      "TOOL_UNKNOWN",
    );
  },
);

test(
  "blank identities are denied",
  () => {
    deny(
      {
        agentId: "   ",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
      },
      "AGENT_ID_REQUIRED",
    );

    deny(
      {
        agentId: "ops",
        toolId: "   ",
        intent: "analysis",
        section: "analytics",
      },
      "TOOL_ID_REQUIRED",
    );
  },
);

test(
  "invalid purpose fails closed",
  () => {
    deny(
      {
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
        purpose: "EXECUTE",
      } as never,
      "POLICY_PURPOSE_INVALID",
    );
  },
);

test(
  "normalization is deterministic",
  () => {
    const result =
      allow({
        agentId: "  ops  ",
        toolId: " pulse.score ",
        intent: " analysis ",
        section: " analytics ",
        purpose: "OBSERVE",
      });

    assert.equal(
      result.agentId,
      "ops",
    );

    assert.equal(
      result.toolId,
      "pulse.score",
    );

    assert.equal(
      result.intent,
      "analysis",
    );

    assert.equal(
      result.section,
      "analytics",
    );
  },
);

test(
  "boolean facade matches resolver",
  () => {
    assert.equal(
      isPulseAgentToolPolicyAllowed({
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
      }),
      true,
    );

    assert.equal(
      isPulseAgentToolPolicyAllowed({
        agentId: "ops",
        toolId: "pulse.nba",
        intent: "optimization",
        section: "operations",
      }),
      false,
    );
  },
);

test(
  "assert facade succeeds and fails closed",
  () => {
    const result =
      assertPulseAgentToolPolicyAllowed({
        agentId: "ops",
        toolId: "pulse.score",
        intent: "analysis",
        section: "analytics",
      });

    assert.equal(
      result.decision,
      "ALLOW",
    );

    assert.throws(
      () =>
        assertPulseAgentToolPolicyAllowed({
          agentId: "ops",
          toolId: "pulse.nba",
          intent: "optimization",
          section: "operations",
          purpose: "OBSERVE",
        }),
      /PULSE_AGENT_TOOL_POLICY_DENIED:TOOL_PURPOSE_MISMATCH/,
    );
  },
);

test(
  "policy resolution never grants authority",
  () => {
    const result =
      allow({
        agentId: "a2a",
        toolId: "pulse.nba",
        intent: "recommendation",
        purpose: "PROPOSE",
      });

    assert.equal(
      result.authority,
      "NONE",
    );

    assert.equal(
      result.sideEffect,
      "NONE",
    );
  },
);
