
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

import {
  test,
  beforeEach,
} from "node:test";

import assert from "node:assert/strict";

import {
  createPulseExperiment,
  startPulseExperiment,
} from "../../src/DigitalBoostPulseExperiment";

import {
  evaluatePulseExperiment,
} from "../../src/DigitalBoostPulseExperimentEvaluation";

import {
  createPulseExperimentLessonCandidate,
  verifyPulseExperimentLessonCandidate,
} from "../../src/DigitalBoostPulseExperimentLearning";

const storage: Record<
  string,
  string
> = {};

globalThis.localStorage = {
  getItem(
    key: string,
  ): string | null {
    return (
      storage[key] ??
      null
    );
  },

  setItem(
    key: string,
    value: string,
  ): void {
    storage[key] = value;
  },

  removeItem(
    key: string,
  ): void {
    delete storage[key];
  },

  clear(): void {
    for (
      const key
      of Object.keys(storage)
    ) {
      delete storage[key];
    }
  },

  key(
    index: number,
  ): string | null {
    return (
      Object.keys(storage)[
        index
      ] ??
      null
    );
  },

  get length(): number {
    return Object.keys(
      storage,
    ).length;
  },
} as Storage;

function reset(): void {
  for (
    const key
    of Object.keys(storage)
  ) {
    delete storage[key];
  }
}

function createFixture(
  tenantId = "tenant-p1c",
  store = "P1Store",
) {
  const experiment =
    createPulseExperiment({
      store,
      tenantId,
      hypothesis: {
        statement:
          "hero title is present",
        metric:
          "hero_title_present",
        direction:
          "up",
      },
      variants: [
        {
          id: "A",
          label:
            "Variant A",
          action:
            "hero",
          payload: {},
        },
        {
          id: "B",
          label:
            "Variant B",
          action:
            "hero",
          payload: {},
        },
      ],
    });

  assert.ok(
    experiment,
  );

  const started =
    startPulseExperiment(
      experiment.id,
    );

  assert.ok(
    started,
  );

  return started;
}

