import { hashProposal } from "./DigitalBoostPulseContracts";

import type { PulseExperiment } from "./DigitalBoostPulseExperiment";

/**
 * P1.0 Experiment Evaluation Boundary
 *
 * This module is a PURE evaluation layer.
 *
 * It MUST NOT:
 * - approve an action;
 * - authorize execution;
 * - create or issue execution proof;
 * - create execution attestations;
 * - mutate governance state;
 * - write learning memory.
 *
 * `evidenceResolver` is an integration boundary for a trusted,
 * canonical evidence adapter. The evaluator does not grant trust
 * or authority to the resolver; it only consumes the evidence
 * contract returned by that adapter and enforces tenant/experiment
 * binding.
 *
 * `ACCEPTED` means only "the declared experiment evidence evaluated
 * to a selected variant". It does NOT mean APPROVED, AUTHORIZED,
 * PROVEN, ASSURED or GOVERNED.
 */

export const PULSE_EXPERIMENT_EVALUATION_CONTRACT =
  "p1.0-experiment-evaluation-v1" as const;

export type PulseExperimentEvaluationStatus =
  | "ACCEPTED"
  | "REJECTED"
  | "INCONCLUSIVE"
  | "BLOCKED";

export type PulseExperimentObservation = {
  readonly variantId: string;
  readonly metric: string;
  readonly value: number | boolean;
  readonly observedAt: string;
  readonly evidenceRefs: readonly string[];
};

export type PulseExperimentEvidence = {
  readonly ref: string;
  readonly tenantId: string;
  readonly experimentId: string;
  readonly variantId: string;
  readonly metric: string;
  readonly value: number | boolean;
  readonly observedAt: string;
  readonly verified: boolean;
  readonly bindingHash: string;
};

export type PulseExperimentEvidenceResolver = {
  resolve(
    ref: string,
  ): PulseExperimentEvidence | null;
};

export type PulseExperimentEvaluation = {
  readonly contract: typeof PULSE_EXPERIMENT_EVALUATION_CONTRACT;
  readonly status: PulseExperimentEvaluationStatus;
  readonly experimentId: string;
  readonly tenantId: string | null;
  readonly metric: string;
  readonly observations: readonly PulseExperimentObservation[];
  readonly acceptedVariantId: string | null;
  readonly reason: string;
};

function numericValue(
  value: number | boolean,
): number {
  return typeof value === "boolean"
    ? value
      ? 1
      : 0
    : value;
}

function isFiniteObservationValue(
  value: number | boolean,
): boolean {
  return (
    typeof value === "boolean" ||
    Number.isFinite(value)
  );
}

export function createPulseExperimentEvidence(input: {
  ref: string;
  tenantId: string;
  experimentId: string;
  observation: PulseExperimentObservation;
  verified: boolean;
}): PulseExperimentEvidence {
  const base = {
    ref: input.ref,
    tenantId: input.tenantId,
    experimentId: input.experimentId,
    variantId: input.observation.variantId,
    metric: input.observation.metric,
    value: input.observation.value,
    observedAt: input.observation.observedAt,
    verified: input.verified,
  };

  return {
    ...base,
    bindingHash: hashProposal(base),
  };
}

export function verifyPulseExperimentEvidenceBinding(
  evidence: PulseExperimentEvidence,
): boolean {
  const {
    bindingHash,
    ...base
  } = evidence;

  return (
    !!evidence.ref.trim() &&
    !!evidence.experimentId.trim() &&
    !!evidence.variantId.trim() &&
    !!evidence.metric.trim() &&
    !!evidence.observedAt.trim() &&
    !!bindingHash.trim() &&
    hashProposal(base) === bindingHash
  );
}

function observationEvidenceValid(
  experiment: PulseExperiment,
  observation: PulseExperimentObservation,
  resolver: PulseExperimentEvidenceResolver,
): boolean {
  if (observation.evidenceRefs.length === 0) {
    return false;
  }

  const seen = new Set<string>();

  for (const ref of observation.evidenceRefs) {
    if (
      typeof ref !== "string" ||
      ref.trim().length === 0
    ) {
      return false;
    }

    if (seen.has(ref)) {
      continue;
    }

    seen.add(ref);

    const evidence = resolver.resolve(ref);

    if (!evidence) {
      return false;
    }

    if (
      !verifyPulseExperimentEvidenceBinding(
        evidence,
      )
    ) {
      return false;
    }

    if (
      evidence.verified !== true ||
      evidence.experimentId !== experiment.id ||
      evidence.tenantId !== (experiment.tenantId || "") ||
      evidence.variantId !== observation.variantId ||
      evidence.metric !== observation.metric ||
      evidence.value !== observation.value ||
      evidence.observedAt !== observation.observedAt
    ) {
      return false;
    }
  }

  return true;
}

