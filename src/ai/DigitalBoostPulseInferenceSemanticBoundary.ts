import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

import {
  verifyPulseInferenceEvidenceObservation,
  type PulseInferenceEvidenceObservation,
} from "./DigitalBoostPulseInferenceEvidenceConsumer";

export const PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT =
  "p0.7.2.8" as const;

export const PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE =
  "pulse-inference-semantic-boundary" as const;

export type PulseInferenceSemanticCandidateKind =
  | "INTENT_CANDIDATE"
  | "GOAL_CANDIDATE"
  | "FACT_HYPOTHESIS";

export type PulseInferenceSemanticObservationRole =
  "HYPOTHESIS";

export type PulseInferenceSemanticObservationStatus =
  "CANDIDATE";

export type PulseInferenceSemanticCandidateInput = {
  kind:
    PulseInferenceSemanticCandidateKind;

  label:
    string;

  value:
    string;

  confidence:
    number;
};

export type PulseInferenceSemanticContextBinding = {
  tenantId:
    string;

  contextId:
    string;

  contextVersion:
    string;

  store?:
    string;

  section?:
    string;
};

export type PulseInferenceSemanticObservation = {
  contract:
    typeof PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT;

  semanticObservationId:
    string;

  tenantId:
    string;

  contextId:
    string;

  contextVersion:
    string;

  store?:
    string;

  section?:
    string;

  sourceObservationId:
    string;

  sourceObservationHash:
    string;

  requestId:
    string;

  selectionModelRef:
    string;

  expectedRuntimeModelRef:
    string;

  runtimeModelRef?:
    string;

  provider:
    string;

  sourceStatus:
    "COMPLETED";

  sourceBindingStatus:
    "MATCH";

  sourceOutputHash:
    string;

  role:
    PulseInferenceSemanticObservationRole;

  status:
    PulseInferenceSemanticObservationStatus;

  candidate:
    PulseInferenceSemanticCandidateInput & {
      candidateHash:
        string;
    };

  authority:
    "NONE";

  canSupportSemanticClaim:
    false;

  canSupportExecution:
    false;

  source:
    typeof PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE;

  observedAt:
    string;

  semanticObservationHash:
    string;
};

function normalizeText(
  value: unknown,
  code: string,
): string {
  if (
    typeof value !== "string"
  ) {
    throw new Error(code);
  }

  const normalized =
    value.trim();

  if (
    normalized === "" ||
    normalized.includes("\u0000")
  ) {
    throw new Error(code);
  }

  return normalized;
}

function assertTenant(
  tenantId: string,
): void {
  if (
    tenantId === "*" ||
    tenantId === "global"
  ) {
    throw new Error(
      "INVALID_SEMANTIC_CONTEXT_TENANT",
    );
  }
}

function assertContextBinding(
  binding:
    PulseInferenceSemanticContextBinding,
  observation:
    PulseInferenceEvidenceObservation,
): {
  tenantId: string;
  contextId: string;
  contextVersion: string;
  store?: string;
  section?: string;
} {
  const tenantId =
    normalizeText(
      binding.tenantId,
      "INVALID_SEMANTIC_CONTEXT_TENANT",
    );

  assertTenant(
    tenantId,
  );

  if (
    tenantId !==
    observation.tenantId
  ) {
    throw new Error(
      "SEMANTIC_CONTEXT_TENANT_MISMATCH",
    );
  }

  const contextId =
    normalizeText(
      binding.contextId,
      "INVALID_SEMANTIC_CONTEXT_ID",
    );

  const contextVersion =
    normalizeText(
      binding.contextVersion,
      "INVALID_SEMANTIC_CONTEXT_VERSION",
    );

  const store =
    binding.store === undefined
      ? undefined
      : normalizeText(
          binding.store,
          "INVALID_SEMANTIC_CONTEXT_STORE",
        );

  const section =
    binding.section === undefined
      ? undefined
      : normalizeText(
          binding.section,
          "INVALID_SEMANTIC_CONTEXT_SECTION",
        );

  return {
    tenantId,
    contextId,
    contextVersion,
    store,
    section,
  };
}

function assertCandidate(
  candidate:
    PulseInferenceSemanticCandidateInput,
): PulseInferenceSemanticCandidateInput {
  const label =
    normalizeText(
      candidate.label,
      "INVALID_SEMANTIC_CANDIDATE_LABEL",
    );

  if (
    label.length > 160
  ) {
    throw new Error(
      "SEMANTIC_CANDIDATE_LABEL_TOO_LARGE",
    );
  }

  const value =
    normalizeText(
      candidate.value,
      "INVALID_SEMANTIC_CANDIDATE_VALUE",
    );

  if (
    value.length > 2048
  ) {
    throw new Error(
      "SEMANTIC_CANDIDATE_VALUE_TOO_LARGE",
    );
  }

  if (
    typeof candidate.kind !==
      "string" ||
    (
      candidate.kind !==
        "INTENT_CANDIDATE" &&
      candidate.kind !==
        "GOAL_CANDIDATE" &&
      candidate.kind !==
        "FACT_HYPOTHESIS"
    )
  ) {
    throw new Error(
      "INVALID_SEMANTIC_CANDIDATE_KIND",
    );
  }

  if (
    !Number.isFinite(
      candidate.confidence,
    ) ||
    candidate.confidence < 0 ||
    candidate.confidence > 1
  ) {
    throw new Error(
      "INVALID_SEMANTIC_CANDIDATE_CONFIDENCE",
    );
  }

  return {
    kind:
      candidate.kind,

    label,

    value,

    confidence:
      candidate.confidence,
  };
}

