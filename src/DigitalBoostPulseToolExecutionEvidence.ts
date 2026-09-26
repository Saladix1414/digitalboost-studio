/**
 * PULSE Tool Execution Evidence — P0.8.5
 *
 * This module composes:
 *
 *   P0.8.4 Agent ↔ Tool Policy Resolution
 *                    ↓
 *   P0.8.2 Tool Invocation Boundary
 *                    ↓
 *   P0.8.5 Invocation / Execution Evidence
 *
 * IMPORTANT:
 * - Evidence is not authority.
 * - Evidence is not approval.
 * - Evidence is not an attestation.
 * - Evidence is not proof.
 * - Evidence does not mutate application state.
 * - Evidence does not persist itself.
 * - Durable execution proof remains P0.4.x.
 *
 * The semantic fingerprint intentionally uses the project's
 * existing deterministic `hashProposal()` primitive.
 *
 * It is a semantic identity/fingerprint, NOT a cryptographic
 * authority primitive.
 */

import {
  hashProposal,
} from "./DigitalBoostPulseContracts";

import {
  PULSE_AGENT_TOOL_POLICY_CONTRACT,
  resolvePulseAgentToolPolicy,
  type PulseAgentToolPolicyDecision,
  type PulseAgentToolPolicyPurpose,
  type PulseAgentToolPolicyRequest,
} from "./DigitalBoostPulseAgentToolPolicy";

import {
  PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT,
  invokePulseTool,
  type PulseToolInvocationPurpose,
  type PulseToolInvocationResult,
} from "./DigitalBoostPulseToolBoundary";

import {
  getPulseToolDescriptor,
} from "./DigitalBoostPulseToolRegistry";

export const
  PULSE_TOOL_EXECUTION_EVIDENCE_CONTRACT =
    "p0.8.5" as const;

export type PulseToolExecutionEvidenceOutcome =
  | "POLICY_DENIED"
  | "INVOCATION_FAILED"
  | "INVOKED";

export type PulseToolExecutionEvidenceRequest = {
  readonly agentId: string;
  readonly toolId: string;

  readonly requestId: string;
  readonly tenantId: string;

  readonly purpose?:
    PulseAgentToolPolicyPurpose;

  readonly intent?:
    string;

  readonly section?:
    string;

  readonly requiredCapabilities?:
    readonly string[];

  readonly contextId?:
    string;

  readonly contextVersion?:
    string;

  readonly missionId?:
    string;

  readonly planId?:
    string;

  readonly stepId?:
    string;

  readonly stepIndex?:
    number;

  readonly input?: unknown;
};

export type PulseToolExecutionEvidence = {
  readonly contract:
    typeof PULSE_TOOL_EXECUTION_EVIDENCE_CONTRACT;

  readonly evidenceId:
    string;

  readonly evidenceHash:
    string;

  readonly recordedAt:
    string;

  readonly outcome:
    PulseToolExecutionEvidenceOutcome;

  readonly invoked:
    boolean;

  readonly agentId:
    string;

  readonly toolId:
    string;

  readonly toolKind:
    "OBSERVATION"
    | "PROPOSAL";

  readonly purpose:
    PulseToolInvocationPurpose;

  readonly requestId:
    string;

  readonly tenantId:
    string;

  readonly intent:
    string | null;

  readonly section:
    string | null;

  readonly requiredCapabilities:
    readonly string[];

  readonly contextId:
    string | null;

  readonly contextVersion:
    string | null;

  readonly missionId:
    string | null;

  readonly planId:
    string | null;

  readonly stepId:
    string | null;

  readonly stepIndex:
    number | null;

  readonly policyContract:
    typeof PULSE_AGENT_TOOL_POLICY_CONTRACT;

  readonly policyDecision:
    "ALLOW" | "DENY";

  readonly policyResolved:
    boolean;

  readonly policyReasons:
    readonly string[];

  readonly boundaryContract:
    typeof PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT;

  readonly registryValidated:
    boolean;

  readonly inputFingerprint:
    string;

  readonly outputFingerprint:
    string | null;

  readonly errorCode:
    string | null;

  /**
   * Evidence itself never carries execution authority.
   */
  readonly authority:
    "NONE";

  readonly sideEffect:
    "NONE";
};