export function evaluatePulseExperiment(input: {
  experiment: PulseExperiment;
  observations: readonly PulseExperimentObservation[];
  evidenceResolver: PulseExperimentEvidenceResolver;
}): PulseExperimentEvaluation {
  const experiment = input.experiment;
  const tenantId = experiment.tenantId || null;

  if (experiment.status !== "RUNNING") {
    return {
      contract:
        PULSE_EXPERIMENT_EVALUATION_CONTRACT,
      status: "BLOCKED",
      experimentId: experiment.id,
      tenantId,
      metric: experiment.hypothesis.metric,
      observations: input.observations,
      acceptedVariantId: null,
      reason: "EXPERIMENT_NOT_RUNNING",
    };
  }

  if (experiment.variants.length < 2) {
    return {
      contract:
        PULSE_EXPERIMENT_EVALUATION_CONTRACT,
      status: "INCONCLUSIVE",
      experimentId: experiment.id,
      tenantId,
      metric: experiment.hypothesis.metric,
      observations: input.observations,
      acceptedVariantId: null,
      reason: "INSUFFICIENT_VARIANTS",
    };
  }

  if (input.observations.length === 0) {
    return {
      contract:
        PULSE_EXPERIMENT_EVALUATION_CONTRACT,
      status: "BLOCKED",
      experimentId: experiment.id,
      tenantId,
      metric: experiment.hypothesis.metric,
      observations: input.observations,
      acceptedVariantId: null,
      reason: "NO_OBSERVATIONS",
    };
  }

  const declaredVariants = new Set(
    experiment.variants.map(
      (variant) => variant.id,
    ),
  );

  const rowsByVariant =
    new Map<
      string,
      PulseExperimentObservation[]
    >();

  for (const observation of input.observations) {
    if (
      observation.metric !==
      experiment.hypothesis.metric
    ) {
      return {
        contract:
          PULSE_EXPERIMENT_EVALUATION_CONTRACT,
        status: "BLOCKED",
        experimentId: experiment.id,
        tenantId,
        metric: experiment.hypothesis.metric,
        observations: input.observations,
        acceptedVariantId: null,
        reason: "UNDECLARED_METRIC",
      };
    }

    if (
      !declaredVariants.has(
        observation.variantId,
      )
    ) {
      return {
        contract:
          PULSE_EXPERIMENT_EVALUATION_CONTRACT,
        status: "BLOCKED",
        experimentId: experiment.id,
        tenantId,
        metric: experiment.hypothesis.metric,
        observations: input.observations,
        acceptedVariantId: null,
        reason: "UNKNOWN_VARIANT",
      };
    }

    if (
      !isFiniteObservationValue(
        observation.value,
      )
    ) {
      return {
        contract:
          PULSE_EXPERIMENT_EVALUATION_CONTRACT,
        status: "BLOCKED",
        experimentId: experiment.id,
        tenantId,
        metric: experiment.hypothesis.metric,
        observations: input.observations,
        acceptedVariantId: null,
        reason: "INVALID_OBSERVATION_VALUE",
      };
    }

    if (
      !observationEvidenceValid(
        experiment,
        observation,
        input.evidenceResolver,
      )
    ) {
      return {
        contract:
          PULSE_EXPERIMENT_EVALUATION_CONTRACT,
        status: "BLOCKED",
        experimentId: experiment.id,
        tenantId,
        metric: experiment.hypothesis.metric,
        observations: input.observations,
        acceptedVariantId: null,
        reason: "DURABLE_EVIDENCE_REQUIRED",
      };
    }

    const rows =
      rowsByVariant.get(
        observation.variantId,
      ) || [];

    rows.push(observation);
    rowsByVariant.set(
      observation.variantId,
      rows,
    );
  }

  for (const variant of experiment.variants) {
    if (
      !rowsByVariant.has(variant.id) ||
      rowsByVariant.get(variant.id)!.length === 0
    ) {
      return {
        contract:
          PULSE_EXPERIMENT_EVALUATION_CONTRACT,
        status: "INCONCLUSIVE",
        experimentId: experiment.id,
        tenantId,
        metric: experiment.hypothesis.metric,
        observations: input.observations,
        acceptedVariantId: null,
        reason: "MISSING_VARIANT_OBSERVATION",
      };
    }
  }

  const averages = experiment.variants.map(
    (variant) => {
      const rows =
        rowsByVariant.get(variant.id)!;

      const total = rows.reduce(
        (sum, row) =>
          sum + numericValue(row.value),
        0,
      );

      return {
        variantId: variant.id,
        average: total / rows.length,
      };
    },
  );

  const ordered = [...averages].sort(
    (a, b) =>
      experiment.hypothesis.direction === "up"
        ? b.average - a.average
        : a.average - b.average,
  );

  if (
    ordered.length < 2 ||
    ordered[0].average ===
      ordered[1].average
  ) {
    return {
      contract:
        PULSE_EXPERIMENT_EVALUATION_CONTRACT,
      status: "INCONCLUSIVE",
      experimentId: experiment.id,
      tenantId,
      metric: experiment.hypothesis.metric,
      observations: input.observations,
      acceptedVariantId: null,
      reason: "NO_SEPARATION",
    };
  }

  return {
    contract:
      PULSE_EXPERIMENT_EVALUATION_CONTRACT,
    status: "ACCEPTED",
    experimentId: experiment.id,
    tenantId,
    metric: experiment.hypothesis.metric,
    observations: input.observations,
    acceptedVariantId:
      ordered[0].variantId,
    reason: "VERIFIED_VARIANT_SEPARATION",
  };
}
