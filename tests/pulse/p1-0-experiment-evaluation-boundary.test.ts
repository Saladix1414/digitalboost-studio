
function boundEvidence(
  ref: string,
  tenantId: string,
  experimentId: string,
  observation: {
    variantId: string;
    metric: string;
    value: number | boolean;
    observedAt: string;
  },
  verified = true,
) {
  return createPulseExperimentEvidence({
    ref,
    tenantId,
    experimentId,
    observation: {
      ...observation,
      evidenceRefs: [ref],
    },
    verified,
  });
}

import { createPulseExperimentEvidence } from "../../src/DigitalBoostPulseExperimentEvaluation";

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  createPulseExperiment,
  startPulseExperiment,
  stopPulseExperiment,
} from "../../src/DigitalBoostPulseExperiment";

import {
  evaluatePulseExperiment,
  type PulseExperimentEvidenceResolver,
} from "../../src/DigitalBoostPulseExperimentEvaluation";

const storage: Record<string, string> = {};

globalThis.localStorage = {
  getItem(key: string): string | null {
    return storage[key] ?? null;
  },

  setItem(key: string, value: string): void {
    storage[key] = value;
  },

  removeItem(key: string): void {
    delete storage[key];
  },

  clear(): void {
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  },

  key(index: number): string | null {
    return Object.keys(storage)[index] ?? null;
  },

  get length(): number {
    return Object.keys(storage).length;
  },
} as Storage;

function reset(): void {
  for (const key of Object.keys(storage)) {
    delete storage[key];
  }
}

function createFixture(tenantId = "tenant-a") {
  const experiment = createPulseExperiment({
    store: "P1Store",
    tenantId,
    hypothesis: {
      statement: "hero title is present",
      metric: "hero_title_present",
      direction: "up",
    },
    variants: [
      {
        id: "A",
        label: "Variant A",
        action: "hero",
        payload: {},
      },
      {
        id: "B",
        label: "Variant B",
        action: "hero",
        payload: {},
      },
    ],
  });

  assert.ok(experiment);

  const started = startPulseExperiment(experiment.id);

  assert.ok(started);
  assert.equal(started.status, "RUNNING");

  return started;
}

beforeEach(reset);

test(
  "RED TEAM: STOPPED experiment cannot generate learning",
  async () => {
    const experiment = createFixture();

    const stopped = stopPulseExperiment(
      experiment.id,
      "manual-stop",
    );

    assert.ok(stopped);
    assert.equal(stopped.status, "STOPPED");

    const { queryPulseMemory } =
      await import("../../src/DigitalBoostPulseMemory");

    const lessons = queryPulseMemory({
      kind: "lesson",
      tenantId: "tenant-a",
      scope: "P1Store",
    });

    assert.equal(
      lessons.length,
      0,
      "Stopping an experiment is not an evaluation and must not create a lesson.",
    );
  },
);

test(
  "RED TEAM: evaluation without durable evidence cannot be ACCEPTED",
  () => {
    const experiment = createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve() {
        return null;
      },
    };

    const result = evaluatePulseExperiment({
      experiment,
      observations: [
        {
          variantId: "A",
          metric: "hero_title_present",
          value: 1,
          observedAt: "2026-09-26T10:00:00.000Z",
          evidenceRefs: ["fake-observation-a"],
        },
        {
          variantId: "B",
          metric: "hero_title_present",
          value: 0,
          observedAt: "2026-09-26T10:01:00.000Z",
          evidenceRefs: ["fake-observation-b"],
        },
      ],
      evidenceResolver: resolver,
    });

    assert.notEqual(
      result.status,
      "ACCEPTED",
      "Evidence references alone must never produce an accepted evaluation.",
    );
  },
);

test(
  "RED TEAM: experiment cannot consume evidence from another tenant",
  () => {
    const experiment = createFixture("tenant-a");

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {

        const isA =

          ref.endsWith("-a");


        return boundEvidence(

          ref,

          "tenant-b",

          experiment.id,

          {

            variantId:

              isA ? "A" : "B",

            metric:

              "hero_title_present",

            value:

              isA ? 1 : 0,

            observedAt:

              isA

                ? "2026-09-26T10:00:00.000Z"

                : "2026-09-26T10:01:00.000Z",

          },

        );

      },
    };

    const result = evaluatePulseExperiment({
      experiment,
      observations: [
        {
          variantId: "A",
          metric: "hero_title_present",
          value: 1,
          observedAt: "2026-09-26T10:00:00.000Z",
          evidenceRefs: ["evidence-a"],
        },
        {
          variantId: "B",
          metric: "hero_title_present",
          value: 0,
          observedAt: "2026-09-26T10:01:00.000Z",
          evidenceRefs: ["evidence-b"],
        },
      ],
      evidenceResolver: resolver,
    });

    assert.notEqual(
      result.status,
      "ACCEPTED",
      "Cross-tenant evidence must fail closed.",
    );
  },
);

