import {
  queryPulseMemory,
  rememberPulse,
  type PulseMemoryItem,
} from "./DigitalBoostPulseMemory";

import type {
  PulseExperiment,
} from "./DigitalBoostPulseExperiment";

import {
  evaluatePulseExperiment,
  type PulseExperimentEvaluation,
  type PulseExperimentEvidenceResolver,
} from "./DigitalBoostPulseExperimentEvaluation";

import {
  createPulseExperimentLessonCandidate,
  verifyPulseExperimentLessonCandidate,
  type PulseExperimentLessonCandidate,
} from "./DigitalBoostPulseExperimentLearning";

export const PULSE_CONTROLLED_LEARNING_CONTRACT =
  "p1.0-controlled-learning-v1" as const;

export type PulseControlledLearningResult =
  | {
      ok: true;
      memory: PulseMemoryItem;
    }
  | {
      ok: false;
      reason: string;
    };

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function sameEvaluationIdentity(
  actual: PulseExperimentEvaluation,
  expected: PulseExperimentEvaluation,
): boolean {
  const canonicalize = (
    evaluation: PulseExperimentEvaluation,
  ) => ({
    contract:
      evaluation.contract,
    status:
      evaluation.status,
    experimentId:
      evaluation.experimentId,
    tenantId:
      evaluation.tenantId,
    metric:
      evaluation.metric,
    acceptedVariantId:
      evaluation.acceptedVariantId,
    reason:
      evaluation.reason,
    observations:
      evaluation.observations.map(
        function (observation) {
          return {
            variantId:
              observation.variantId,
            metric:
              observation.metric,
            value:
              observation.value,
            observedAt:
              observation.observedAt,
            evidenceRefs:
              [...observation.evidenceRefs]
                .map(function (ref) {
                  return ref.trim();
                })
                .filter(Boolean)
                .sort(),
          };
        },
      ),
  });

  return (
    JSON.stringify(
      canonicalize(actual),
    ) ===
    JSON.stringify(
      canonicalize(expected),
    )
  );
}

function sameCandidateIdentity(
  candidate: PulseExperimentLessonCandidate,
  expected: PulseExperimentLessonCandidate,
): boolean {
  return (
    candidate.candidateId ===
      expected.candidateId &&
    candidate.candidateFingerprint ===
      expected.candidateFingerprint &&
    candidate.evaluationFingerprint ===
      expected.evaluationFingerprint
  );
}