export type PulseToolExecutionEvidenceResult<
  T = unknown,
> = {
  readonly evidence:
    PulseToolExecutionEvidence;

  readonly output?:
    T;

  readonly policy:
    PulseAgentToolPolicyDecision;

  readonly invocation?:
    PulseToolInvocationResult<T>;
};

function normalizeRequiredString(
  value: unknown,
  code: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      code,
    );
  }

  return value.trim();
}

function normalizeOptionalString(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized || null;
}

function normalizeTenant(
  value: unknown,
): string {
  const tenant =
    normalizeRequiredString(
      value,
      "P0.8.5_TENANT_REQUIRED",
    );

  if (
    tenant === "*" ||
    tenant.toLowerCase() === "global"
  ) {
    throw new Error(
      "P0.8.5_INVALID_TENANT",
    );
  }

  return tenant;
}

function normalizeCapabilities(
  capabilities?:
    readonly string[],
): readonly string[] {
  return Object.freeze(
    Array.from(
      new Set(
        (capabilities || [])
          .map(function (value) {
            return String(
              value,
            ).trim();
          })
          .filter(Boolean),
      ),
    ).sort(),
  );
}

function validateTraceConsistency(
  input:
    PulseToolExecutionEvidenceRequest,
): void {
  const traceValues = [
    normalizeOptionalString(
      input.missionId,
    ),
    normalizeOptionalString(
      input.planId,
    ),
    normalizeOptionalString(
      input.stepId,
    ),
  ];

  const supplied =
    traceValues.filter(
      Boolean,
    ).length;

  if (
    supplied !== 0 &&
    supplied !== 3
  ) {
    throw new Error(
      "P0.8.5_TRACE_INCOMPLETE",
    );
  }

  if (
    input.stepIndex !== undefined
  ) {
    if (
      supplied !== 3 ||
      !Number.isInteger(
        input.stepIndex,
      ) ||
      input.stepIndex < 0
    ) {
      throw new Error(
        "P0.8.5_STEP_INDEX_INVALID",
      );
    }
  }
}

function validateContextConsistency(
  input:
    PulseToolExecutionEvidenceRequest,
): void {
  const contextId =
    normalizeOptionalString(
      input.contextId,
    );

  const contextVersion =
    normalizeOptionalString(
      input.contextVersion,
    );

  if (
    (contextId === null) !==
    (contextVersion === null)
  ) {
    throw new Error(
      "P0.8.5_CONTEXT_BINDING_INCOMPLETE",
    );
  }
}

function semanticEvidencePayload(
  evidence:
    Omit<
      PulseToolExecutionEvidence,
      "recordedAt" | "evidenceId" | "evidenceHash"
    >,
) {
  return {
    contract:
      evidence.contract,

    outcome:
      evidence.outcome,

    invoked:
      evidence.invoked,

    agentId:
      evidence.agentId,

    toolId:
      evidence.toolId,

    toolKind:
      evidence.toolKind,

    purpose:
      evidence.purpose,

    requestId:
      evidence.requestId,

    tenantId:
      evidence.tenantId,

    intent:
      evidence.intent,

    section:
      evidence.section,

    requiredCapabilities:
      [...evidence.requiredCapabilities],

    contextId:
      evidence.contextId,

    contextVersion:
      evidence.contextVersion,

    missionId:
      evidence.missionId,

    planId:
      evidence.planId,

    stepId:
      evidence.stepId,

    stepIndex:
      evidence.stepIndex,

    policyContract:
      evidence.policyContract,

    policyDecision:
      evidence.policyDecision,

    policyResolved:
      evidence.policyResolved,

    policyReasons:
      [...evidence.policyReasons],

    boundaryContract:
      evidence.boundaryContract,

    registryValidated:
      evidence.registryValidated,

    inputFingerprint:
      evidence.inputFingerprint,

    outputFingerprint:
      evidence.outputFingerprint,

    errorCode:
      evidence.errorCode,

    authority:
      evidence.authority,

    sideEffect:
      evidence.sideEffect,
  };
}