test(
  "RED TEAM: experiment cannot consume evidence bound to another experiment",
  () => {
    const experiment = createFixture("tenant-a");

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {

        const isA =

          ref.endsWith("-a");


        return boundEvidence(

          ref,

          "tenant-a",

          "another-experiment",

          {

            variantId:

              isA ? "A" : "B",

            metric:

              "hero_title_present",

            value:

              isA ? 1 : 0,

            observedAt:

              isA

                ? "2026-09-26T10:00:00.000Z"

                : "2026-09-26T10:01:00.000Z",

          },

        );

      },
    };

    const result = evaluatePulseExperiment({
      experiment,
      observations: [
        {
          variantId: "A",
          metric: "hero_title_present",
          value: 1,
          observedAt: "2026-09-26T10:00:00.000Z",
          evidenceRefs: ["evidence-a"],
        },
        {
          variantId: "B",
          metric: "hero_title_present",
          value: 0,
          observedAt: "2026-09-26T10:01:00.000Z",
          evidenceRefs: ["evidence-b"],
        },
      ],
      evidenceResolver: resolver,
    });

    assert.notEqual(
      result.status,
      "ACCEPTED",
      "Evidence from another experiment must not be reusable.",
    );
  },
);

test(
  "RED TEAM: evaluation cannot use a non-declared metric",
  () => {
    const experiment = createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {

        const isA =

          ref.endsWith("-a");


        return boundEvidence(

          ref,

          "tenant-a",

          experiment.id,

          {

            variantId:

              isA ? "A" : "B",

            metric:

              "hero_title_present",

            value:

              isA ? 1 : 0,

            observedAt:

              isA

                ? "2026-09-26T10:00:00.000Z"

                : "2026-09-26T10:01:00.000Z",

          },

        );

      },
    };

    const result = evaluatePulseExperiment({
      experiment,
      observations: [
        {
          variantId: "A",
          metric: "invented_metric",
          value: 999,
          observedAt: "2026-09-26T10:00:00.000Z",
          evidenceRefs: ["evidence-a"],
        },
      ],
      evidenceResolver: resolver,
    });

    assert.notEqual(
      result.status,
      "ACCEPTED",
      "An evaluation may only use the experiment's declared metric.",
    );
  },
);

test(
  "GREEN: verified same-tenant evidence can produce an accepted evaluation",
  () => {
    const experiment = createFixture("tenant-green");

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {

        const isA =

          ref.endsWith("-a");


        return boundEvidence(

          ref,

          "tenant-green",

          experiment.id,

          {

            variantId:

              isA ? "A" : "B",

            metric:

              "hero_title_present",

            value:

              isA ? 1 : 0,

            observedAt:

              isA

                ? "2026-09-26T10:00:00.000Z"

                : "2026-09-26T10:01:00.000Z",

          },

        );

      },
    };

    const result = evaluatePulseExperiment({
      experiment,
      observations: [
        {
          variantId: "A",
          metric: "hero_title_present",
          value: 1,
          observedAt: "2026-09-26T10:00:00.000Z",
          evidenceRefs: ["verified-a"],
        },
        {
          variantId: "B",
          metric: "hero_title_present",
          value: 0,
          observedAt: "2026-09-26T10:01:00.000Z",
          evidenceRefs: ["verified-b"],
        },
      ],
      evidenceResolver: resolver,
    });

    assert.equal(result.status, "ACCEPTED");
    assert.equal(result.acceptedVariantId, "A");
    assert.equal(
      result.reason,
      "VERIFIED_VARIANT_SEPARATION",
    );
  },
);