function calculateCandidateHash(
  input: {
    tenantId:
      string;

    contextId:
      string;

    contextVersion:
      string;

    sourceObservationId:
      string;

    sourceObservationHash:
      string;

    candidate:
      PulseInferenceSemanticCandidateInput;
  },
): string {
  return hashProposal({
    contract:
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT,

    tenantId:
      input.tenantId,

    contextId:
      input.contextId,

    contextVersion:
      input.contextVersion,

    sourceObservationId:
      input.sourceObservationId,

    sourceObservationHash:
      input.sourceObservationHash,

    candidate: {
      kind:
        input.candidate.kind,

      label:
        input.candidate.label,

      value:
        input.candidate.value,

      confidence:
        input.candidate.confidence,
    },
  });
}

function calculateSemanticObservationId(
  input: {
    tenantId:
      string;

    contextId:
      string;

    contextVersion:
      string;

    sourceObservationId:
      string;

    sourceObservationHash:
      string;

    candidateHash:
      string;
  },
): string {
  return (
    "piso_" +
    hashProposal({
      tenantId:
        input.tenantId,

      contextId:
        input.contextId,

      contextVersion:
        input.contextVersion,

      sourceObservationId:
        input.sourceObservationId,

      sourceObservationHash:
        input.sourceObservationHash,

      candidateHash:
        input.candidateHash,
    })
  );
}

function semanticObservationHashBase(
  observation:
    Omit<
      PulseInferenceSemanticObservation,
      "semanticObservationHash"
    >,
): Omit<
  PulseInferenceSemanticObservation,
  "semanticObservationHash"
> {
  return observation;
}

function calculateSemanticObservationHash(
  observation:
    Omit<
      PulseInferenceSemanticObservation,
      "semanticObservationHash"
    >,
): string {
  return hashProposal(
    semanticObservationHashBase(
      observation,
    ),
  );
}

/**
 * P0.7.2.8-A
 *
 * Converts a validated inference observation into an
 * explicitly untrusted semantic hypothesis.
 *
 * This boundary:
 * - requires durable observation verification;
 * - requires COMPLETED + MATCH + outputPresent evidence;
 * - requires explicit tenant/context binding;
 * - carries only a semantic candidate, never raw model output;
 * - never creates semantic truth;
 * - never grants execution authority;
 * - never creates approvals;
 * - never creates memory trust;
 * - never mutates Intent/Goal/Planning.
 *
 * Important:
 * The candidate is still a hypothesis. Its presence here is
 * NOT proof that the candidate is correct.
 */
export function projectPulseInferenceSemanticObservation(
  input: {
    observation:
      PulseInferenceEvidenceObservation;

    context:
      PulseInferenceSemanticContextBinding;

    candidate:
      PulseInferenceSemanticCandidateInput;
  },
): PulseInferenceSemanticObservation {
  const observation =
    input.observation;

  if (
    !verifyPulseInferenceEvidenceObservation(
      observation,
    )
  ) {
    throw new Error(
      "INVALID_SOURCE_INFERENCE_OBSERVATION",
    );
  }

  if (
    observation.decision !==
    "ALLOW_OBSERVATION"
  ) {
    throw new Error(
      "SEMANTIC_SOURCE_NOT_ALLOWED",
    );
  }

  if (
    observation.status !==
      "COMPLETED" ||
    observation.bindingStatus !==
      "MATCH" ||
    !observation.outputPresent ||
    !observation.outputHash
  ) {
    throw new Error(
      "SEMANTIC_SOURCE_NOT_COMPLETED",
    );
  }

  if (
    observation.purpose ===
    "MEMORY"
  ) {
    throw new Error(
      "SEMANTIC_MEMORY_SOURCE_NOT_ALLOWED",
    );
  }

  const context =
    assertContextBinding(
      input.context,
      observation,
    );

  const candidate =
    assertCandidate(
      input.candidate,
    );

  const candidateHash =
    calculateCandidateHash({
      tenantId:
        context.tenantId,

      contextId:
        context.contextId,

      contextVersion:
        context.contextVersion,

      sourceObservationId:
        observation.observationId,

      sourceObservationHash:
        observation.observationHash,

      candidate,
    });

  const semanticObservationId =
    calculateSemanticObservationId({
      tenantId:
        context.tenantId,

      contextId:
        context.contextId,

      contextVersion:
        context.contextVersion,

      sourceObservationId:
        observation.observationId,

      sourceObservationHash:
        observation.observationHash,

      candidateHash,
    });

  const provisional:
    Omit<
      PulseInferenceSemanticObservation,
      "semanticObservationHash"
    > = {
    contract:
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT,

    semanticObservationId,

    tenantId:
      context.tenantId,

    contextId:
      context.contextId,

    contextVersion:
      context.contextVersion,

    store:
      context.store,

    section:
      context.section,

    sourceObservationId:
      observation.observationId,

    sourceObservationHash:
      observation.observationHash,

    requestId:
      observation.requestId,

    selectionModelRef:
      observation.selectionModelRef,

    expectedRuntimeModelRef:
      observation.expectedRuntimeModelRef,

    runtimeModelRef:
      observation.runtimeModelRef,

    provider:
      observation.provider,

    sourceStatus:
      observation.status,

    sourceBindingStatus:
      observation.bindingStatus,

    sourceOutputHash:
      observation.outputHash,

    role:
      "HYPOTHESIS",

    status:
      "CANDIDATE",

    candidate: {
      ...candidate,
      candidateHash,
    },

    authority:
      "NONE",

    canSupportSemanticClaim:
      false,

    canSupportExecution:
      false,

    source:
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE,

    observedAt:
      observation.observedAt,
  };

  return {
    ...provisional,

    semanticObservationHash:
      calculateSemanticObservationHash(
        provisional,
      ),
  };
}

