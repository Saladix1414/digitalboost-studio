import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_AGENT_REGISTRY_CONTRACT,
  PULSE_AGENT_DESCRIPTORS,
  assertPulseAgentKnown,
  getPulseAgentDescriptor,
  isPulseAgentKnown,
  listPulseAgentDescriptors,
} from "../../src/DigitalBoostPulseAgentRegistry";

import {
  pickAgent,
} from "../../src/DigitalBoostPulseConst";

const EXPECTED_AGENTS = [
  "a2a",
  "cx",
  "design",
  "marketing",
  "ops",
  "pulse",
  "sales",
  "sourcing",
] as const;

test(
  "P0.8.3 contract is explicit",
  () => {
    assert.equal(
      PULSE_AGENT_REGISTRY_CONTRACT,
      "p0.8.3",
    );

    assert.equal(
      PULSE_AGENT_DESCRIPTORS.length,
      EXPECTED_AGENTS.length,
    );
  },
);

test(
  "P0.8.3 registry contains exactly the canonical PulseAgent set",
  () => {
    const ids =
      PULSE_AGENT_DESCRIPTORS.map(
        (item) => item.id,
      );

    assert.deepEqual(
      [...ids].sort(),
      [...EXPECTED_AGENTS].sort(),
    );

    assert.equal(
      new Set(ids).size,
      ids.length,
    );
  },
);

test(
  "P0.8.3 every agent resolves",
  () => {
    for (const id of EXPECTED_AGENTS) {
      const descriptor =
        getPulseAgentDescriptor(
          id,
        );

      assert.equal(
        descriptor.id,
        id,
      );

      assert.equal(
        descriptor.contractVersion,
        "p0.8.3",
      );

      assert.equal(
        descriptor.authority,
        "NONE",
      );

      assert.equal(
        descriptor.sideEffect,
        "NONE",
      );
    }
  },
);

test(
  "P0.8.3 unknown agents fail closed",
  () => {
    assert.equal(
      isPulseAgentKnown(
        "unknown-agent",
      ),
      false,
    );

    assert.throws(
      () =>
        assertPulseAgentKnown(
          "unknown-agent" as any,
        ),
      /PULSE_AGENT_UNKNOWN/,
    );
  },
);

test(
  "P0.8.3 registry is immutable and stable",
  () => {
    const first =
      listPulseAgentDescriptors();

    const second =
      listPulseAgentDescriptors();

    assert.notEqual(
      first,
      second,
    );

    assert.deepEqual(
      first,
      second,
    );

    assert.equal(
      Object.isFrozen(first),
      true,
    );

    for (const descriptor of first) {
      assert.equal(
        Object.isFrozen(
          descriptor,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          descriptor.allowedIntents,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          descriptor.allowedSections,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          descriptor.capabilities,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          descriptor.skills,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          descriptor.tools,
        ),
        true,
      );
    }
  },
);

test(
  "P0.8.3 agent capabilities and bindings are explicit",
  () => {
    for (const descriptor of PULSE_AGENT_DESCRIPTORS) {
      assert.ok(
        descriptor.capabilities.length >
          0,
      );

      assert.ok(
        Array.isArray(
          descriptor.allowedIntents,
        ),
      );

      assert.ok(
        Array.isArray(
          descriptor.skills,
        ),
      );

      assert.ok(
        Array.isArray(
          descriptor.tools,
        ),
      );

      assert.ok(
        descriptor.description.trim()
          .length > 0,
      );
    }
  },
);

test(
  "P0.8.3 all referenced skills are canonical",
  () => {
    const knownSkills =
      new Set([
        "pulse.briefing",
        "pulse.plan",
        "pulse.alerta",
        "pulse.hero",
        "pulse.seo-fix",
      ]);

    for (const descriptor of PULSE_AGENT_DESCRIPTORS) {
      for (const skill of descriptor.skills) {
        assert.equal(
          knownSkills.has(
            skill,
          ),
          true,
          `${descriptor.id} references unknown skill ${skill}`,
        );
      }
    }
  },
);

test(
  "P0.8.3 all referenced tools are canonical",
  () => {
    const knownTools =
      new Set([
        "pulse.diff",
        "pulse.inspect",
        "pulse.map",
        "pulse.nba",
        "pulse.orders",
        "pulse.range",
        "pulse.score",
        "pulse.stock",
        "pulse.theme",
      ]);

    for (const descriptor of PULSE_AGENT_DESCRIPTORS) {
      for (const tool of descriptor.tools) {
        assert.equal(
          knownTools.has(
            tool,
          ),
          true,
          `${descriptor.id} references unknown tool ${tool}`,
        );
      }
    }
  },
);

test(
  "P0.8.3 A2A is explicitly external and still non-authoritative",
  () => {
    const descriptor =
      getPulseAgentDescriptor(
        "a2a",
      );

    assert.equal(
      descriptor.externalAgent,
      true,
    );

    assert.equal(
      descriptor.authority,
      "NONE",
    );

    assert.equal(
      descriptor.sideEffect,
      "NONE",
    );
  },
);

test(
  "P0.8.3 current pickAgent selections remain covered by the registry",
  () => {
    const cases: Array<{
      intent: Parameters<
        typeof pickAgent
      >[0];
      section: string;
      expected: string;
    }> = [
      {
        intent: "content",
        section: "dashboard",
        expected: "design",
      },
      {
        intent: "information",
        section: "website-builder",
        expected: "design",
      },
      {
        intent: "supplier",
        section: "dashboard",
        expected: "sourcing",
      },
      {
        intent: "inventory",
        section: "dashboard",
        expected: "sourcing",
      },
      {
        intent: "marketing",
        section: "dashboard",
        expected: "marketing",
      },
      {
        intent: "support",
        section: "dashboard",
        expected: "cx",
      },
      {
        intent: "catalog",
        section: "dashboard",
        expected: "sales",
      },
      {
        intent: "recommendation",
        section: "dashboard",
        expected: "sales",
      },
      {
        intent: "analysis",
        section: "dashboard",
        expected: "ops",
      },
      {
        intent: "order",
        section: "dashboard",
        expected: "ops",
      },
      {
        intent: "optimization",
        section: "dashboard",
        expected: "ops",
      },
      {
        intent: "information",
        section: "dashboard",
        expected: "pulse",
      },
    ];

    for (const item of cases) {
      const selected =
        pickAgent(
          item.intent,
          item.section,
        );

      assert.equal(
        selected,
        item.expected,
      );

      assert.equal(
        isPulseAgentKnown(
          selected,
        ),
        true,
      );
    }
  },
);

test(
  "P0.8.3 specialized agents do not claim universal intent authority",
  () => {
    const specialized =
      PULSE_AGENT_DESCRIPTORS.filter(
        (item) =>
          item.id !== "pulse" &&
          item.id !== "a2a",
      );

    for (const descriptor of specialized) {
      assert.ok(
        descriptor.allowedIntents.length >
          0,
      );

      assert.ok(
        descriptor.allowedIntents.length <
          17,
      );
    }
  },
);

test(
  "P0.8.3 no agent descriptor exposes execution authority",
  () => {
    for (const descriptor of PULSE_AGENT_DESCRIPTORS) {
      assert.equal(
        descriptor.authority,
        "NONE",
      );

      assert.equal(
        descriptor.sideEffect,
        "NONE",
      );
    }
  },
);
