/**
 * DigitalBoost Model Intelligence
 *
 * P0.7.0 — contrato de inteligencia de modelos.
 *
 * Esta capa:
 * - NO ejecuta modelos.
 * - NO concede permisos.
 * - NO modifica Governance.
 * - NO sustituye todavía al ModelRouter.
 *
 * Define:
 * - perfil de tarea;
 * - validación de compatibilidad;
 * - evidencia de selección;
 * - clasificación de fallos;
 * - fingerprint determinista.
 */

import type {
  AIProvider,
  DigitalBoostModel,
  ModelCapability,
  ModelSelectionRequest,
  ModelSelectionResult,
} from "../types/DigitalBoostAI";

import {
  buildPulseModelRuntimeBinding,
  type PulseModelRuntimeBinding,
  type PulseModelRuntimeBindingInput,
} from "./DigitalBoostModelRuntimeBinding";

export const PULSE_MODEL_INTELLIGENCE_CONTRACT =
  "p0.7.0" as const;

export type PulseModelRisk =
  | "L0"
  | "L1"
  | "L2"
  | "L3"
  | "L4";

export type PulseModelTaskKind =
  | "conversation"
  | "reasoning"
  | "structured"
  | "seo"
  | "products"
  | "content"
  | "analytics"
  | "transformation"
  | "general";

export type PulseModelFailureClass =
  | "UNAVAILABLE"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTHENTICATION"
  | "MODEL_NOT_FOUND"
  | "INVALID_REQUEST"
  | "CONTEXT_OVERFLOW"
  | "EMPTY_RESPONSE"
  | "INVALID_OUTPUT"
  | "POLICY_BLOCKED"
  | "UNKNOWN";

export type PulseModelSelectionDecision =
  | "ALLOW_MODEL"
  | "BLOCK_MODEL"
  | "USE_FALLBACK"
  | "USE_RULES";

export interface PulseModelTaskProfile {
  contract: typeof PULSE_MODEL_INTELLIGENCE_CONTRACT;
  task: string;
  taskKind: PulseModelTaskKind;
  requiredCapabilities: ModelCapability[];
  preferredProvider?: AIProvider;
  risk: PulseModelRisk;
  requireTools: boolean;
  requireStructuredOutput: boolean;
  minimumContextWindow?: number;
  tenantId?: string;
  store?: string;
}

export interface PulseModelTaskProfileInput {
  task: string;
  taskKind?: PulseModelTaskKind;
  requiredCapabilities?: ModelCapability[];
  preferredProvider?: AIProvider;
  risk?: PulseModelRisk;
  requireTools?: boolean;
  requireStructuredOutput?: boolean;
  minimumContextWindow?: number;
  tenantId?: string;
  store?: string;
}

export interface PulseModelCandidateEvaluation {
  modelRef: string;
  eligible: boolean;
  matchedCapabilities: ModelCapability[];
  missingCapabilities: ModelCapability[];
  providerMatch: boolean | null;
  structuredOutputCompatible: boolean | null;
  toolsCompatible: boolean | null;
  contextWindowCompatible: boolean | null;
  reasons: string[];
}

export interface PulseModelSelectionEvidence {
  evaluatedCandidates: PulseModelCandidateEvaluation[];
  eligibleCandidates: string[];
  rejectedCandidates: string[];
  selectedModelRef: string | null;
  decision: PulseModelSelectionDecision;
  fallbackUsed: boolean;
  reasons: string[];
}

export interface PulseModelSelectionContract {
  contract: typeof PULSE_MODEL_INTELLIGENCE_CONTRACT;
  taskProfile: PulseModelTaskProfile;
  rawSelection: ModelSelectionResult;
  evidence: PulseModelSelectionEvidence;

  /*
   * P0.7.2.3
   * Runtime identity expected for the selected model.
   */
  runtimeBinding?: PulseModelRuntimeBinding;

  fingerprint: string;
}

const CAPABILITY_ORDER: ModelCapability[] = [
  "conversation",
  "reasoning",
  "structured",
  "seo",
  "products",
  "content",
  "analytics",
  "transformation",
  "general",
];

function normalizeText(value: string | undefined): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function uniqueCapabilities(
  capabilities: ModelCapability[],
): ModelCapability[] {
  return Array.from(new Set(capabilities)).sort(
    (a, b) =>
      CAPABILITY_ORDER.indexOf(a) -
      CAPABILITY_ORDER.indexOf(b),
  );
}

