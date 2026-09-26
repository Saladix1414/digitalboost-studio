import {
  hashProposal,
} from "./DigitalBoostPulseContracts";

import type {
  PulseExperiment,
} from "./DigitalBoostPulseExperiment";

import type {
  PulseExperimentEvaluation,
  PulseExperimentObservation,
} from "./DigitalBoostPulseExperimentEvaluation";

export const PULSE_EXPERIMENT_LEARNING_CONTRACT =
  "p1.0-experiment-learning-v1" as const;

export type PulseExperimentLessonCandidateStatus =
  "CANDIDATE";

export type PulseExperimentLessonCandidate = {
  readonly contract:
    typeof PULSE_EXPERIMENT_LEARNING_CONTRACT;

  readonly status:
    PulseExperimentLessonCandidateStatus;

  /*
   * Explicit non-authoritative boundary.
   */
  readonly authority:
    "NONE";

  readonly trust:
    "UNTRUSTED";

  readonly canGrantApproval:
    false;

  readonly canSupportExecution:
    false;

  readonly canPromoteMemory:
    false;

  readonly verificationState:
    "REQUIRES_DURABLE_VERIFICATION";

  readonly candidateId:
    string;

  readonly candidateFingerprint:
    string;

  readonly evaluationFingerprint:
    string;

  readonly tenantId:
    string;

  readonly experimentId:
    string;

  readonly metric:
    string;

  readonly direction:
    "up" | "down";

  readonly acceptedVariantId:
    string;

  readonly acceptedVariantLabel:
    string;

  readonly hypothesis:
    string;

  readonly observationCount:
    number;

  readonly observations:
    readonly PulseExperimentObservation[];

  readonly evidenceRefs:
    readonly string[];

  readonly candidateStatement:
    string;
};

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function uniqueSorted(
  values: readonly string[],
): string[] {
  return [
    ...new Set(
      values
        .map(normalizeText)
        .filter(Boolean),
    ),
  ].sort();
}

function canonicalObservation(
  observation: PulseExperimentObservation,
) {
  return {
    variantId: observation.variantId,
    metric: observation.metric,
    value: observation.value,
    observedAt: observation.observedAt,
    evidenceRefs: uniqueSorted(
      observation.evidenceRefs,
    ),
  };
}

function evaluationFingerprint(
  evaluation: PulseExperimentEvaluation,
): string {
  return hashProposal({
    contract: evaluation.contract,
    status: evaluation.status,
    experimentId: evaluation.experimentId,
    tenantId: evaluation.tenantId,
    metric: evaluation.metric,
    acceptedVariantId:
      evaluation.acceptedVariantId,
    reason: evaluation.reason,
    observations:
      evaluation.observations.map(
        canonicalObservation,
      ),
  });
}

function candidateCanonical(
  candidate: Omit<
    PulseExperimentLessonCandidate,
    "candidateFingerprint"
  >,
) {
  return {
    contract:
      candidate.contract,

    status:
      candidate.status,

    authority:
      candidate.authority,

    trust:
      candidate.trust,

    canGrantApproval:
      candidate.canGrantApproval,

    canSupportExecution:
      candidate.canSupportExecution,

    canPromoteMemory:
      candidate.canPromoteMemory,

    verificationState:
      candidate.verificationState,

    candidateId:
      candidate.candidateId,

    evaluationFingerprint:
      candidate.evaluationFingerprint,

    tenantId:
      candidate.tenantId,

    experimentId:
      candidate.experimentId,

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

    observationCount:
      candidate.observationCount,

    observations:
      candidate.observations.map(
        canonicalObservation,
      ),

    evidenceRefs:
      uniqueSorted(
        candidate.evidenceRefs,
      ),

    candidateStatement:
      candidate.candidateStatement,
  };
}

function validateEvaluationForCandidate(input: {
  experiment: PulseExperiment;
  evaluation: PulseExperimentEvaluation;
}): boolean {
  const {
    experiment,
    evaluation,
  } = input;

  /*
   * P1.0-C requires an explicit tenant boundary.
   * Legacy scope is intentionally not promotable into
   * experimental learning candidates.
   */
  const tenantId =
    normalizeText(
      experiment.tenantId,
    );

  if (!tenantId) {
    return false;
  }

  if (
    evaluation.contract !==
    "p1.0-experiment-evaluation-v1"
  ) {
    return false;
  }

  if (
    evaluation.status !==
    "ACCEPTED"
  ) {
    return false;
  }

  if (
    evaluation.experimentId !==
    experiment.id
  ) {
    return false;
  }

  if (
    evaluation.tenantId !==
    tenantId
  ) {
    return false;
  }

  if (
    evaluation.metric !==
    experiment.hypothesis.metric
  ) {
    return false;
  }

  const acceptedVariantId =
    normalizeText(
      evaluation.acceptedVariantId,
    );

  if (!acceptedVariantId) {
    return false;
  }

  const acceptedVariant =
    experiment.variants.find(
      (variant) =>
        variant.id ===
        acceptedVariantId,
    );

  if (!acceptedVariant) {
    return false;
  }

  if (
    !Array.isArray(
      evaluation.observations,
    ) ||
    evaluation.observations.length === 0
  ) {
    return false;
  }

  const declaredVariants =
    new Set(
      experiment.variants.map(
        (variant) =>
          variant.id,
      ),
    );

  const observedVariants =
    new Set<string>();

  for (
    const observation
    of evaluation.observations
  ) {
    if (
      !declaredVariants.has(
        observation.variantId,
      )
    ) {
      return false;
    }

    if (
      observation.metric !==
      experiment.hypothesis.metric
    ) {
      return false;
    }

    if (
      typeof observation.value !==
        "boolean" &&
      !Number.isFinite(
        observation.value,
      )
    ) {
      return false;
    }

    if (
      typeof observation.observedAt !==
      "string" ||
      !Number.isFinite(
        Date.parse(
          observation.observedAt,
        ),
      )
    ) {
      return false;
    }

    if (
      !Array.isArray(
        observation.evidenceRefs,
      ) ||
      observation.evidenceRefs.length ===
        0
    ) {
      return false;
    }

    const refs =
      uniqueSorted(
        observation.evidenceRefs,
      );

    if (
      refs.length === 0
    ) {
      return false;
    }

    observedVariants.add(
      observation.variantId,
    );
  }

  /*
   * An accepted evaluation must cover every declared variant
   * before it can become a lesson candidate.
   */
  for (
    const variant
    of experiment.variants
  ) {
    if (
      !observedVariants.has(
        variant.id,
      )
    ) {
      return false;
    }
  }

  return true;
}