function finalizeEvidence(
  base:
    Omit<
      PulseToolExecutionEvidence,
      "recordedAt" | "evidenceId" | "evidenceHash"
    >,
): PulseToolExecutionEvidence {
  const semantic =
    semanticEvidencePayload(
      base,
    );

  const evidenceHash =
    hashProposal(
      semantic,
    );

  const evidenceId =
    "pte_" +
    evidenceHash;

  return Object.freeze({
    ...base,

    evidenceId,

    evidenceHash,

    recordedAt:
      new Date().toISOString(),
  });
}

export function verifyPulseToolExecutionEvidence(
  evidence:
    PulseToolExecutionEvidence,
): boolean {
  if (
    evidence.contract !==
    PULSE_TOOL_EXECUTION_EVIDENCE_CONTRACT
  ) {
    return false;
  }

  if (
    evidence.authority !==
    "NONE" ||
    evidence.sideEffect !==
    "NONE"
  ) {
    return false;
  }

  const {
    recordedAt,
    evidenceId,
    evidenceHash,
    ...base
  } = evidence;

  void recordedAt;
  void evidenceId;

  const expected =
    hashProposal(
      semanticEvidencePayload(
        base,
      ),
    );

  return (
    expected ===
    evidenceHash
    &&
    evidenceId ===
      "pte_" +
      expected
  );
}

function baseInput(input: {
  readonly request:
    PulseToolExecutionEvidenceRequest;

  readonly purpose:
    PulseToolInvocationPurpose;

  readonly toolKind:
    "OBSERVATION"
    | "PROPOSAL";

  readonly policy:
    PulseAgentToolPolicyDecision;

  readonly outcome:
    PulseToolExecutionEvidenceOutcome;

  readonly invoked:
    boolean;

  readonly registryValidated:
    boolean;

  readonly inputFingerprint:
    string;

  readonly outputFingerprint:
    string | null;

  readonly errorCode:
    string | null;
}): Omit<
  PulseToolExecutionEvidence,
  "recordedAt" | "evidenceId" | "evidenceHash"
> {
  const request =
    input.request;

  return {
    contract:
      PULSE_TOOL_EXECUTION_EVIDENCE_CONTRACT,

    outcome:
      input.outcome,

    invoked:
      input.invoked,

    agentId:
      normalizeRequiredString(
        request.agentId,
        "P0.8.5_AGENT_REQUIRED",
      ),

    toolId:
      normalizeRequiredString(
        request.toolId,
        "P0.8.5_TOOL_REQUIRED",
      ),

    toolKind:
      input.toolKind,

    purpose:
      input.purpose,

    requestId:
      normalizeRequiredString(
        request.requestId,
        "P0.8.5_REQUEST_ID_REQUIRED",
      ),

    tenantId:
      normalizeTenant(
        request.tenantId,
      ),

    intent:
      normalizeOptionalString(
        request.intent,
      ),

    section:
      normalizeOptionalString(
        request.section,
      ),

    requiredCapabilities:
      normalizeCapabilities(
        request.requiredCapabilities,
      ),

    contextId:
      normalizeOptionalString(
        request.contextId,
      ),

    contextVersion:
      normalizeOptionalString(
        request.contextVersion,
      ),

    missionId:
      normalizeOptionalString(
        request.missionId,
      ),

    planId:
      normalizeOptionalString(
        request.planId,
      ),

    stepId:
      normalizeOptionalString(
        request.stepId,
      ),

    stepIndex:
      request.stepIndex === undefined
        ? null
        : request.stepIndex,

    policyContract:
      PULSE_AGENT_TOOL_POLICY_CONTRACT,

    policyDecision:
      input.policy.decision,

    policyResolved:
      input.policy.policyResolved,

    policyReasons:
      Object.freeze([
        ...input.policy.reasons,
      ]),

    boundaryContract:
      PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT,

    registryValidated:
      input.registryValidated,

    inputFingerprint:
      input.inputFingerprint,

    outputFingerprint:
      input.outputFingerprint,

    errorCode:
      input.errorCode,

    authority:
      "NONE",

    sideEffect:
      "NONE",
  };
}

