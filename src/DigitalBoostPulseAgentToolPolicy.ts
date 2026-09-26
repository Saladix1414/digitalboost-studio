/**
 * PULSE Agent ↔ Tool Policy Resolution — P0.8.4
 *
 * Resolves whether a registered agent/tool relationship is eligible
 * for a given policy context.
 *
 * IMPORTANT:
 * - This is policy resolution, NOT execution authorization.
 * - A successful decision does NOT approve an action.
 * - A successful decision does NOT execute a tool.
 * - Agent Registry remains declarative.
 * - Tool Registry remains declarative.
 * - Tool Boundary remains the invocation boundary.
 * - Governance remains the source of truth for risk/approval.
 * - Executor remains the source of truth for controlled mutation.
 *
 * Resolution chain:
 *
 * agent identity
 *   -> tool identity
 *   -> explicit agent/tool binding
 *   -> intent policy
 *   -> section policy
 *   -> purpose/tool-kind policy
 *   -> explicitly requested capability policy
 *   -> authority/side-effect invariants
 *
 * Capability rule:
 *
 * Agent capability coverage is NOT required to equal the full
 * internal capability set of every bound tool.
 *
 * Existing P0.8.3 descriptors intentionally contain higher-level
 * agent capabilities.
 *
 * Therefore:
 * - binding is established by agent.tools
 * - capability checks happen only when capabilities are explicitly
 *   requested by the caller
 * - every requested capability must exist on BOTH agent and tool
 */

import {
  getPulseAgentDescriptor,
  listPulseAgentDescriptors,
  type PulseAgentDescriptor,
} from "./DigitalBoostPulseAgentRegistry";

import type {
  PulseAgent,
  PulseIntent,
} from "./DigitalBoostPulseConst";

import {
  getPulseToolDescriptor,
  type PulseToolDescriptor,
} from "./DigitalBoostPulseToolRegistry";

export const PULSE_AGENT_TOOL_POLICY_CONTRACT =
  "p0.8.4" as const;

export type PulseAgentToolPolicyPurpose =
  | "OBSERVE"
  | "PROPOSE";

export type PulseAgentToolPolicyReason =
  | "POLICY_RESOLVED"
  | "AGENT_ID_REQUIRED"
  | "AGENT_UNKNOWN"
  | "TOOL_ID_REQUIRED"
  | "TOOL_UNKNOWN"
  | "TOOL_NOT_BOUND_TO_AGENT"
  | "AGENT_INTENT_REQUIRED"
  | "AGENT_INTENT_NOT_ALLOWED"
  | "AGENT_SECTION_REQUIRED"
  | "AGENT_SECTION_NOT_ALLOWED"
  | "POLICY_PURPOSE_INVALID"
  | "TOOL_PURPOSE_MISMATCH"
  | "AGENT_CAPABILITY_NOT_DECLARED"
  | "TOOL_CAPABILITY_NOT_DECLARED"
  | "AGENT_AUTHORITY_NOT_ALLOWED"
  | "AGENT_SIDE_EFFECT_NOT_ALLOWED"
  | "TOOL_AUTHORITY_NOT_ALLOWED"
  | "TOOL_SIDE_EFFECT_NOT_ALLOWED";

export type PulseAgentToolPolicyRequest = {
  readonly agentId: string;
  readonly toolId: string;

  readonly purpose?:
    PulseAgentToolPolicyPurpose;

  readonly intent?:
    PulseIntent | string;

  readonly section?:
    string;

  readonly requiredCapabilities?:
    readonly string[];
};

export type PulseAgentToolPolicyDecision = {
  readonly contract:
    typeof PULSE_AGENT_TOOL_POLICY_CONTRACT;

  readonly decision:
    | "ALLOW"
    | "DENY";

  /**
   * True only when the policy relationship was successfully resolved.
   * This is NOT execution authorization.
   */
  readonly policyResolved:
    boolean;

  readonly agentId:
    string;

  readonly toolId:
    string;

  readonly purpose:
    PulseAgentToolPolicyPurpose;

  readonly intent:
    string | null;

  readonly section:
    string | null;

  readonly requiredCapabilities:
    readonly string[];

  readonly reasons:
    readonly PulseAgentToolPolicyReason[];

  readonly authority:
    "NONE";

  readonly sideEffect:
    "NONE";
};

function normalizeId(
  value: unknown,
): string {
  return String(value || "").trim();
}

function normalizeValue(
  value: unknown,
): string | null {
  const normalized =
    String(value || "").trim();

  return normalized || null;
}