function inferTaskKind(
  capabilities: ModelCapability[],
): PulseModelTaskKind {
  const order: PulseModelTaskKind[] = [
    "reasoning",
    "analytics",
    "seo",
    "products",
    "content",
    "transformation",
    "structured",
    "conversation",
    "general",
  ];

  for (const kind of order) {
    if (capabilities.includes(kind)) return kind;
  }

  return "general";
}

export function normalizePulseModelTaskProfile(
  input: PulseModelTaskProfileInput,
): PulseModelTaskProfile {
  const task = normalizeText(input.task);

  const requiredCapabilities =
    uniqueCapabilities(
      input.requiredCapabilities || [],
    );

  return {
    contract:
      PULSE_MODEL_INTELLIGENCE_CONTRACT,
    task,
    taskKind:
      input.taskKind ||
      inferTaskKind(requiredCapabilities),
    requiredCapabilities,
    preferredProvider:
      input.preferredProvider,
    risk: input.risk || "L0",
    requireTools:
      Boolean(input.requireTools),
    requireStructuredOutput:
      Boolean(input.requireStructuredOutput),
    minimumContextWindow:
      typeof input.minimumContextWindow === "number" &&
      Number.isFinite(input.minimumContextWindow) &&
      input.minimumContextWindow > 0
        ? Math.floor(input.minimumContextWindow)
        : undefined,
    tenantId:
      normalizeText(input.tenantId) || undefined,
    store:
      normalizeText(input.store) || undefined,
  };
}

export function evaluatePulseModelCandidate(
  profile: PulseModelTaskProfile,
  model: DigitalBoostModel,
): PulseModelCandidateEvaluation {
  const matchedCapabilities =
    profile.requiredCapabilities.filter(
      capability =>
        model.capabilities.includes(capability),
    );

  const missingCapabilities =
    profile.requiredCapabilities.filter(
      capability =>
        !model.capabilities.includes(capability),
    );

  const providerMatch =
    profile.preferredProvider
      ? model.provider === profile.preferredProvider
      : null;

  const structuredOutputCompatible =
    profile.requireStructuredOutput
      ? model.capabilities.includes("structured")
      : null;

  /*
   * Estado actual del sistema:
   * OpenClaw es el límite de orquestación/tooling.
   * Ollama por sí solo NO implica tools.
   */
  const toolsCompatible =
    profile.requireTools
      ? model.provider === "openclaw"
      : null;

  const contextWindowCompatible =
    profile.minimumContextWindow !== undefined
      ? typeof model.contextWindow === "number"
        ? model.contextWindow >=
          profile.minimumContextWindow
        : false
      : null;

  const reasons: string[] = [];

  if (!model.available)
    reasons.push("MODEL_UNAVAILABLE");

  if (missingCapabilities.length)
    reasons.push("MISSING_REQUIRED_CAPABILITIES");

  if (
    profile.requireStructuredOutput &&
    structuredOutputCompatible !== true
  ) {
    reasons.push(
      "STRUCTURED_OUTPUT_REQUIREMENT_UNSATISFIED",
    );
  }

  if (
    profile.requireTools &&
    toolsCompatible !== true
  ) {
    reasons.push(
      "TOOLS_REQUIREMENT_UNSATISFIED",
    );
  }

  if (
    profile.minimumContextWindow !== undefined &&
    contextWindowCompatible !== true
  ) {
    reasons.push(
      "CONTEXT_WINDOW_REQUIREMENT_UNSATISFIED",
    );
  }

  if (
    profile.preferredProvider &&
    providerMatch === false
  ) {
    reasons.push("PREFERRED_PROVIDER_MISMATCH");
  }

  return {
    modelRef:
      `${model.provider}/${model.modelId}`,
    eligible:
      model.available &&
      missingCapabilities.length === 0 &&
      (!profile.requireStructuredOutput ||
        structuredOutputCompatible === true) &&
      (!profile.requireTools ||
        toolsCompatible === true) &&
      (profile.minimumContextWindow === undefined ||
        contextWindowCompatible === true),
    matchedCapabilities,
    missingCapabilities,
    providerMatch,
    structuredOutputCompatible,
    toolsCompatible,
    contextWindowCompatible,
    reasons,
  };
}

