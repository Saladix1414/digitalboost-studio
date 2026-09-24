import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PULSE_CONTEXT_ENGINE_CONTRACT,
  PulseContextAssemblyError,
  assemblePulseContext,
  contextItem,
} from "../../src/DigitalBoostPulseContextEngine";

function snapshot(
  tenant = "tenant-a",
) {
  return {
    id: "snap-fixed",
    mode: "CURRENT" as const,
    capturedAt:
      "2026-09-24T00:00:00.000Z",
    tenant,
    store: "store-a",
    version: "snapshot-fixed",
    facts: {},
  };
}

function item(
  id: string,
  overrides: Record<
    string,
    unknown
  > = {},
) {
  return contextItem({
    id,
    key:
      overrides.key ??
      id,

    tenantId:
      overrides.tenantId ??
      "tenant-a",

    value:
      overrides.value ??
      { id },

    source:
      overrides.source ??
      "test",

    provenance:
      overrides.provenance ??
      "test-fixture",

    timestamp:
      overrides.timestamp ??
      "2026-09-24T00:00:00.000Z",

    trust:
      overrides.trust ??
      "trusted",

    evidenceRefs:
      overrides.evidenceRefs ??
      [`ev:${id}`],

    constraints:
      overrides.constraints ??
      [`constraint:${id}`],

    relevance:
      overrides.relevance ??
      0.8,

    mandatory:
      overrides.mandatory ??
      false,

    ttlMs:
      overrides.ttlMs ??
      600000,
  });
}

for (
  let i = 1;
  i <= 20;
  i++
) {
  test(
    `unit deterministic ${i}`,
    () => {
      const args = {
        tenantId:
          "tenant-a",

        snapshot:
          snapshot(),

        policyVersion:
          "pulse-gov-v1",

        items: [
          item(`unit-${i}`),
        ],

        now: Date.parse(
          "2026-09-24T00:01:00.000Z",
        ),
      };

      const a =
        assemblePulseContext(
          args,
        );

      const b =
        assemblePulseContext(
          args,
        );

      assert.equal(
        a.version,
        b.version,
      );

      assert.equal(
        a.contextId,
        b.contextId,
      );

      assert.equal(
        a.items[0].freshness,
        "fresh",
      );
    },
  );
}

for (
  let i = 1;
  i <= 10;
  i++
) {
  test(
    `integration traceability ${i}`,
    () => {
      const result =
        assemblePulseContext({
          tenantId:
            "tenant-a",

          snapshot:
            snapshot(),

          policyVersion:
            "pulse-gov-v1",

          items: [
            item(
              `integration-${i}`,
              {
                source:
                  "integration-source",

                provenance:
                  "integration-fixture",
              },
            ),
          ],

          now: Date.parse(
            "2026-09-24T00:01:00.000Z",
          ),
        });

      assert.equal(
        result.tenantId,
        "tenant-a",
      );

      assert.equal(
        result.snapshotId,
        "snap-fixed",
      );

      assert.equal(
        result.items[0]
          .source,
        "integration-source",
      );

      assert.equal(
        result.items[0]
          .provenance,
        "integration-fixture",
      );
    },
  );
}

for (
  let i = 1;
  i <= 5;
  i++
) {
  test(
    `negative tenant ${i}`,
    () => {
      assert.throws(
        () =>
          assemblePulseContext({
            tenantId:
              "tenant-a",

            snapshot:
              snapshot(
                "tenant-a",
              ),

            policyVersion:
              "pulse-gov-v1",

            items: [
              item(
                `cross-${i}`,
                {
                  tenantId:
                    "tenant-b",
                },
              ),
            ],
          }),

        (error) =>
          error instanceof
            PulseContextAssemblyError &&
          error.code ===
            "CROSS_TENANT_CONTEXT",
      );
    },
  );
}

for (
  let i = 1;
  i <= 3;
  i++
) {
  test(
    `replay ${i}`,
    () => {
      const args = {
        tenantId:
          "tenant-a",

        snapshot:
          snapshot(),

        policyVersion:
          "pulse-gov-v1",

        items: [
          item(
            `replay-${i}-a`,
          ),
          item(
            `replay-${i}-b`,
          ),
        ],

        now: Date.parse(
          "2026-09-24T00:01:00.000Z",
        ),
      };

      assert.equal(
        assemblePulseContext(
          args,
        ).version,

        assemblePulseContext(
          args,
        ).version,
      );
    },
  );
}

