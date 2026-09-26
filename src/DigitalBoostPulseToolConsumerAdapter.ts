/**
 * PULSE Tool Consumer Adapter — P0.8.6
 *
 * Canonicalizes legacy/internal tool consumers onto:
 *
 *   Consumer Context
 *        ↓
 *   P0.8.4 Agent↔Tool Policy
 *        ↓
 *   P0.8.2 Tool Boundary
 *        ↓
 *   P0.8.5 Execution Evidence
 *        ↓
 *   Tool
 *
 * IMPORTANT:
 * - This module is NOT an execution authority.
 * - It is NOT approval.
 * - It is NOT an attestation.
 * - It is NOT proof.
 * - Tenant attribution remains non-authoritative.
 * - No direct tool implementation is called here.
 */

import type { PulseInput } from "./DigitalBoostPulseKB";
import {
  classifyIntent,
  pickAgent,
  type PulseAgent,
  type PulseIntent,
} from "./DigitalBoostPulseConst";
import { requestId as createPulseRequestId } from "./DigitalBoostPulseLog";
import {
  resolvePulseTenantAttribution,
  type PulseTenantAttributionSource,
} from "./DigitalBoostPulseTenant";
import {
  getPulseToolDescriptor,
  isPulseToolKnown,
} from "./DigitalBoostPulseToolRegistry";
import {
  invokePulseToolWithEvidence,
  type PulseToolExecutionEvidence,
} from "./DigitalBoostPulseToolExecutionEvidence";

export const PULSE_TOOL_CONSUMER_ADAPTER_CONTRACT = "p0.8.6";

export type PulseToolConsumerContextInput = {
  q?: string;
  section: string;
  store?: string;

  requestId?: string;
  tenantId?: unknown;

  agentId?: PulseAgent;
  intent?: PulseIntent;

  contextId?: string;
  contextVersion?: string;
};

export type PulseToolConsumerContext = {
  readonly contract: "p0.8.6";
  readonly requestId: string;
  readonly tenantId: string;
  readonly tenantSource: PulseTenantAttributionSource;
  readonly legacyTenant: boolean;

  readonly agentId: PulseAgent;
  readonly intent: PulseIntent;
  readonly section: string;

  readonly contextId?: string;
  readonly contextVersion?: string;
};

export type PulseToolConsumerInvocation<TOutput> = {
  readonly contract: "p0.8.6";
  readonly toolId: string;
  readonly purpose: "OBSERVE" | "PROPOSE";
  readonly toolKind: string;
  readonly context: PulseToolConsumerContext;
  readonly evidence: PulseToolExecutionEvidence;
  readonly output: TOutput;
};

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

function assertContextBinding(
  contextId: string | undefined,
  contextVersion: string | undefined,
): void {
  if (
    (contextId === undefined) !==
    (contextVersion === undefined)
  ) {
    throw new Error(
      "P0.8.6_CONTEXT_BINDING_INCOMPLETE",
    );
  }
}

export function createPulseToolConsumerContext(
  input: PulseToolConsumerContextInput,
): PulseToolConsumerContext {
  const section = clean(input.section);

  if (!section) {
    throw new Error("P0.8.6_SECTION_REQUIRED");
  }

  const q = clean(input.q) || "";

  const contextId = clean(input.contextId);
  const contextVersion = clean(input.contextVersion);

  assertContextBinding(
    contextId,
    contextVersion,
  );

  const intent =
    input.intent ||
    classifyIntent(
      q,
      section,
    );

  const agentId =
    input.agentId ||
    pickAgent(
      intent,
      section,
    );

  const tenant = resolvePulseTenantAttribution({
    explicitTenantId:
      input.tenantId,
  });

  const resolvedRequestId =
    clean(input.requestId) ||
    createPulseRequestId();

  return {
    contract:
      PULSE_TOOL_CONSUMER_ADAPTER_CONTRACT,
    requestId: resolvedRequestId,
    tenantId: tenant.tenantId,
    tenantSource: tenant.source,
    legacyTenant: tenant.legacy,
    agentId,
    intent,
    section,
    contextId,
    contextVersion,
  };
}

export function createPulseToolConsumerContextFromInput(
  input: PulseInput,
  overrides: Partial<
    PulseToolConsumerContextInput
  > = {},
): PulseToolConsumerContext {
  return createPulseToolConsumerContext({
    q: input.q,
    section: input.section,
    store: input.store,
    requestId: input.requestId,
    tenantId: input.tenantId,
    contextId: input.contextId,
    contextVersion:
      input.contextVersion,
    ...overrides,
  });
}

export function invokePulseToolForConsumer<
  TOutput = unknown,
>(
  context: PulseToolConsumerContext,
  toolId: string,
  input?: unknown,
): PulseToolConsumerInvocation<TOutput> {
  if (
    context.contract !==
    PULSE_TOOL_CONSUMER_ADAPTER_CONTRACT
  ) {
    throw new Error(
      "P0.8.6_INVALID_CONTEXT_CONTRACT",
    );
  }

  if (!isPulseToolKnown(toolId)) {
    throw new Error(
      "P0.8.6_UNKNOWN_TOOL:" +
        String(toolId),
    );
  }

  const descriptor =
    getPulseToolDescriptor(toolId);

  if (
    descriptor.authority !== "NONE" ||
    descriptor.sideEffect !== "NONE"
  ) {
    throw new Error(
      "P0.8.6_TOOL_AUTHORITY_OR_SIDE_EFFECT_VIOLATION:" +
        String(toolId),
    );
  }

  const purpose =
    descriptor.kind === "PROPOSAL"
      ? "PROPOSE"
      : "OBSERVE";

  const invocation =
    invokePulseToolWithEvidence({
      agentId:
        context.agentId,
      toolId,
      purpose,
      requestId:
        context.requestId,
      tenantId:
        context.tenantId,
      intent:
        context.intent,
      section:
        context.section,
      contextId:
        context.contextId,
      contextVersion:
        context.contextVersion,
      input,
    });

  return {
    contract:
      PULSE_TOOL_CONSUMER_ADAPTER_CONTRACT,
    toolId,
    purpose,
    toolKind:
      descriptor.kind,
    context,
    evidence:
      invocation.evidence,
    output:
      invocation.output as TOutput,
  };
}
