import test from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_TOOL_REGISTRY_CONTRACT,
  PULSE_TOOL_DESCRIPTORS,
  assertPulseToolKnown,
  getPulseToolDescriptor,
  isPulseToolKnown,
  listPulseToolDescriptors,
} from "../../src/DigitalBoostPulseToolRegistry";

const EXPECTED_IDS = [
  "pulse.diff",
  "pulse.inspect",
  "pulse.map",
  "pulse.nba",
  "pulse.orders",
  "pulse.range",
  "pulse.score",
  "pulse.stock",
  "pulse.theme",
];

test(
  "P0.8.0 contract is explicit",
  () => {
    assert.equal(
      PULSE_TOOL_REGISTRY_CONTRACT,
      "p0.8.0",
    );

    assert.ok(
      PULSE_TOOL_DESCRIPTORS.length > 0,
    );
  },
);

test(
  "P0.8.0 registry has deterministic unique ids",
  () => {
    const ids =
      PULSE_TOOL_DESCRIPTORS.map(
        (item) => item.id,
      );

    const sortedIds =
      [...ids].sort();

    const sortedExpectedIds =
      [...EXPECTED_IDS].sort();

    assert.deepEqual(
      sortedIds,
      sortedExpectedIds,
    );

    assert.equal(
      new Set(ids).size,
      ids.length,
    );

    assert.deepEqual(
      ids,
      PULSE_TOOL_DESCRIPTORS.map(
        (item) => item.id,
      ),
    );
  },
);

test(
  "P0.8.0 registry resolves known tools",
  () => {
    for (const id of EXPECTED_IDS) {
      const item =
        getPulseToolDescriptor(id);

      assert.equal(
        item.id,
        id,
      );

      assert.equal(
        item.contractVersion,
        "p0.8.0",
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
  "P0.8.0 unknown tools fail closed",
  () => {
    assert.equal(
      isPulseToolKnown(
        "pulse.this-does-not-exist",
      ),
      false,
    );

    assert.throws(
      () =>
        getPulseToolDescriptor(
          "pulse.this-does-not-exist",
        ),
      /PULSE_TOOL_UNKNOWN/,
    );

    assert.throws(
      () =>
        assertPulseToolKnown(""),
      /PULSE_TOOL_ID_REQUIRED/,
    );
  },
);

test(
  "P0.8.0 list returns a stable immutable view",
  () => {
    const first =
      listPulseToolDescriptors();

    const second =
      listPulseToolDescriptors();

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
  "P0.8.0 every registered tool is observational/proposal-only",
  () => {
    for (const item of PULSE_TOOL_DESCRIPTORS) {
      assert.ok(
        item.kind ===
          "OBSERVATION" ||
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
  "P0.8.0 registry contains implementation provenance",
  () => {
    for (const item of PULSE_TOOL_DESCRIPTORS) {
      assert.match(
        item.implementationExport,
        /^tool[A-Z]/,
      );

      assert.equal(
        item.source,
        "pulse-tools",
      );
    }
  },
);

test(
  "P0.8.0 registry contains capability metadata",
  () => {
    for (const item of PULSE_TOOL_DESCRIPTORS) {
      assert.ok(
        Array.isArray(
          item.capabilities,
        ),
      );

      assert.ok(
        item.capabilities.length >
          0,
      );

      assert.equal(
        typeof item.description,
        "string",
      );

      assert.ok(
        item.description.trim()
          .length > 0,
      );
    }
  },
);

test(
  "P0.8.0 registry exposes no execution API",
  () => {
    const registryModuleSurface =
      {
        getPulseToolDescriptor,
        listPulseToolDescriptors,
        isPulseToolKnown,
        assertPulseToolKnown,
      };

    assert.deepEqual(
      Object.keys(
        registryModuleSurface,
      ).sort(),
      [
        "assertPulseToolKnown",
        "getPulseToolDescriptor",
        "isPulseToolKnown",
        "listPulseToolDescriptors",
      ].sort(),
    );
  },
);