function normalizeCapabilities(
  capabilities?: readonly string[],
): readonly string[] {
  return Object.freeze(
    Array.from(
      new Set(
        (capabilities || [])
          .map((capability) =>
            String(capability).trim(),
          )
          .filter(Boolean),
      ),
    ).sort(),
  );
}

function baseDecision(
  request:
    PulseAgentToolPolicyRequest,

  decision:
    | "ALLOW"
    | "DENY",

  reasons:
    readonly PulseAgentToolPolicyReason[],

  intent:
    string | null,

  section:
    string | null,

  requiredCapabilities:
    readonly string[],
): PulseAgentToolPolicyDecision {
  const purpose =
    request?.purpose ||
    "OBSERVE";

  return Object.freeze({
    contract:
      PULSE_AGENT_TOOL_POLICY_CONTRACT,

    decision,

    policyResolved:
      decision === "ALLOW",

    agentId:
      normalizeId(
        request?.agentId,
      ),

    toolId:
      normalizeId(
        request?.toolId,
      ),

    purpose:
      purpose as PulseAgentToolPolicyPurpose,

    intent,

    section,

    requiredCapabilities:
      Object.freeze([
        ...requiredCapabilities,
      ]),

    reasons:
      Object.freeze([
        ...reasons,
      ]),

    authority:
      "NONE",

    sideEffect:
      "NONE",
  });
}

function deny(
  request:
    PulseAgentToolPolicyRequest,

  reason:
    PulseAgentToolPolicyReason,

  intent:
    string | null,

  section:
    string | null,

  requiredCapabilities:
    readonly string[],
): PulseAgentToolPolicyDecision {
  return baseDecision(
    request,
    "DENY",
    [reason],
    intent,
    section,
    requiredCapabilities,
  );
}

function assertStaticAgentSafety(
  agent:
    PulseAgentDescriptor,
):
  PulseAgentToolPolicyReason | null {
  if (
    agent.authority !==
    "NONE"
  ) {
    return "AGENT_AUTHORITY_NOT_ALLOWED";
  }

  if (
    agent.sideEffect !==
    "NONE"
  ) {
    return "AGENT_SIDE_EFFECT_NOT_ALLOWED";
  }

  return null;
}

function assertStaticToolSafety(
  tool:
    PulseToolDescriptor,
):
  PulseAgentToolPolicyReason | null {
  if (
    tool.authority !==
    "NONE"
  ) {
    return "TOOL_AUTHORITY_NOT_ALLOWED";
  }

  if (
    tool.sideEffect !==
    "NONE"
  ) {
    return "TOOL_SIDE_EFFECT_NOT_ALLOWED";
  }

  return null;
}

