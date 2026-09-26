import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_SKILL_REGISTRY_CONTRACT,
  PULSE_SKILL_DESCRIPTORS,
  assertPulseSkillKnown,
  getPulseSkillDescriptor,
  isPulseSkillKnown,
  listPulseSkillDescriptors,
} from "../../src/DigitalBoostPulseSkillRegistry";

const EXPECTED_IDS = [
  "pulse.alerta",
  "pulse.briefing",
  "pulse.hero",
  "pulse.plan",
  "pulse.seo-fix",
];

const EXPECTED_EXPORTS = new Map([
  ["pulse.briefing", "skillBriefing"],
  ["pulse.plan", "skillPlan"],
  ["pulse.alerta", "skillAlerta"],
  ["pulse.hero", "skillHero"],
  ["pulse.seo-fix", "skillSeoFix"],
]);

test(
  "P0.8.1 contract is explicit",
  () => {
    assert.equal(
      PULSE_SKILL_REGISTRY_CONTRACT,
      "p0.8.1",
    );

    assert.equal(
      PULSE_SKILL_DESCRIPTORS.length,
      EXPECTED_IDS.length,
    );
  },
);

test(
  "P0.8.1 registry contains exactly the current canonical skills",
  () => {
    const ids =
      PULSE_SKILL_DESCRIPTORS.map(
        (item) => item.id,
      );

    assert.deepEqual(
      [...ids].sort(),
      [...EXPECTED_IDS].sort(),
    );

    assert.equal(
      new Set(ids).size,
      ids.length,
    );
  },
);

test(
  "P0.8.1 implementation exports bind to the real skills",
  () => {
    for (const item of PULSE_SKILL_DESCRIPTORS) {
      assert.equal(
        EXPECTED_EXPORTS.get(
          item.id,
        ),
        item.implementationExport,
      );

      assert.equal(
        item.source,
        "pulse-skills",
      );
    }
  },
);

test(
  "P0.8.1 known skills resolve",
  () => {
    for (const id of EXPECTED_IDS) {
      const item =
        getPulseSkillDescriptor(id);

      assert.equal(
        item.id,
        id,
      );

      assert.equal(
        item.contractVersion,
        "p0.8.1",
      );

      assert.equal(
        item.authority,
        "NONE",
      );

      assert.equal(
        item.sideEffect,
        "NONE",
      );
    }
  },
);

test(
  "P0.8.1 unknown skills fail closed",
  () => {
    assert.equal(
      isPulseSkillKnown(
        "pulse.this-does-not-exist",
      ),
      false,
    );

    assert.throws(
      () =>
        getPulseSkillDescriptor(
          "pulse.this-does-not-exist",
        ),
      /PULSE_SKILL_UNKNOWN/,
    );

    assert.throws(
      () =>
        assertPulseSkillKnown(""),
      /PULSE_SKILL_ID_REQUIRED/,
    );
  },
);

test(
  "P0.8.1 registry is immutable and stable",
  () => {
    const first =
      listPulseSkillDescriptors();

    const second =
      listPulseSkillDescriptors();

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

    for (const item of first) {
      assert.equal(
        Object.isFrozen(item),
        true,
      );

      assert.equal(
        Object.isFrozen(
          item.capabilities,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(
          item.dependencies,
        ),
        true,
      );

      assert.equal(
        Object.isFrozen(item.input),
        true,
      );

      assert.equal(
        Object.isFrozen(item.output),
        true,
      );
    }
  },
);

test(
  "P0.8.1 skills remain non-authoritative",
  () => {
    for (const item of PULSE_SKILL_DESCRIPTORS) {
      assert.ok(
        item.kind ===
          "COMPOSITE" ||
        item.kind ===
          "PROPOSAL",
      );

      assert.equal(
        item.sideEffect,
        "NONE",
      );

      assert.equal(
        item.authority,
        "NONE",
      );
    }
  },
);

test(
  "P0.8.1 dependencies reference known P0.8.0 tools when declared",
  () => {
    const knownToolIds = new Set([
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

    for (const skill of PULSE_SKILL_DESCRIPTORS) {
      for (const dependency of skill.dependencies) {
        assert.equal(
          knownToolIds.has(
            dependency,
          ),
          true,
          `${skill.id} declares unknown tool dependency ${dependency}`,
        );
      }
    }
  },
);

test(
  "P0.8.1 every skill exposes capabilities and a stable description",
  () => {
    for (const item of PULSE_SKILL_DESCRIPTORS) {
      assert.ok(
        item.capabilities.length >
          0,
      );

      assert.match(
        item.id,
        /^pulse\.[a-z0-9-]+$/,
      );

      assert.ok(
        item.description.trim()
          .length > 0,
      );
    }
  },
);

test(
  "P0.8.1 registry exposes no execution authority",
  () => {
    if (
      "executePulseSkill" in
      (globalThis as Record<string, unknown>)
    ) {
      throw new Error(
        "Unexpected global execution surface.",
      );
    }

    assert.deepEqual(
      Object.keys({
        getPulseSkillDescriptor,
        listPulseSkillDescriptors,
        isPulseSkillKnown,
        assertPulseSkillKnown,
      }).sort(),
      [
        "assertPulseSkillKnown",
        "getPulseSkillDescriptor",
        "isPulseSkillKnown",
        "listPulseSkillDescriptors",
      ].sort(),
    );
  },
);