function normalizePurpose(
  purpose:
    | PulseToolInvocationPurpose
    | undefined,
): PulseToolInvocationPurpose {
  return (
    purpose ||
    "OBSERVE"
  );
}

function buildPolicyRequest(
  input:
    PulseToolExecutionEvidenceRequest,
): PulseAgentToolPolicyRequest {
  return {
    agentId:
      input.agentId,

    toolId:
      input.toolId,

    purpose:
      input.purpose,

    intent:
      input.intent,

    section:
      input.section,

    requiredCapabilities:
      input.requiredCapabilities,
  };
}

export function invokePulseToolWithEvidence<
  T = unknown,
>(
  input:
    PulseToolExecutionEvidenceRequest,
): PulseToolExecutionEvidenceResult<T> {
  const request = {
    ...input,
    agentId:
      normalizeRequiredString(
        input.agentId,
        "P0.8.5_AGENT_REQUIRED",
      ),
    toolId:
      normalizeRequiredString(
        input.toolId,
        "P0.8.5_TOOL_REQUIRED",
      ),
    requestId:
      normalizeRequiredString(
        input.requestId,
        "P0.8.5_REQUEST_ID_REQUIRED",
      ),
    tenantId:
      normalizeTenant(
        input.tenantId,
      ),
  };

  validateContextConsistency(
    request,
  );

  validateTraceConsistency(
    request,
  );

  const purpose =
    normalizePurpose(
      request.purpose,
    );

  const policy =
    resolvePulseAgentToolPolicy(
      buildPolicyRequest({
        ...request,
        purpose,
      }),
    );

  let descriptor;

  try {
    descriptor =
      getPulseToolDescriptor(
        request.toolId,
      );
  } catch {
    /**
     * The policy layer will already report TOOL_UNKNOWN.
     * Keep the tool kind observational in the failure evidence.
     */
    const evidence =
      finalizeEvidence(
        baseInput({
          request,
          purpose,
          toolKind:
            "OBSERVATION",
          policy,
          outcome:
            "POLICY_DENIED",
          invoked: false,
          registryValidated: false,
          inputFingerprint:
            hashProposal(
              request.input ?? null,
            ),
          outputFingerprint:
            null,
          errorCode:
            policy.reasons[0] ||
            "TOOL_UNKNOWN",
        }),
      );

    return Object.freeze({
      evidence,
      policy,
    });
  }

  const inputFingerprint =
    hashProposal(
      request.input ?? null,
    );

  if (
    policy.decision !==
    "ALLOW"
  ) {
    const evidence =
      finalizeEvidence(
        baseInput({
          request,
          purpose,
          toolKind:
            descriptor.kind,
          policy,
          outcome:
            "POLICY_DENIED",
          invoked: false,
          registryValidated: false,
          inputFingerprint,
          outputFingerprint:
            null,
          errorCode:
            policy.reasons[0] ||
            "POLICY_DENIED",
        }),
      );

    return Object.freeze({
      evidence,
      policy,
    });
  }

  try {
    const invocation =
      invokePulseTool<T>({
        toolId:
          request.toolId,

        purpose,

        requiredCapabilities:
          request.requiredCapabilities,

        input:
          request.input,
      });

    const evidence =
      finalizeEvidence(
        baseInput({
          request,
          purpose,
          toolKind:
            descriptor.kind,
          policy,
          outcome:
            "INVOKED",
          invoked: true,
          registryValidated:
            invocation.registryValidated,
          inputFingerprint,
          outputFingerprint:
            hashProposal(
              invocation.output,
            ),
          errorCode:
            null,
        }),
      );

    return Object.freeze({
      evidence,
      output:
        invocation.output,

      policy,

      invocation,
    });
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message
        : "PULSE_TOOL_INVOCATION_FAILED";

    const evidence =
      finalizeEvidence(
        baseInput({
          request,
          purpose,
          toolKind:
            descriptor.kind,
          policy,
          outcome:
            "INVOCATION_FAILED",
          invoked: true,
          registryValidated: false,
          inputFingerprint,
          outputFingerprint:
            null,
          errorCode:
            errorCode.slice(0, 200),
        }),
      );

    return Object.freeze({
      evidence,
      policy,
    });
  }
}