export function validatePulseModelSelection(
  profile: PulseModelTaskProfile,
  model: DigitalBoostModel | null,
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  if (!model) {
    return {
      valid: false,
      errors: ["MODEL_SELECTION_EMPTY"],
      warnings: [],
    };
  }

  const evaluation =
    evaluatePulseModelCandidate(
      profile,
      model,
    );

  const errors =
    evaluation.reasons.filter(
      reason =>
        reason !==
        "PREFERRED_PROVIDER_MISMATCH",
    );

  const warnings =
    evaluation.reasons.includes(
      "PREFERRED_PROVIDER_MISMATCH",
    )
      ? ["PREFERRED_PROVIDER_NOT_SELECTED"]
      : [];

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function buildPulseModelSelectionEvidence(
  profile: PulseModelTaskProfile,
  rawSelection: ModelSelectionResult,
  candidates: DigitalBoostModel[],
): PulseModelSelectionEvidence {
  const evaluatedCandidates =
    candidates.map(model =>
      evaluatePulseModelCandidate(
        profile,
        model,
      ),
    );

  const selectedModelRef =
    rawSelection.model
      ? `${rawSelection.model.provider}/${rawSelection.model.modelId}`
      : null;

  const selectedEvaluation =
    rawSelection.model
      ? evaluatePulseModelCandidate(
          profile,
          rawSelection.model,
        )
      : null;

  let decision: PulseModelSelectionDecision;

  if (!rawSelection.model) {
    decision =
      rawSelection.fallbackUsed
        ? "USE_RULES"
        : "BLOCK_MODEL";
  } else if (selectedEvaluation?.eligible) {
    decision =
      rawSelection.fallbackUsed
        ? "USE_FALLBACK"
        : "ALLOW_MODEL";
  } else {
    decision = "BLOCK_MODEL";
  }

  return {
    evaluatedCandidates,
    eligibleCandidates:
      evaluatedCandidates
        .filter(item => item.eligible)
        .map(item => item.modelRef),
    rejectedCandidates:
      evaluatedCandidates
        .filter(item => !item.eligible)
        .map(item => item.modelRef),
    selectedModelRef,
    decision,
    fallbackUsed:
      Boolean(rawSelection.fallbackUsed),
    reasons: Array.from(
      new Set(
        [
          rawSelection.reason,
          ...(selectedEvaluation?.reasons || []),
        ].filter(Boolean),
      ),
    ),
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value))
    return value.map(canonicalize);

  if (
    value &&
    typeof value === "object"
  ) {
    const object =
      value as Record<string, unknown>;

    return Object.fromEntries(
      Object.keys(object)
        .sort()
        .map(key => [
          key,
          canonicalize(object[key]),
        ]),
    );
  }

  return value;
}

export function fingerprintPulseModelSelection(
  input: {
    contract: string;
    taskProfile: PulseModelTaskProfile;
    rawSelection: ModelSelectionResult;
    evidence: PulseModelSelectionEvidence;
  },
): string {
  /*
   * Semantic identity only.
   *
   * Excluded from identity:
   * - rawSelection.reason
   * - discoveredAt
   * - runtime timestamps
   * - explanatory prose
   * - candidate enumeration order
   *
   * Included:
   * - contract
   * - semantic task profile
   * - selected provider/model
   * - fallback state
   * - semantic candidate sets
   * - final selection decision
   *
   * This is an identity helper, not cryptographic authority.
   */

  const canonical =
    JSON.stringify(
      canonicalize({
        contract:
          input.contract,

        taskProfile: {
          contract:
            input.taskProfile.contract,
          task:
            input.taskProfile.task,
          taskKind:
            input.taskProfile.taskKind,
          requiredCapabilities:
            input.taskProfile.requiredCapabilities,
          preferredProvider:
            input.taskProfile.preferredProvider ||
            null,
          risk:
            input.taskProfile.risk,
          requireTools:
            input.taskProfile.requireTools,
          requireStructuredOutput:
            input.taskProfile
              .requireStructuredOutput,
          minimumContextWindow:
            input.taskProfile
              .minimumContextWindow ||
            null,
          tenantId:
            input.taskProfile.tenantId ||
            null,
          store:
            input.taskProfile.store ||
            null,
        },

        selection: {
          model:
            input.rawSelection.model
              ? {
                  provider:
                    input.rawSelection
                      .model.provider,
                  modelId:
                    input.rawSelection
                      .model.modelId,
                }
              : null,

          fallbackUsed:
            Boolean(
              input.rawSelection
                .fallbackUsed,
            ),
        },

        runtimeBinding:
          input.runtimeBinding
            ? {
                selectionModelRef:
                  input.runtimeBinding
                    .selectionModelRef,

                runtimeModelRef:
                  input.runtimeBinding
                    .runtimeModelRef ||
                  null,

                mode:
                  input.runtimeBinding
                    .mode,

                adapterId:
                  input.runtimeBinding
                    .adapterId ||
                  null,
              }
            : null,

        evidence: {
          eligibleCandidates:
            [
              ...input.evidence
                .eligibleCandidates,
            ].sort(),

          rejectedCandidates:
            [
              ...input.evidence
                .rejectedCandidates,
            ].sort(),

          selectedModelRef:
            input.evidence
              .selectedModelRef,

          decision:
            input.evidence
              .decision,
        },
      }),
    );

  let hash = 0x811c9dc5;

  for (
    let index = 0;
    index < canonical.length;
    index++
  ) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(
      hash,
      0x01000193,
    );
  }

  return (
    "pmi_" +
    (hash >>> 0)
      .toString(16)
      .padStart(8, "0")
  );
}

