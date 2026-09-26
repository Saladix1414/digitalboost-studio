import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

import {
  PULSE_INTENT_LABELS,
  type PulseIntentClassification,
  type PulseIntentLabel,
} from "../DigitalBoostPulseIntentEngine";

import {
  verifyPulseInferenceSemanticObservation,
  type PulseInferenceSemanticObservation,
} from "./DigitalBoostPulseInferenceSemanticBoundary";

export const PULSE_INTENT_RECONCILIATION_CONTRACT =
  "p0.7.2.8-b" as const;

export const PULSE_INTENT_RECONCILIATION_SOURCE =
  "pulse-intent-reconciliation" as const;

export type PulseIntentReconciliationRelation =
  | "AGREEMENT"
  | "SUPPLEMENT"
  | "CONFLICT"
  | "INSUFFICIENT_EVIDENCE";

export type PulseIntentReconciliationAuthority =
  "RULE_ENGINE";

export type PulseIntentReconciliationResult = {
  contract:
    typeof PULSE_INTENT_RECONCILIATION_CONTRACT;

  reconciliationId:
    string;

  tenantId:
    string;

  contextId:
    string;

  contextVersion:
    string;

  ruleIntent: {
    primary:
      PulseIntentLabel;

    secondary:
      PulseIntentLabel[];

    confidence:
      number;

    confidenceBand:
      PulseIntentClassification["confidenceBand"];

    decision:
      PulseIntentClassification["decision"];

    clarificationRequired:
      boolean;

    multiIntent:
      boolean;
  };

  aiCandidate?: {
    label:
      PulseIntentLabel;

    confidence:
      number;

    candidateHash:
      string;
  };

  relation:
    PulseIntentReconciliationRelation;

  authority:
    PulseIntentReconciliationAuthority;

  canOverrideIntent:
    false;

  canSupportSemanticClaim:
    false;

  canSupportExecution:
    false;

  sourceSemanticObservationId:
    string;

  sourceSemanticObservationHash:
    string;

  source:
    typeof PULSE_INTENT_RECONCILIATION_SOURCE;

  observedAt:
    string;

  reconciliationHash:
    string;
};

function normalizeText(
  value: unknown,
  code: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new Error(code);
  }

  const normalized =
    value.trim();

  if (
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
    tenantId === "global" ||
    tenantId === "all"
  ) {
    throw new Error(
      "INVALID_RECONCILIATION_TENANT",
    );
  }
}

function assertContextBinding(
  intent:
    PulseIntentClassification,
  semantic:
    PulseInferenceSemanticObservation,
): void {
  const provenance =
    intent.provenance;

  if (
    typeof provenance.tenantId !==
      "string" ||
    provenance.tenantId.trim() === ""
  ) {
    throw new Error(
      "RECONCILIATION_INTENT_TENANT_REQUIRED",
    );
  }

  if (
    typeof provenance.contextId !==
      "string" ||
    provenance.contextId.trim() === ""
  ) {
    throw new Error(
      "RECONCILIATION_INTENT_CONTEXT_REQUIRED",
    );
  }

  if (
    typeof provenance.contextVersion !==
      "string" ||
    provenance.contextVersion.trim() === ""
  ) {
    throw new Error(
      "RECONCILIATION_INTENT_CONTEXT_VERSION_REQUIRED",
    );
  }

  if (
    provenance.tenantId !==
    semantic.tenantId
  ) {
    throw new Error(
      "RECONCILIATION_TENANT_MISMATCH",
    );
  }

  if (
    provenance.contextId !==
    semantic.contextId
  ) {
    throw new Error(
      "RECONCILIATION_CONTEXT_MISMATCH",
    );
  }

  if (
    provenance.contextVersion !==
    semantic.contextVersion
  ) {
    throw new Error(
      "RECONCILIATION_CONTEXT_VERSION_MISMATCH",
    );
  }

  if (
    provenance.store !== undefined &&
    semantic.store !== undefined &&
    provenance.store !==
      semantic.store
  ) {
    throw new Error(
      "RECONCILIATION_STORE_MISMATCH",
    );
  }

  if (
    provenance.section !== undefined &&
    semantic.section !== undefined &&
    provenance.section !==
      semantic.section
  ) {
    throw new Error(
      "RECONCILIATION_SECTION_MISMATCH",
    );
  }
}

function assertIntentLabel(
  value: unknown,
): value is PulseIntentLabel {
  return (
    typeof value === "string" &&
    (
      PULSE_INTENT_LABELS as readonly string[]
    ).includes(value)
  );
}