test(
  "RED TEAM: accepted evaluation is not an authority or execution grant",
  () => {
    const experiment = createFixture("tenant-boundary");

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {

        const isA =

          ref.endsWith("-a");


        return boundEvidence(

          ref,

          "tenant-boundary",

          experiment.id,

          {

            variantId:

              isA ? "A" : "B",

            metric:

              "hero_title_present",

            value:

              isA ? 1 : 0,

            observedAt:

              isA

                ? "2026-09-26T10:00:00.000Z"

                : "2026-09-26T10:01:00.000Z",

          },

        );

      },
    };

    const result = evaluatePulseExperiment({
      experiment,
      observations: [
        {
          variantId: "A",
          metric: "hero_title_present",
          value: 1,
          observedAt: "2026-09-26T10:00:00.000Z",
          evidenceRefs: ["boundary-a"],
        },
        {
          variantId: "B",
          metric: "hero_title_present",
          value: 0,
          observedAt: "2026-09-26T10:01:00.000Z",
          evidenceRefs: ["boundary-b"],
        },
      ],
      evidenceResolver: resolver,
    });

    assert.equal(result.status, "ACCEPTED");

    const record = result as unknown as Record<string, unknown>;

    assert.equal(
      "approval" in record,
      false,
    );
    assert.equal(
      "authority" in record,
      false,
    );
    assert.equal(
      "proof" in record,
      false,
    );
    assert.equal(
      "proofHash" in record,
      false,
    );
    assert.equal(
      "attestation" in record,
      false,
    );
    assert.equal(
      "execution" in record,
      false,
    );
    assert.equal(
      "governance" in record,
      false,
    );
  },
);

test(
  "RED TEAM: evidence variant mismatch is blocked",
  () => {
    const experiment =
      createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {
        return boundEvidence(
          ref,
          experiment.tenantId || "",
          experiment.id,
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
          },
        );
      },
    };

    const result =
      evaluatePulseExperiment({
        experiment,
        observations: [
          {
            variantId: "B",
            metric: "hero_title_present",
            value: 0,
            observedAt:
              "2026-09-26T10:01:00.000Z",
            evidenceRefs: ["variant-a"],
          },
        ],
        evidenceResolver:
          resolver,
      });

    assert.equal(
      result.status,
      "BLOCKED",
    );
  },
);

test(
  "RED TEAM: evidence metric mismatch is blocked",
  () => {
    const experiment =
      createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {
        return boundEvidence(
          ref,
          experiment.tenantId || "",
          experiment.id,
          {
            variantId: "A",
            metric: "wrong_metric",
            value: 1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
          },
        );
      },
    };

    const result =
      evaluatePulseExperiment({
        experiment,
        observations: [
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
            evidenceRefs: ["metric-a"],
          },
        ],
        evidenceResolver:
          resolver,
      });

    assert.equal(
      result.status,
      "BLOCKED",
    );
  },
);

test(
  "RED TEAM: evidence value mismatch is blocked",
  () => {
    const experiment =
      createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {
        return boundEvidence(
          ref,
          experiment.tenantId || "",
          experiment.id,
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 0,
            observedAt:
              "2026-09-26T10:00:00.000Z",
          },
        );
      },
    };

    const result =
      evaluatePulseExperiment({
        experiment,
        observations: [
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
            evidenceRefs: ["value-a"],
          },
        ],
        evidenceResolver:
          resolver,
      });

    assert.equal(
      result.status,
      "BLOCKED",
    );
  },
);

test(
  "RED TEAM: evidence timestamp mismatch is blocked",
  () => {
    const experiment =
      createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {
        return boundEvidence(
          ref,
          experiment.tenantId || "",
          experiment.id,
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 1,
            observedAt:
              "2026-09-26T09:00:00.000Z",
          },
        );
      },
    };

    const result =
      evaluatePulseExperiment({
        experiment,
        observations: [
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
            evidenceRefs: ["time-a"],
          },
        ],
        evidenceResolver:
          resolver,
      });

    assert.equal(
      result.status,
      "BLOCKED",
    );
  },
);

test(
  "RED TEAM: tampered evidence binding hash is blocked",
  () => {
    const experiment =
      createFixture();

    const resolver: PulseExperimentEvidenceResolver = {
      resolve(ref) {
        const evidence =
          boundEvidence(
            ref,
            experiment.tenantId || "",
            experiment.id,
            {
              variantId: "A",
              metric: "hero_title_present",
              value: 1,
              observedAt:
                "2026-09-26T10:00:00.000Z",
            },
          );

        return {
          ...evidence,
          bindingHash:
            "fnv1a_FORGED",
        };
      },
    };

    const result =
      evaluatePulseExperiment({
        experiment,
        observations: [
          {
            variantId: "A",
            metric: "hero_title_present",
            value: 1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
            evidenceRefs: ["hash-a"],
          },
        ],
        evidenceResolver:
          resolver,
      });

    assert.equal(
      result.status,
      "BLOCKED",
    );
  },
);