export function verifyPulseInferenceSemanticObservation(
  observation:
    PulseInferenceSemanticObservation,
): boolean {
  try {
    if (
      observation.contract !==
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_CONTRACT
    ) {
      return false;
    }

    if (
      observation.role !==
      "HYPOTHESIS" ||
      observation.status !==
      "CANDIDATE"
    ) {
      return false;
    }

    if (
      observation.authority !==
      "NONE" ||
      observation.canSupportSemanticClaim !==
        false ||
      observation.canSupportExecution !==
        false
    ) {
      return false;
    }

    if (
      observation.source !==
      PULSE_INFERENCE_SEMANTIC_BOUNDARY_SOURCE
    ) {
      return false;
    }

    const tenantId =
      normalizeText(
        observation.tenantId,
        "INVALID",
      );

    assertTenant(
      tenantId,
    );

    const contextId =
      normalizeText(
        observation.contextId,
        "INVALID",
      );

    const contextVersion =
      normalizeText(
        observation.contextVersion,
        "INVALID",
      );

    const sourceObservationId =
      normalizeText(
        observation.sourceObservationId,
        "INVALID",
      );

    const sourceObservationHash =
      normalizeText(
        observation.sourceObservationHash,
        "INVALID",
      );

    const candidate = {
      kind:
        observation.candidate.kind,

      label:
        normalizeText(
          observation.candidate.label,
          "INVALID",
        ),

      value:
        normalizeText(
          observation.candidate.value,
          "INVALID",
        ),

      confidence:
        observation.candidate.confidence,
    };

    const expectedCandidateHash =
      calculateCandidateHash({
        tenantId,
        contextId,
        contextVersion,
        sourceObservationId,
        sourceObservationHash,
        candidate,
      });

    if (
      observation.candidate.candidateHash !==
      expectedCandidateHash
    ) {
      return false;
    }

    const expectedSemanticObservationId =
      calculateSemanticObservationId({
        tenantId,
        contextId,
        contextVersion,
        sourceObservationId,
        sourceObservationHash,
        candidateHash:
          expectedCandidateHash,
      });

    if (
      observation.semanticObservationId !==
      expectedSemanticObservationId
    ) {
      return false;
    }

    const {
      semanticObservationHash,
      ...base
    } = observation;

    return (
      calculateSemanticObservationHash(
        base,
      ) ===
      semanticObservationHash
    );
  } catch {
    return false;
  }
}

export function fingerprintPulseInferenceSemanticCandidate(
  input: {
    tenantId: string;
    contextId: string;
    contextVersion: string;
    sourceObservationId: string;
    sourceObservationHash: string;
    candidate:
      PulseInferenceSemanticCandidateInput;
  },
): string {
  const candidate =
    assertCandidate(
      input.candidate,
    );

  return calculateCandidateHash({
    tenantId:
      normalizeText(
        input.tenantId,
        "INVALID_SEMANTIC_CONTEXT_TENANT",
      ),

    contextId:
      normalizeText(
        input.contextId,
        "INVALID_SEMANTIC_CONTEXT_ID",
      ),

    contextVersion:
      normalizeText(
        input.contextVersion,
        "INVALID_SEMANTIC_CONTEXT_VERSION",
      ),

    sourceObservationId:
      normalizeText(
        input.sourceObservationId,
        "INVALID_SOURCE_OBSERVATION_ID",
      ),

    sourceObservationHash:
      normalizeText(
        input.sourceObservationHash,
        "INVALID_SOURCE_OBSERVATION_HASH",
      ),

    candidate,
  });
}