export function resolvePulseAgentToolPolicy(
  request:
    PulseAgentToolPolicyRequest,
): PulseAgentToolPolicyDecision {
  const agentId =
    normalizeId(
      request?.agentId,
    );

  const toolId =
    normalizeId(
      request?.toolId,
    );

  const intent =
    normalizeValue(
      request?.intent,
    );

  const section =
    normalizeValue(
      request?.section,
    );

  const requiredCapabilities =
    normalizeCapabilities(
      request?.requiredCapabilities,
    );

  const purpose =
    request?.purpose ||
    "OBSERVE";

  if (!agentId) {
    return deny(
      request,
      "AGENT_ID_REQUIRED",
      intent,
      section,
      requiredCapabilities,
    );
  }

  if (!toolId) {
    return deny(
      request,
      "TOOL_ID_REQUIRED",
      intent,
      section,
      requiredCapabilities,
    );
  }

  if (
    purpose !== "OBSERVE" &&
    purpose !== "PROPOSE"
  ) {
    return deny(
      request,
      "POLICY_PURPOSE_INVALID",
      intent,
      section,
      requiredCapabilities,
    );
  }

  let agent:
    PulseAgentDescriptor;

  try {
    agent =
      getPulseAgentDescriptor(
        agentId as PulseAgent,
      );
  } catch {
    return deny(
      request,
      "AGENT_UNKNOWN",
      intent,
      section,
      requiredCapabilities,
    );
  }

  let tool:
    PulseToolDescriptor;

  try {
    tool =
      getPulseToolDescriptor(
        toolId,
      );
  } catch {
    return deny(
      request,
      "TOOL_UNKNOWN",
      intent,
      section,
      requiredCapabilities,
    );
  }

  const agentSafety =
    assertStaticAgentSafety(
      agent,
    );

  if (agentSafety) {
    return deny(
      request,
      agentSafety,
      intent,
      section,
      requiredCapabilities,
    );
  }

  const toolSafety =
    assertStaticToolSafety(
      tool,
    );

  if (toolSafety) {
    return deny(
      request,
      toolSafety,
      intent,
      section,
      requiredCapabilities,
    );
  }

  /**
   * Explicit P0.8.3 binding.
   *
   * This is the primary agent -> tool policy relationship.
   */
  if (!agent.tools.includes(tool.id)) {
    return deny(
      request,
      "TOOL_NOT_BOUND_TO_AGENT",
      intent,
      section,
      requiredCapabilities,
    );
  }

  /**
   * All current agents expose a finite intent set.
   * Missing intent therefore fails closed.
   */
  if (
    agent.allowedIntents.length > 0 &&
    !intent
  ) {
    return deny(
      request,
      "AGENT_INTENT_REQUIRED",
      intent,
      section,
      requiredCapabilities,
    );
  }

  if (
    intent &&
    !agent.allowedIntents.includes(
      intent as PulseIntent,
    )
  ) {
    return deny(
      request,
      "AGENT_INTENT_NOT_ALLOWED",
      intent,
      section,
      requiredCapabilities,
    );
  }

  /**
   * Empty allowedSections means section-neutral.
   *
   * This is intentional for PULSE and A2A.
   */
  if (
    agent.allowedSections.length > 0
  ) {
    if (!section) {
      return deny(
        request,
        "AGENT_SECTION_REQUIRED",
        intent,
        section,
        requiredCapabilities,
      );
    }

    if (
      !agent.allowedSections.includes(
        section,
      )
    ) {
      return deny(
        request,
        "AGENT_SECTION_NOT_ALLOWED",
        intent,
        section,
        requiredCapabilities,
      );
    }
  }

  /**
   * Mirror the P0.8.2 tool-purpose invariant.
   */
  if (
    tool.kind === "PROPOSAL" &&
    purpose !== "PROPOSE"
  ) {
    return deny(
      request,
      "TOOL_PURPOSE_MISMATCH",
      intent,
      section,
      requiredCapabilities,
    );
  }

  /**
   * Capability checks are request-scoped.
   *
   * We deliberately do NOT require:
   *
   * tool.capabilities ⊆ agent.capabilities
   *
   * because that would invalidate legitimate P0.8.3
   * bindings already established in the current architecture.
   */
  const missingAgentCapabilities =
    requiredCapabilities.filter(
      (capability) =>
        !agent.capabilities.includes(
          capability,
        ),
    );

  if (
    missingAgentCapabilities.length > 0
  ) {
    return deny(
      request,
      "AGENT_CAPABILITY_NOT_DECLARED",
      intent,
      section,
      requiredCapabilities,
    );
  }

  const missingToolCapabilities =
    requiredCapabilities.filter(
      (capability) =>
        !tool.capabilities.includes(
          capability,
        ),
    );

  if (
    missingToolCapabilities.length > 0
  ) {
    return deny(
      request,
      "TOOL_CAPABILITY_NOT_DECLARED",
      intent,
      section,
      requiredCapabilities,
    );
  }

  return baseDecision(
    request,
    "ALLOW",
    ["POLICY_RESOLVED"],
    intent,
    section,
    requiredCapabilities,
  );
}

export function isPulseAgentToolPolicyAllowed(
  request:
    PulseAgentToolPolicyRequest,
): boolean {
  return (
    resolvePulseAgentToolPolicy(
      request,
    ).decision ===
    "ALLOW"
  );
}

export function assertPulseAgentToolPolicyAllowed(
  request:
    PulseAgentToolPolicyRequest,
): PulseAgentToolPolicyDecision {
  const result =
    resolvePulseAgentToolPolicy(
      request,
    );

  if (
    result.decision !==
    "ALLOW"
  ) {
    throw new Error(
      "PULSE_AGENT_TOOL_POLICY_DENIED:" +
        result.reasons.join(","),
    );
  }

  return result;
}

export function validatePulseAgentToolPolicyCatalog():
  readonly string[] {
  const errors: string[] = [];

  for (
    const agent
      of listPulseAgentDescriptors()
  ) {
    const agentSafety =
      assertStaticAgentSafety(
        agent,
      );

    if (agentSafety) {
      errors.push(
        "AGENT_INVALID:" +
          agent.id +
          ":" +
          agentSafety,
      );
    }

    for (
      const toolId
        of agent.tools
    ) {
      try {
        const tool =
          getPulseToolDescriptor(
            toolId,
          );

        const toolSafety =
          assertStaticToolSafety(
            tool,
          );

        if (toolSafety) {
          errors.push(
            "TOOL_INVALID:" +
              toolId +
              ":" +
              toolSafety,
          );
        }
      } catch {
        errors.push(
          "TOOL_UNKNOWN:" +
            agent.id +
            ":" +
            toolId,
        );
      }
    }
  }

  return Object.freeze([
    ...errors,
  ]);
}