export function rememberPulseExperimentLesson(
  input: {
    experiment: PulseExperiment;
    evaluation: PulseExperimentEvaluation;
    candidate: PulseExperimentLessonCandidate;
    evidenceResolver: PulseExperimentEvidenceResolver;
  },
): PulseControlledLearningResult {
  const experiment = input.experiment;
  const evaluation = input.evaluation;
  const candidate = input.candidate;

  if (experiment.status !== "COMPLETED") {
    return {
      ok: false,
      reason: "EXPERIMENT_NOT_COMPLETED",
    };
  }

  if (!normalizeText(experiment.result)) {
    return {
      ok: false,
      reason: "COMPLETED_EXPERIMENT_REQUIRES_RESULT",
    };
  }

  const tenantId =
    normalizeText(experiment.tenantId);

  if (!tenantId) {
    return {
      ok: false,
      reason: "EXPLICIT_TENANT_REQUIRED",
    };
  }

  if (
    evaluation.contract !==
    "p1.0-experiment-evaluation-v1"
  ) {
    return {
      ok: false,
      reason: "INVALID_EVALUATION_CONTRACT",
    };
  }

  if (evaluation.status !== "ACCEPTED") {
    return {
      ok: false,
      reason: "EVALUATION_NOT_ACCEPTED",
    };
  }

  if (evaluation.tenantId !== tenantId) {
    return {
      ok: false,
      reason: "EVALUATION_TENANT_MISMATCH",
    };
  }

  if (evaluation.experimentId !== experiment.id) {
    return {
      ok: false,
      reason: "EVALUATION_EXPERIMENT_MISMATCH",
    };
  }

  if (
    !verifyPulseExperimentLessonCandidate(
      candidate,
    )
  ) {
    return {
      ok: false,
      reason: "CANDIDATE_VERIFICATION_FAILED",
    };
  }

  if (
    candidate.tenantId !== tenantId ||
    candidate.experimentId !== experiment.id
  ) {
    return {
      ok: false,
      reason: "CANDIDATE_IDENTITY_MISMATCH",
    };
  }

  if (
    candidate.authority !== "NONE" ||
    candidate.trust !== "UNTRUSTED" ||
    candidate.canGrantApproval ||
    candidate.canSupportExecution ||
    candidate.canPromoteMemory
  ) {
    return {
      ok: false,
      reason: "CANDIDATE_AUTHORITY_BOUNDARY_VIOLATION",
    };
  }

  if (candidate.evidenceRefs.length === 0) {
    return {
      ok: false,
      reason: "CANDIDATE_REQUIRES_EVIDENCE",
    };
  }

  /*
   * Evaluation is not trusted merely because the caller supplies
   * an ACCEPTED object. Re-evaluate the candidate observations
   * against the canonical evidence resolver.
   */
  const evaluationExperiment = {
    ...experiment,
    status: "RUNNING" as const,
  };

  const canonicalEvaluation =
    evaluatePulseExperiment({
      experiment:
        evaluationExperiment,
      observations:
        candidate.observations,
      evidenceResolver:
        input.evidenceResolver,
    });

  if (
    canonicalEvaluation.status !==
    "ACCEPTED"
  ) {
    return {
      ok: false,
      reason:
        "CANONICAL_EVALUATION_NOT_ACCEPTED",
    };
  }

  if (
    canonicalEvaluation.experimentId !==
      experiment.id ||
    canonicalEvaluation.tenantId !==
      tenantId ||
    canonicalEvaluation.metric !==
      experiment.hypothesis.metric
  ) {
    return {
      ok: false,
      reason:
        "CANONICAL_EVALUATION_IDENTITY_MISMATCH",
    };
  }

  /*
   * The caller-supplied evaluation itself must reconcile with
   * the canonical evaluation. A valid candidate cannot be paired
   * with an unrelated or fabricated ACCEPTED evaluation.
   */
  if (
    !sameEvaluationIdentity(
      evaluation,
      canonicalEvaluation,
    )
  ) {
    return {
      ok: false,
      reason:
        "EVALUATION_RECONCILIATION_FAILED",
    };
  }

  /*
   * The received candidate must exactly reconcile with what the
   * canonical evaluation would generate.
   */
  const expectedCandidate =
    createPulseExperimentLessonCandidate({
      experiment:
        evaluationExperiment,
      evaluation:
        canonicalEvaluation,
    });

  if (
    !expectedCandidate ||
    !sameCandidateIdentity(
      candidate,
      expectedCandidate,
    )
  ) {
    return {
      ok: false,
      reason:
        "CANDIDATE_IDENTITY_RECONCILIATION_FAILED",
    };
  }

  const existing =
    queryPulseMemory({
      kind: "lesson",
      tenantId,
      store: experiment.store,
      status: "ACTIVE",
    }).find(function (row) {
      if (
        row.source !== "learning" ||
        row.sourceType !== "LEARNING" ||
        !row.content ||
        typeof row.content !== "object"
      ) {
        return false;
      }

      return (
        (
          row.content as Record<
            string,
            unknown
          >
        ).candidateFingerprint ===
        candidate.candidateFingerprint
      );
    });

  if (existing) {
    return {
      ok: true,
      memory: existing,
    };
  }

  const memory =
    rememberPulse({
      kind: "lesson",
      scope: experiment.store,
      tenantId,
      store: experiment.store,
      source: "learning",
      evidenceRefs:
        candidate.evidenceRefs,
      content: {
        type: "experiment-lesson",
        contract:
          PULSE_CONTROLLED_LEARNING_CONTRACT,
        experimentId:
          experiment.id,
        evaluationFingerprint:
          expectedCandidate.evaluationFingerprint,
        candidateId:
          candidate.candidateId,
        candidateFingerprint:
          candidate.candidateFingerprint,
        metric:
          candidate.metric,
        direction:
          candidate.direction,
        acceptedVariantId:
          candidate.acceptedVariantId,
        acceptedVariantLabel:
          candidate.acceptedVariantLabel,
        hypothesis:
          candidate.hypothesis,
        candidateStatement:
          candidate.candidateStatement,
        observationCount:
          candidate.observationCount,
      },
    });

  if (!memory) {
    return {
      ok: false,
      reason: "MEMORY_INGESTION_FAILED",
    };
  }

  /*
   * P1.0-F may only create OBSERVED learning memory.
   * VERIFIED/GOVERNED remain owned by existing Memory boundaries.
   */
  if (
    memory.trust !== "OBSERVED" ||
    memory.source !== "learning" ||
    memory.sourceType !== "LEARNING"
  ) {
    return {
      ok: false,
      reason: "UNEXPECTED_MEMORY_TRUST_STATE",
    };
  }

  return {
    ok: true,
    memory,
  };
}