export function createPulseExperimentLessonCandidate(
  input: {
    experiment: PulseExperiment;
    evaluation: PulseExperimentEvaluation;
  },
): PulseExperimentLessonCandidate | null {
  if (
    !validateEvaluationForCandidate(
      input,
    )
  ) {
    return null;
  }

  const experiment =
    input.experiment;

  const evaluation =
    input.evaluation;

  const tenantId =
    normalizeText(
      experiment.tenantId,
    );

  const acceptedVariantId =
    evaluation.acceptedVariantId!;

  const acceptedVariant =
    experiment.variants.find(
      (variant) =>
        variant.id ===
        acceptedVariantId,
    )!;

  const normalizedObservations =
    evaluation.observations.map(
      canonicalObservation,
    );

  const evidenceRefs =
    uniqueSorted(
      normalizedObservations.flatMap(
        (observation) =>
          observation.evidenceRefs,
      ),
    );

  const evaluationHash =
    evaluationFingerprint(
      evaluation,
    );

  const provisional = {
    contract:
      PULSE_EXPERIMENT_LEARNING_CONTRACT,

    status:
      "CANDIDATE" as const,

    authority:
      "NONE" as const,

    trust:
      "UNTRUSTED" as const,

    canGrantApproval:
      false as const,

    canSupportExecution:
      false as const,

    canPromoteMemory:
      false as const,

    verificationState:
      "REQUIRES_DURABLE_VERIFICATION" as const,

    candidateId:
      "lesson_candidate_" +
      hashProposal({
        contract:
          PULSE_EXPERIMENT_LEARNING_CONTRACT,

        tenantId,

        experimentId:
          experiment.id,

        evaluationFingerprint:
          evaluationHash,

        acceptedVariantId,

        evidenceRefs,
      }),

    evaluationFingerprint:
      evaluationHash,

    tenantId,

    experimentId:
      experiment.id,

    metric:
      experiment.hypothesis.metric,

    direction:
      experiment.hypothesis.direction,

    acceptedVariantId,

    acceptedVariantLabel:
      acceptedVariant.label,

    hypothesis:
      experiment.hypothesis.statement,

    observationCount:
      normalizedObservations.length,

    observations:
      normalizedObservations,

    evidenceRefs,

    candidateStatement:
      `Candidate lesson only: evaluation selected variant "${acceptedVariant.label}" for metric "${experiment.hypothesis.metric}". Durable verification is required before any memory trust or learning consumption.`,
  };

  return {
    ...provisional,

    candidateFingerprint:
      hashProposal(
        candidateCanonical(
          provisional,
        ),
      ),
  };
}

export function verifyPulseExperimentLessonCandidate(
  candidate:
    PulseExperimentLessonCandidate,
): boolean {
  try {
    if (
      candidate.contract !==
      PULSE_EXPERIMENT_LEARNING_CONTRACT
    ) {
      return false;
    }

    if (
      candidate.status !==
      "CANDIDATE"
    ) {
      return false;
    }

    if (
      candidate.authority !==
      "NONE"
    ) {
      return false;
    }

    if (
      candidate.trust !==
      "UNTRUSTED"
    ) {
      return false;
    }

    if (
      candidate.canGrantApproval !==
        false ||
      candidate.canSupportExecution !==
        false ||
      candidate.canPromoteMemory !==
        false
    ) {
      return false;
    }

    if (
      candidate.verificationState !==
      "REQUIRES_DURABLE_VERIFICATION"
    ) {
      return false;
    }

    if (
      !normalizeText(
        candidate.tenantId,
      ) ||
      !normalizeText(
        candidate.experimentId,
      ) ||
      !normalizeText(
        candidate.metric,
      ) ||
      !normalizeText(
        candidate.acceptedVariantId,
      ) ||
      !normalizeText(
        candidate.candidateId,
      ) ||
      !normalizeText(
        candidate.evaluationFingerprint,
      ) ||
      !normalizeText(
        candidate.candidateFingerprint,
      )
    ) {
      return false;
    }

    if (
      candidate.observationCount !==
      candidate.observations.length
    ) {
      return false;
    }

    if (
      candidate.evidenceRefs.length ===
      0
    ) {
      return false;
    }

    const forbiddenKeys = [
      "approval",
      "proof",
      "proofHash",
      "attestation",
      "execution",
      "governance",
    ];

    const candidateRecord =
      candidate as unknown as Record<
        string,
        unknown
      >;

    if (
      forbiddenKeys.some(
        (key) =>
          Object.prototype.hasOwnProperty.call(
            candidateRecord,
            key,
          ),
      )
    ) {
      return false;
    }

    const {
      candidateFingerprint,
      ...base
    } = candidate;

    return (
      hashProposal(
        candidateCanonical(
          base,
        ),
      ) ===
      candidateFingerprint
    );
  } catch {
    return false;
  }
}