function classifyRelation(
  ruleIntent:
    PulseIntentClassification,
  candidateLabel:
    PulseIntentLabel,
): PulseIntentReconciliationRelation {
  if (
    candidateLabel ===
    ruleIntent.primary
  ) {
    return "AGREEMENT";
  }

  if (
    ruleIntent.secondary.includes(
      candidateLabel,
    )
  ) {
    return "SUPPLEMENT";
  }

  /*
   * The rule engine explicitly has no recognized
   * primary intent. A valid AI hypothesis can add
   * observational signal, but cannot replace the
   * rule result.
   */
  if (
    ruleIntent.primary ===
    "unknown_request"
  ) {
    return "SUPPLEMENT";
  }

  return "CONFLICT";
}

function calculateReconciliationId(
  input: {
    tenantId:
      string;

    contextId:
      string;

    contextVersion:
      string;

    primary:
      PulseIntentLabel;

    candidateLabel?:
      PulseIntentLabel;

    candidateHash?:
      string;

    sourceSemanticObservationId:
      string;

    sourceSemanticObservationHash:
      string;

    relation:
      PulseIntentReconciliationRelation;
  },
): string {
  return `pir_${hashProposal(input)}`;
}

function calculateReconciliationHash(
  base:
    Omit<
      PulseIntentReconciliationResult,
      "reconciliationHash"
    >,
): string {
  return hashProposal(base);
}

function assertBaseClassification(
  intent:
    PulseIntentClassification,
): void {
  if (
    intent.contractVersion !==
    "p0.5.1"
  ) {
    throw new Error(
      "INVALID_INTENT_CLASSIFICATION_CONTRACT",
    );
  }

  if (
    !assertIntentLabel(
      intent.primary,
    )
  ) {
    throw new Error(
      "INVALID_INTENT_PRIMARY",
    );
  }

  for (
    const label of intent.secondary
  ) {
    if (
      !assertIntentLabel(label)
    ) {
      throw new Error(
        "INVALID_INTENT_SECONDARY",
      );
    }
  }

  if (
    !Number.isFinite(
      intent.confidence,
    ) ||
    intent.confidence < 0 ||
    intent.confidence > 1
  ) {
    throw new Error(
      "INVALID_INTENT_CONFIDENCE",
    );
  }
}