for (
  let i = 1;
  i <= 3;
  i++
) {
  test(
    `compression recovery ${i}`,
    () => {
      const mandatory =
        item(
          `mandatory-${i}`,
          {
            mandatory: true,
            relevance: 1,
            evidenceRefs: [
              "evidence:mandatory",
            ],
          },
        );

      const optional =
        Array.from(
          { length: 30 },
          (_, n) =>
            item(
              `optional-${i}-${n}`,
              {
                relevance:
                  0.01,

                timestamp:
                  "2026-09-23T23:00:00.000Z",

                value:
                  "x".repeat(
                    500,
                  ),
              },
            ),
        );

      const result =
        assemblePulseContext({
          tenantId:
            "tenant-a",

          snapshot:
            snapshot(),

          policyVersion:
            "pulse-gov-v1",

          items: [
            mandatory,
            ...optional,
          ],

          now: Date.parse(
            "2026-09-24T00:01:00.000Z",
          ),

          maxBytes: 5000,
        });

      assert.equal(
        result.compression
          .truncated,
        true,
      );

      assert.ok(
        result.items.some(
          (entry) =>
            entry.id ===
              mandatory.id &&
            entry.mandatory,
        ),
      );

      assert.deepEqual(
        result.compression
          .preservedMandatoryEvidence,
        [
          "evidence:mandatory",
        ],
      );
    },
  );
}

test(
  "contract version",
  () => {
    const result =
      assemblePulseContext({
        tenantId:
          "tenant-a",

        snapshot:
          snapshot(),

        policyVersion:
          "pulse-gov-v1",

        items: [
          item("contract"),
        ],
      });

    assert.equal(
      result.contractVersion,
      PULSE_CONTEXT_ENGINE_CONTRACT,
    );
  },
);

test(
  "conflict detection",
  () => {
    const result =
      assemblePulseContext({
        tenantId:
          "tenant-a",

        snapshot:
          snapshot(),

        policyVersion:
          "pulse-gov-v1",

        items: [
          item("conflict-a", {
            key: "same",
            value: "A",
          }),

          item("conflict-b", {
            key: "same",
            value: "B",
          }),
        ],
      });

    assert.equal(
      result.conflicts.length,
      1,
    );

    assert.equal(
      result.conflicts[0]
        .resolution,
      "UNRESOLVED",
    );
  },
);

test(
  "stale freshness",
  () => {
    const result =
      assemblePulseContext({
        tenantId:
          "tenant-a",

        snapshot:
          snapshot(),

        policyVersion:
          "pulse-gov-v1",

        items: [
          item(
            "stale-item",
            {
              timestamp:
                "2026-09-23T23:00:00.000Z",
            },
          ),
        ],

        now: Date.parse(
          "2026-09-24T00:01:00.000Z",
        ),
      });

    assert.equal(
      result.items[0]
        .freshness,
      "stale",
    );
  },
);

test(
  "mandatory overflow",
  () => {
    assert.throws(
      () =>
        assemblePulseContext({
          tenantId:
            "tenant-a",

          snapshot:
            snapshot(),

          policyVersion:
            "pulse-gov-v1",

          items: [
            item(
              "huge",
              {
                mandatory:
                  true,

                value:
                  "x".repeat(
                    10000,
                  ),
              },
            ),
          ],

          maxBytes: 1024,
        }),

      (error) =>
        error instanceof
          PulseContextAssemblyError &&
        error.code ===
          "MANDATORY_CONTEXT_EXCEEDS_LIMIT",
    );
  },
);

test(
  "duplicate ids",
  () => {
    assert.throws(
      () =>
        assemblePulseContext({
          tenantId:
            "tenant-a",

          snapshot:
            snapshot(),

          policyVersion:
            "pulse-gov-v1",

          items: [
            item("duplicate"),
            item("duplicate"),
          ],
        }),

      (error) =>
        error instanceof
          PulseContextAssemblyError &&
        error.code ===
          "DUPLICATE_CONTEXT_ITEM",
    );
  },
);