export function classifyPulseModelFailure(
  input: {
    error?: unknown;
    status?: number;
    message?: string;
  } = {},
): PulseModelFailureClass {
  const message =
    normalizeText(
      input.message ||
        (
          input.error &&
          typeof input.error === "object" &&
          "message" in input.error
            ? String(
                (
                  input.error as {
                    message?: unknown;
                  }
                ).message || "",
              )
            : String(input.error || "")
        ),
    ).toLowerCase();

  if (
    input.status === 401 ||
    input.status === 403 ||
    /unauthori[sz]ed|forbidden|api key|credential|authentication/.test(
      message,
    )
  ) {
    return "AUTHENTICATION";
  }

  if (
    input.status === 408 ||
    /timeout|timed out|deadline/.test(
      message,
    )
  ) {
    return "TIMEOUT";
  }

  if (
    input.status === 429 ||
    /rate limit|too many requests|throttl/.test(
      message,
    )
  ) {
    return "RATE_LIMIT";
  }

  if (
    input.status === 404 ||
    /model.*not found|unknown model/.test(
      message,
    )
  ) {
    return "MODEL_NOT_FOUND";
  }

  if (
    /context.*(length|window|overflow)|too many tokens|maximum.*tokens/.test(
      message,
    )
  ) {
    return "CONTEXT_OVERFLOW";
  }

  if (
    /empty response|no response|blank response/.test(
      message,
    )
  ) {
    return "EMPTY_RESPONSE";
  }

  if (
    /invalid.*(output|response)|malformed.*(output|response)|schema validation|parse error/.test(
      message,
    )
  ) {
    return "INVALID_OUTPUT";
  }

  if (
    input.status === 400 ||
    /invalid request|bad request|unsupported parameter/.test(
      message,
    )
  ) {
    return "INVALID_REQUEST";
  }

  if (
    /unavailable|unreachable|connection refused|service unavailable/.test(
      message,
    )
  ) {
    return "UNAVAILABLE";
  }

  return "UNKNOWN";
}

export function createPulseModelSelectionContract(
  input: {
    profile: PulseModelTaskProfile;
    rawSelection: ModelSelectionResult;
    candidates: DigitalBoostModel[];
    runtimeBinding?: PulseModelRuntimeBindingInput;
  },
): PulseModelSelectionContract {
  const evidence =
    buildPulseModelSelectionEvidence(
      input.profile,
      input.rawSelection,
      input.candidates,
    );

  const runtimeBinding =
    buildPulseModelRuntimeBinding(
      input.rawSelection.model,
      input.runtimeBinding,
    );

  return {
    contract:
      PULSE_MODEL_INTELLIGENCE_CONTRACT,

    taskProfile:
      input.profile,

    rawSelection:
      input.rawSelection,

    evidence,

    runtimeBinding,

    fingerprint:
      fingerprintPulseModelSelection({
        contract:
          PULSE_MODEL_INTELLIGENCE_CONTRACT,

        taskProfile:
          input.profile,

        rawSelection:
          input.rawSelection,

        evidence,

        runtimeBinding,
      }),
  };
}

export function toLegacyModelSelectionRequest(
  profile: PulseModelTaskProfile,
): ModelSelectionRequest {
  return {
    task: profile.task,
    capabilities:
      profile.requiredCapabilities,
    preferredProvider:
      profile.preferredProvider,
    risk:
      profile.risk === "L0" ||
      profile.risk === "L1"
        ? "low"
        : profile.risk === "L2"
          ? "medium"
          : "high",
    requireTools:
      profile.requireTools,
  };
}
