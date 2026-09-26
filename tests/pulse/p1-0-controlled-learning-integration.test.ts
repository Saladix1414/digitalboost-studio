import assert from "node:assert/strict";
import test from "node:test";

import {
  completePulseExperiment,
  createPulseExperiment,
  startPulseExperiment,
  stopPulseExperiment,
} from "../../src/DigitalBoostPulseExperiment";

import {
  createPulseExperimentEvidence,
  evaluatePulseExperiment,
  type PulseExperimentEvaluation,
  type PulseExperimentEvidence,
} from "../../src/DigitalBoostPulseExperimentEvaluation";

import {
  createPulseExperimentLessonCandidate,
} from "../../src/DigitalBoostPulseExperimentLearning";

import {
  PULSE_CONTROLLED_LEARNING_CONTRACT,
  rememberPulseExperimentLesson,
} from "../../src/DigitalBoostPulseControlledLearning";

import {
  compilePlaybook,
} from "../../src/DigitalBoostPulseIntel";

import {
  queryPulseMemory,
  queryTrustedPulseMemory,
  verifyPulseMemory,
} from "../../src/DigitalBoostPulseMemory";

class MemoryStorage {
  private readonly data =
    new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key)
      ? this.data.get(key)!
      : null;
  }

  setItem(
    key: string,
    value: string,
  ): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

const storage =
  new MemoryStorage();

(globalThis as {
  localStorage?: MemoryStorage;
}).localStorage = storage;

function reset(): void {
  storage.clear();
}

function createFixture() {
  const created =
    createPulseExperiment({
      store: "LearningStore",
      tenantId: "tenant-learning",
      hypothesis: {
        statement:
          "Variant A improves hero title presence.",
        metric:
          "hero_title_present",
        direction: "up",
      },
      variants: [
        {
          id: "variant-a",
          label: "Variant A",
          action: "hero-a",
          payload: {},
        },
        {
          id: "variant-b",
          label: "Variant B",
          action: "hero-b",
          payload: {},
        },
      ],
      guardrails: [],
      stopConditions: [],
    });

  assert.ok(created);

  const running =
    startPulseExperiment(
      created.id,
    );

  assert.ok(running);

  const observations = [
    {
      variantId:
        "variant-a",
      metric:
        "hero_title_present",
      value: true,
      observedAt:
        "2026-09-26T12:00:00.000Z",
      evidenceRefs: [
        "experiment-evidence-a",
      ],
    },
    {
      variantId:
        "variant-b",
      metric:
        "hero_title_present",
      value: false,
      observedAt:
        "2026-09-26T12:00:00.000Z",
      evidenceRefs: [
        "experiment-evidence-b",
      ],
    },
  ] as const;

  const evidenceMap =
    new Map<
      string,
      PulseExperimentEvidence
    >();

  for (const observation of observations) {
    const ref =
      observation.evidenceRefs[0];

    evidenceMap.set(
      ref,
      createPulseExperimentEvidence({
        ref,
        tenantId:
          "tenant-learning",
        experimentId:
          created.id,
        observation,
        verified: true,
      }),
    );
  }

  const evidenceResolver = {
    resolve(ref: string) {
      return evidenceMap.get(ref) || null;
    },
  };

  const evaluation =
    evaluatePulseExperiment({
      experiment: running,
      observations,
      evidenceResolver,
    });

  assert.equal(
    evaluation.status,
    "ACCEPTED",
  );

  const candidate =
    createPulseExperimentLessonCandidate({
      experiment: running,
      evaluation,
    });

  assert.ok(candidate);

  const stopped =
    stopPulseExperiment(
      created.id,
      "Evaluation window closed.",
    );

  assert.ok(stopped);

  const completed =
    completePulseExperiment(
      created.id,
      "Variant A accepted.",
    );

  assert.ok(completed);

  return {
    experiment:
      completed,
    evaluation,
    candidate,
    evidenceResolver,
    evidenceMap,
  };
}

test(
  "GREEN: accepted completed experiment becomes OBSERVED learning memory",
  () => {
    reset();

    const fixture =
      createFixture();

    const result =
      rememberPulseExperimentLesson(
        fixture,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.memory.kind,
      "lesson",
    );

    assert.equal(
      result.memory.source,
      "learning",
    );

    assert.equal(
      result.memory.sourceType,
      "LEARNING",
    );

    assert.equal(
      result.memory.trust,
      "OBSERVED",
    );

    assert.equal(
      (
        result.memory.content as Record<
          string,
          unknown
        >
      ).contract,
      PULSE_CONTROLLED_LEARNING_CONTRACT,
    );
  },
);

test(
  "RED TEAM: STOPPED experiment cannot be ingested",
  () => {
    reset();

    const fixture =
      createFixture();

    const result =
      rememberPulseExperimentLesson({
        ...fixture,
        experiment: {
          ...fixture.experiment,
          status:
            "STOPPED",
          result:
            "stopped",
        },
      });

    assert.equal(
      result.ok,
      false,
    );
  },
);