function acceptedEvaluation(
  experiment: ReturnType<
    typeof createFixture
  >,
) {
  const resolver = {
    resolve(
      ref: string,
    ) {
      const isA =
        ref.endsWith("-a");

      return boundEvidence(
        ref,
        experiment.tenantId ||
          "",
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

  return evaluatePulseExperiment({
    experiment,
    observations: [
      {
        variantId:
          "A",
        metric:
          "hero_title_present",
        value:
          1,
        observedAt:
          "2026-09-26T10:00:00.000Z",
        evidenceRefs: [
          "durable-a",
        ],
      },
      {
        variantId:
          "B",
        metric:
          "hero_title_present",
        value:
          0,
        observedAt:
          "2026-09-26T10:01:00.000Z",
        evidenceRefs: [
          "durable-b",
        ],
      },
    ],
    evidenceResolver:
      resolver,
  });
}

beforeEach(
  reset,
);

test(
  "GREEN: ACCEPTED evaluation creates an UNTRUSTED lesson candidate",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    assert.equal(
      evaluation.status,
      "ACCEPTED",
    );

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.ok(
      candidate,
    );

    assert.equal(
      candidate.status,
      "CANDIDATE",
    );

    assert.equal(
      candidate.authority,
      "NONE",
    );

    assert.equal(
      candidate.trust,
      "UNTRUSTED",
    );

    assert.equal(
      candidate.canGrantApproval,
      false,
    );

    assert.equal(
      candidate.canSupportExecution,
      false,
    );

    assert.equal(
      candidate.canPromoteMemory,
      false,
    );

    assert.equal(
      candidate.verificationState,
      "REQUIRES_DURABLE_VERIFICATION",
    );

    assert.equal(
      verifyPulseExperimentLessonCandidate(
        candidate,
      ),
      true,
    );
  },
);

test(
  "RED TEAM: REJECTED evaluation cannot create a candidate",
  () => {
    const experiment =
      createFixture();

    const evaluation = {
      ...acceptedEvaluation(
        experiment,
      ),
      status:
        "REJECTED" as const,
      acceptedVariantId:
        null,
    };

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: INCONCLUSIVE evaluation cannot create a candidate",
  () => {
    const experiment =
      createFixture();

    const evaluation = {
      ...acceptedEvaluation(
        experiment,
      ),
      status:
        "INCONCLUSIVE" as const,
      acceptedVariantId:
        null,
    };

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: BLOCKED evaluation cannot create a candidate",
  () => {
    const experiment =
      createFixture();

    const evaluation = {
      ...acceptedEvaluation(
        experiment,
      ),
      status:
        "BLOCKED" as const,
      acceptedVariantId:
        null,
    };

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: legacy experiment without explicit tenant cannot become a lesson candidate",
  () => {
    const experiment =
      createPulseExperiment({
        store:
          "LegacyStore",
        hypothesis: {
          statement:
            "hero title is present",
          metric:
            "hero_title_present",
          direction:
            "up",
        },
        variants: [
          {
            id: "A",
            label: "A",
            action: "hero",
            payload: {},
          },
          {
            id: "B",
            label: "B",
            action: "hero",
            payload: {},
          },
        ],
      });

    assert.ok(
      experiment,
    );

    const started =
      startPulseExperiment(
        experiment.id,
      );

    assert.ok(
      started,
    );

    const evaluation =
      evaluatePulseExperiment({
        experiment:
          started,
        observations: [
          {
            variantId:
              "A",
            metric:
              "hero_title_present",
            value:
              1,
            observedAt:
              "2026-09-26T10:00:00.000Z",
            evidenceRefs: [
              "legacy-a",
            ],
          },
          {
            variantId:
              "B",
            metric:
              "hero_title_present",
            value:
              0,
            observedAt:
              "2026-09-26T10:01:00.000Z",
            evidenceRefs: [
              "legacy-b",
            ],
          },
        ],
        evidenceResolver: {
          resolve(
            ref: string,
          ) {
            const isA =
              ref.endsWith("-a");

            return boundEvidence(
              ref,
              "",
              started.id,
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
        },
      });

    assert.equal(
      evaluation.status,
      "ACCEPTED",
    );

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment:
          started,
        evaluation,
      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: cross-tenant evaluation cannot create a candidate",
  () => {
    const experiment =
      createFixture(
        "tenant-a",
      );

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const forged = {
      ...evaluation,
      tenantId:
        "tenant-b",
    };

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation:
          forged,
      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: cross-experiment evaluation cannot create a candidate",
  () => {
    const experimentA =
      createFixture(
        "tenant-a",
      );

    const experimentB =
      createFixture(
        "tenant-a",
        "P1Store-B",
      );

    const evaluation =


      acceptedEvaluation(


        experimentA,


      );



    const candidate =


      createPulseExperimentLessonCandidate({


        experiment: experimentB,


        evaluation,


      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: acceptedVariantId must belong to the experiment",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const forged = {
      ...evaluation,
      acceptedVariantId:
        "NOT_DECLARED",
    };

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation:
          forged,
      });

    assert.equal(
      candidate,
      null,
    );
  },
);

test(
  "RED TEAM: candidate does not persist memory or mutate localStorage",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const before =
      JSON.stringify(
        storage,
      );

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.ok(
      candidate,
    );

    assert.equal(
      JSON.stringify(
        storage,
      ),
      before,
    );

    const keys =
      Object.keys(
        storage,
      );

    assert.equal(
      keys.some(
        (key) =>
          key.includes(
            "memory",
          ),
      ),
      false,
    );
  },
);

test(
  "RED TEAM: sensitive authority fields never cross into the candidate",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const forgedEvaluation =
      Object.assign(
        {},
        evaluation,
        {
          approval:
            "FORGED_APPROVAL",
          authority:
            "EXECUTOR",
          proof:
            "FORGED_PROOF",
          proofHash:
            "FORGED_HASH",
          attestation:
            "FORGED_ATTESTATION",
          execution:
            "FORGED_EXECUTION",
          governance:
            "FORGED_GOVERNANCE",
        },
      );

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation:
          forgedEvaluation,
      });

    assert.ok(
      candidate,
    );

    const record =
      candidate as unknown as Record<
        string,
        unknown
      >;

    for (
      const key of [
        "approval",
        "proof",
        "proofHash",
        "attestation",
        "execution",
        "governance",
      ]
    ) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(
          record,
          key,
        ),
        false,
        `Candidate must not expose ${key}.`,
      );
    }

    assert.equal(
      candidate.authority,
      "NONE",
    );

    assert.equal(
      candidate.trust,
      "UNTRUSTED",
    );
  },
);

test(
  "RED TEAM: tampering with candidate authority invalidates candidate verification",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const candidate =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.ok(
      candidate,
    );

    const forged =
      Object.assign(
        {},
        candidate,
        {
          authority:
            "EXECUTOR" as "NONE",
        },
      );

    assert.equal(
      verifyPulseExperimentLessonCandidate(
        forged,
      ),
      false,
    );
  },
);

test(
  "RED TEAM: candidate identity is deterministic for the same evaluation",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const first =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    const second =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    assert.ok(
      first,
    );

    assert.ok(
      second,
    );

    assert.equal(
      first.candidateId,
      second.candidateId,
    );

    assert.equal(
      first.candidateFingerprint,
      second.candidateFingerprint,
    );

    assert.equal(
      first.evaluationFingerprint,
      second.evaluationFingerprint,
    );
  },
);

test(
  "RED TEAM: changing evaluated observations changes candidate identity",
  () => {
    const experiment =
      createFixture();

    const evaluation =
      acceptedEvaluation(
        experiment,
      );

    const first =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation,
      });

    const changed =
      {
        ...evaluation,
        observations:
          [
            ...evaluation.observations,
            {
              variantId:
                "A",
              metric:
                "hero_title_present",
              value:
                0,
              observedAt:
                "2026-09-26T10:02:00.000Z",
              evidenceRefs: [
                "durable-c",
              ],
            },
          ],
      };

    const second =
      createPulseExperimentLessonCandidate({
        experiment,
        evaluation:
          changed,
      });

    assert.ok(
      first,
    );

    assert.ok(
      second,
    );

    assert.notEqual(
      first.candidateFingerprint,
      second.candidateFingerprint,
    );

    assert.notEqual(
      first.candidateId,
      second.candidateId,
    );
  },
);