export function reconcilePulseIntent(
  input: {
    intentClassification:
      PulseIntentClassification;

    semanticObservation:
      PulseInferenceSemanticObservation;
  },
): PulseIntentReconciliationResult {
  const intent =
    input.intentClassification;

  const semantic =
    input.semanticObservation;

  assertBaseClassification(
    intent,
  );

  if (
    !verifyPulseInferenceSemanticObservation(
      semantic,
    )
  ) {
    throw new Error(
      "INVALID_SEMANTIC_OBSERVATION",
    );
  }

  assertTenant(
    normalizeText(
      semantic.tenantId,
      "INVALID_RECONCILIATION_TENANT",
    ),
  );

  assertContextBinding(
    intent,
    semantic,
  );

  const candidate =
    semantic.candidate;

  /*
   * Only an INTENT_CANDIDATE may participate
   * in this reconciliation boundary.
   */
  if (
    candidate.kind !==
    "INTENT_CANDIDATE"
  ) {
    const relation =
      "INSUFFICIENT_EVIDENCE" as const;

    const reconciliationId =
      calculateReconciliationId({
        tenantId:
          semantic.tenantId,

        contextId:
          semantic.contextId,

        contextVersion:
          semantic.contextVersion,

        primary:
          intent.primary,

        sourceSemanticObservationId:
          semantic.semanticObservationId,

        sourceSemanticObservationHash:
          semantic.semanticObservationHash,

        relation,
      });

    const provisional:
      Omit<
        PulseIntentReconciliationResult,
        "reconciliationHash"
      > = {
      contract:
        PULSE_INTENT_RECONCILIATION_CONTRACT,

      reconciliationId,

      tenantId:
        semantic.tenantId,

      contextId:
        semantic.contextId,

      contextVersion:
        semantic.contextVersion,

      ruleIntent: {
        primary:
          intent.primary,

        secondary:
          [...intent.secondary],

        confidence:
          intent.confidence,

        confidenceBand:
          intent.confidenceBand,

        decision:
          intent.decision,

        clarificationRequired:
          intent.clarificationRequired,

        multiIntent:
          intent.multiIntent,
      },

      relation,

      authority:
        "RULE_ENGINE",

      canOverrideIntent:
        false,

      canSupportSemanticClaim:
        false,

      canSupportExecution:
        false,

      sourceSemanticObservationId:
        semantic.semanticObservationId,

      sourceSemanticObservationHash:
        semantic.semanticObservationHash,

      source:
        PULSE_INTENT_RECONCILIATION_SOURCE,

      observedAt:
        semantic.observedAt,
    };

    return {
      ...provisional,

      reconciliationHash:
        calculateReconciliationHash(
          provisional,
        ),
    };
  }

  if (
    !assertIntentLabel(
      candidate.label,
    )
  ) {
    throw new Error(
      "INVALID_AI_INTENT_CANDIDATE_LABEL",
    );
  }

  const relation =
    classifyRelation(
      intent,
      candidate.label,
    );

  const reconciliationId =
    calculateReconciliationId({
      tenantId:
        semantic.tenantId,

      contextId:
        semantic.contextId,

      contextVersion:
        semantic.contextVersion,

      primary:
        intent.primary,

      candidateLabel:
        candidate.label,

      candidateHash:
        candidate.candidateHash,

      sourceSemanticObservationId:
        semantic.semanticObservationId,

      sourceSemanticObservationHash:
        semantic.semanticObservationHash,

      relation,
    });

  const provisional:
    Omit<
      PulseIntentReconciliationResult,
      "reconciliationHash"
    > = {
    contract:
      PULSE_INTENT_RECONCILIATION_CONTRACT,

    reconciliationId,

    tenantId:
      semantic.tenantId,

    contextId:
      semantic.contextId,

    contextVersion:
      semantic.contextVersion,

    ruleIntent: {
      primary:
        intent.primary,

      secondary:
        [...intent.secondary],

      confidence:
        intent.confidence,

      confidenceBand:
        intent.confidenceBand,

      decision:
        intent.decision,

      clarificationRequired:
        intent.clarificationRequired,

      multiIntent:
        intent.multiIntent,
    },

    aiCandidate: {
      label:
        candidate.label,

      confidence:
        candidate.confidence,

      candidateHash:
        candidate.candidateHash,
    },

    relation,

    authority:
      "RULE_ENGINE",

    canOverrideIntent:
      false,

    canSupportSemanticClaim:
      false,

    canSupportExecution:
      false,

    sourceSemanticObservationId:
      semantic.semanticObservationId,

    sourceSemanticObservationHash:
      semantic.semanticObservationHash,

    source:
      PULSE_INTENT_RECONCILIATION_SOURCE,

    observedAt:
      semantic.observedAt,
  };

  return {
    ...provisional,

    reconciliationHash:
      calculateReconciliationHash(
        provisional,
      ),
  };
}

export function verifyPulseIntentReconciliation(
  result:
    PulseIntentReconciliationResult,
): boolean {
  try {
    if (
      result.contract !==
      PULSE_INTENT_RECONCILIATION_CONTRACT
    ) {
      return false;
    }

    if (
      result.authority !==
      "RULE_ENGINE" ||
      result.canOverrideIntent !==
        false ||
      result.canSupportSemanticClaim !==
        false ||
      result.canSupportExecution !==
        false
    ) {
      return false;
    }

    if (
      result.source !==
      PULSE_INTENT_RECONCILIATION_SOURCE
    ) {
      return false;
    }

    if (
      !assertIntentLabel(
        result.ruleIntent.primary,
      )
    ) {
      return false;
    }

    for (
      const label of
        result.ruleIntent.secondary
    ) {
      if (
        !assertIntentLabel(label)
      ) {
        return false;
      }
    }

    if (
      result.aiCandidate !==
      undefined &&
      !assertIntentLabel(
        result.aiCandidate.label,
      )
    ) {
      return false;
    }

    const expectedId =
      calculateReconciliationId({
        tenantId:
          result.tenantId,

        contextId:
          result.contextId,

        contextVersion:
          result.contextVersion,

        primary:
          result.ruleIntent.primary,

        candidateLabel:
          result.aiCandidate?.label,

        candidateHash:
          result.aiCandidate?.candidateHash,

        sourceSemanticObservationId:
          result.sourceSemanticObservationId,

        sourceSemanticObservationHash:
          result.sourceSemanticObservationHash,

        relation:
          result.relation,
      });

    if (
      result.reconciliationId !==
      expectedId
    ) {
      return false;
    }

    const {
      reconciliationHash,
      ...base
    } = result;

    return (
      calculateReconciliationHash(
        base,
      ) === reconciliationHash
    );
  } catch {
    return false;
  }
}