test(
  "RED TEAM: non-ACCEPTED evaluation cannot be ingested",
  () => {
    reset();

    const fixture =
      createFixture();

    const result =
      rememberPulseExperimentLesson({
        ...fixture,
        evaluation: {
          ...fixture.evaluation,
          status:
            "REJECTED" as const,
          acceptedVariantId:
            null,
        } as PulseExperimentEvaluation,
      });

    assert.equal(
      result.ok,
      false,
    );
  },
);

test(
  "RED TEAM: fabricated evaluation evidence is blocked",
  () => {
    reset();

    const fixture =
      createFixture();

    const fabricatedEvidence =
      {
        ...fixture.evaluation,
        observations:
          fixture.evaluation.observations.map(
            function (observation) {
              return {
                ...observation,
                evidenceRefs:
                  ["invented-evidence"],
              };
            },
          ),
      } as PulseExperimentEvaluation;

    const legitimateCandidate =
      fixture.candidate;

    const result =
      rememberPulseExperimentLesson({
        ...fixture,
        evaluation:
          fabricatedEvidence,
        candidate:
          legitimateCandidate,
      });

    assert.equal(
      result.ok,
      false,
    );

    assert.equal(
      queryPulseMemory({
        tenantId:
          "tenant-learning",
        kind: "lesson",
      }).length,
      0,
    );
  },
);

test(
  "RED TEAM: candidate tampering is blocked",
  () => {
    reset();

    const fixture =
      createFixture();

    const tampered = {
      ...fixture.candidate,
      candidateFingerprint:
        "tampered",
    };

    const result =
      rememberPulseExperimentLesson({
        ...fixture,
        candidate:
          tampered,
      });

    assert.equal(
      result.ok,
      false,
    );

    assert.equal(
      queryPulseMemory({
        tenantId:
          "tenant-learning",
        kind: "lesson",
      }).length,
      0,
    );
  },
);

test(
  "RED TEAM: cross-tenant identity is blocked",
  () => {
    reset();

    const fixture =
      createFixture();

    const result =
      rememberPulseExperimentLesson({
        ...fixture,
        experiment: {
          ...fixture.experiment,
          tenantId:
            "tenant-attacker",
        },
      });

    assert.equal(
      result.ok,
      false,
    );
  },
);

test(
  "RED TEAM: experiment evidence cannot promote memory to VERIFIED",
  () => {
    reset();

    const fixture =
      createFixture();

    const result =
      rememberPulseExperimentLesson(
        fixture,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    assert.equal(
      result.memory.trust,
      "OBSERVED",
    );

    const promoted =
      verifyPulseMemory({
        id:
          result.memory.id,
        tenantId:
          "tenant-learning",
        evidenceRefs:
          fixture.candidate.evidenceRefs,
      });

    assert.equal(
      promoted,
      false,
    );

    assert.equal(
      queryPulseMemory({
        tenantId:
          "tenant-learning",
        kind: "lesson",
      })[0].trust,
      "OBSERVED",
    );
  },
);

test(
  "GREEN: repeated ingestion is idempotent",
  () => {
    reset();

    const fixture =
      createFixture();

    const first =
      rememberPulseExperimentLesson(
        fixture,
      );

    const second =
      rememberPulseExperimentLesson(
        fixture,
      );

    assert.equal(
      first.ok,
      true,
    );

    assert.equal(
      second.ok,
      true,
    );

    if (
      !first.ok ||
      !second.ok
    ) {
      return;
    }

    assert.equal(
      first.memory.id,
      second.memory.id,
    );

    const rows =
      queryPulseMemory({
        tenantId:
          "tenant-learning",
        kind: "lesson",
      });

    assert.equal(
      rows.length,
      1,
    );

    assert.equal(
      rows[0].trust,
      "OBSERVED",
    );
  },
);


test(
  "P1.0-G: OBSERVED learning never enters trusted Playbook",
  () => {
    reset();

    const fixture =
      createFixture();

    const result =
      rememberPulseExperimentLesson(
        fixture,
      );

    assert.equal(
      result.ok,
      true,
    );

    if (!result.ok) {
      return;
    }

    const observed =
      queryPulseMemory({
        tenantId:
          "tenant-learning",
        kind: "lesson",
        store:
          "LearningStore",
        status:
          "ACTIVE",
      });

    assert.equal(
      observed.length,
      1,
    );

    assert.equal(
      observed[0].source,
      "learning",
    );

    assert.equal(
      observed[0].sourceType,
      "LEARNING",
    );

    assert.equal(
      observed[0].trust,
      "OBSERVED",
    );

    const trusted =
      queryTrustedPulseMemory({
        tenantId:
          "tenant-learning",
        kind:
          "lesson",
        scope:
          "LearningStore",
        store:
          "LearningStore",
        minimumTrust:
          "VERIFIED",
      });

    assert.equal(
      trusted.length,
      0,
    );

    const playbook =
      compilePlaybook(
        "LearningStore",
        "tenant-learning",
      );

    assert.equal(
      playbook.ok,
      false,
    );

    assert.deepEqual(
      playbook.steps,
      [],
    );
  },
);
