/**
 * PULSE Tool Registry — P0.8.0
 *
 * This registry describes the existing logical PULSE tool surface.
 *
 * IMPORTANT:
 * - Registry metadata is NOT execution authority.
 * - Registry metadata does NOT approve actions.
 * - Registry metadata does NOT execute tools.
 * - Governance remains the source of truth for risk/policy/approval.
 * - Executor remains the source of truth for controlled mutation.
 */

export const PULSE_TOOL_REGISTRY_CONTRACT = "p0.8.0" as const;

export type PulseToolKind =
  | "OBSERVATION"
  | "PROPOSAL";

export type PulseToolSideEffect =
  | "NONE";

export type PulseToolAuthority =
  | "NONE";

export type PulseToolInputShape =
  | "PulseInput"
  | "PulseFacts";

export type PulseToolDescriptor = {
  readonly contractVersion:
    typeof PULSE_TOOL_REGISTRY_CONTRACT;

  readonly id: string;

  /**
   * Exported implementation symbol currently providing
   * this logical tool.
   */
  readonly implementationExport: string;

  readonly kind: PulseToolKind;

  /**
   * P0.8.0 tools are observational/proposal-only.
   * Mutation authority belongs elsewhere.
   */
  readonly sideEffect: PulseToolSideEffect;

  /**
   * Explicit authority marker.
   *
   * This MUST remain NONE for registry metadata.
   */
  readonly authority: PulseToolAuthority;

  readonly capabilities: readonly string[];

  readonly input: Readonly<{
    shape: PulseToolInputShape;
  }>;

  readonly output: Readonly<{
    shape: string;
  }>;

  readonly source:
    | "pulse-tools";

  /**
   * true means deterministic for the same underlying
   * application snapshot and identical input.
   *
   * It does not mean the tool is globally pure:
   * tools may observe application state.
   */
  readonly deterministicForSameSnapshot: boolean;

  readonly description: string;
};

function descriptor(
  input: Omit<
    PulseToolDescriptor,
    | "contractVersion"
    | "sideEffect"
    | "authority"
  >,
): PulseToolDescriptor {
  return Object.freeze({
    ...input,
    contractVersion:
      PULSE_TOOL_REGISTRY_CONTRACT,
    sideEffect: "NONE",
    authority: "NONE",

    capabilities: Object.freeze([
      ...input.capabilities,
    ]),

    input: Object.freeze({
      ...input.input,
    }),

    output: Object.freeze({
      ...input.output,
    }),
  });
}

const DESCRIPTORS: readonly PulseToolDescriptor[] =
  Object.freeze([
    descriptor({
      id: "pulse.inspect",
      implementationExport:
        "toolInspect",
      kind: "OBSERVATION",
      capabilities: [
        "context.read",
        "canvas.read",
        "store.snapshot",
      ],
      input: {
        shape: "PulseInput",
      },
      output: {
        shape: "PulseFacts",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Reads the current PULSE/store snapshot and derives observable facts.",
    }),

    descriptor({
      id: "pulse.score",
      implementationExport:
        "toolScoreLine",
      kind: "OBSERVATION",
      capabilities: [
        "diagnostics.read",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "string",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Formats the current diagnostic score from an existing PulseFacts snapshot.",
    }),

    descriptor({
      id: "pulse.map",
      implementationExport:
        "toolMap",
      kind: "OBSERVATION",
      capabilities: [
        "canvas.read",
        "structure.read",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "string",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Maps the currently observed page/canvas structure.",
    }),

    descriptor({
      id: "pulse.nba",
      implementationExport:
        "toolNba",
      kind: "PROPOSAL",
      capabilities: [
        "recommendation.generate",
        "next_step.propose",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "PulseNextBestAction",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Produces a next-step recommendation from observed facts without applying it.",
    }),

    descriptor({
      id: "pulse.orders",
      implementationExport:
        "toolOrders",
      kind: "OBSERVATION",
      capabilities: [
        "orders.read",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "PulseToolResponse",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Produces the current order-oriented PULSE observation.",
    }),

    descriptor({
      id: "pulse.stock",
      implementationExport:
        "toolStock",
      kind: "OBSERVATION",
      capabilities: [
        "inventory.read",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "PulseToolResponse",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Produces the current inventory-oriented PULSE observation.",
    }),

    descriptor({
      id: "pulse.theme",
      implementationExport:
        "toolTheme",
      kind: "PROPOSAL",
      capabilities: [
        "design.observe",
        "design.propose",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "PulseToolResponse",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Produces a reversible theme proposal; it does not apply the change.",
    }),

    descriptor({
      id: "pulse.diff",
      implementationExport:
        "toolDiff",
      kind: "PROPOSAL",
      capabilities: [
        "design.compare",
        "design.propose",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "PulseToolResponse",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Produces a design diff/proposal without applying it.",
    }),

    descriptor({
      id: "pulse.range",
      implementationExport:
        "toolRange",
      kind: "OBSERVATION",
      capabilities: [
        "analytics.read",
        "range.compare",
      ],
      input: {
        shape: "PulseFacts",
      },
      output: {
        shape: "PulseToolResponse",
      },
      source: "pulse-tools",
      deterministicForSameSnapshot:
        true,
      description:
        "Produces range-oriented analytical output from the current PulseFacts.",
    }),
  ]);

const REGISTRY_BY_ID =
  new Map<string, PulseToolDescriptor>(
    DESCRIPTORS.map((item) => [
      item.id,
      item,
    ]),
  );

export const PULSE_TOOL_DESCRIPTORS =
  DESCRIPTORS;

export function listPulseToolDescriptors():
  readonly PulseToolDescriptor[] {
  return Object.freeze([
    ...PULSE_TOOL_DESCRIPTORS,
  ]);
}

export function getPulseToolDescriptor(
  toolId: string,
): PulseToolDescriptor {
  const normalized =
    String(toolId || "").trim();

  if (!normalized) {
    throw new Error(
      "PULSE_TOOL_ID_REQUIRED",
    );
  }

  const descriptor =
    REGISTRY_BY_ID.get(normalized);

  if (!descriptor) {
    throw new Error(
      "PULSE_TOOL_UNKNOWN:" +
        normalized,
    );
  }

  return descriptor;
}

export function isPulseToolKnown(
  toolId: string,
): boolean {
  const normalized =
    String(toolId || "").trim();

  if (!normalized) {
    return false;
  }

  return REGISTRY_BY_ID.has(
    normalized,
  );
}

export function assertPulseToolKnown(
  toolId: string,
): PulseToolDescriptor {
  return getPulseToolDescriptor(
    toolId,
  );
}
