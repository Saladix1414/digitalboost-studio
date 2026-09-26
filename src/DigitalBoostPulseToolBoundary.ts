/**
 * PULSE Tool Invocation Boundary — P0.8.2
 *
 * This is the canonical invocation boundary for registered PULSE tools.
 *
 * Security rules:
 * - A tool must exist in the canonical Tool Registry.
 * - Required capabilities must be declared by the tool.
 * - Proposal tools require PROPOSE purpose.
 * - Observation tools may be used for OBSERVE or PROPOSE.
 * - A registry entry with authority or side effects is rejected.
 * - The boundary never grants approval or execution authority.
 * - The returned invocation result never exposes the handler.
 */

import {
  getPulseToolDescriptor,
  type PulseToolDescriptor,
} from "./DigitalBoostPulseToolRegistry";

import {
  toolDiff,
  toolInspect,
  toolMap,
  toolNba,
  toolOrders,
  toolRange,
  toolScoreLine,
  toolStock,
  toolTheme,
} from "./DigitalBoostPulseTools";

export const PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT =
  "p0.8.2" as const;

export type PulseToolInvocationPurpose =
  | "OBSERVE"
  | "PROPOSE";

export type PulseToolInvocationRequest = {
  readonly toolId: string;

  readonly purpose?: PulseToolInvocationPurpose;

  readonly requiredCapabilities?:
    readonly string[];

  readonly input?: unknown;
};

export type PulseToolInvocationResult<
  T = unknown,
> = {
  readonly contract:
    typeof PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT;

  readonly toolId: string;

  readonly implementationExport: string;

  readonly purpose:
    PulseToolInvocationPurpose;

  readonly output: T;

  readonly sideEffect: "NONE";

  readonly authority: "NONE";

  /**
   * Confirms that the registry contract was validated
   * immediately before invocation.
   */
  readonly registryValidated: true;
};

type PulseToolHandler =
  (input: unknown) => unknown;

const HANDLERS:
  Readonly<
    Record<
      string,
      PulseToolHandler
    >
  > =
  Object.freeze({
    "pulse.inspect":
      (input) =>
        toolInspect(
          input as
            | {
                store?: string;
                range?: string;
                live?: boolean;
              }
            | undefined,
        ),

    "pulse.score":
      (input) =>
        toolScoreLine(
          input as Parameters<
            typeof toolScoreLine
          >[0],
        ),

    "pulse.map":
      (input) =>
        toolMap(
          input as Parameters<
            typeof toolMap
          >[0],
        ),

    "pulse.nba":
      (input) =>
        toolNba(
          input as Parameters<
            typeof toolNba
          >[0],
        ),

    "pulse.orders":
      (input) =>
        toolOrders(
          input as Parameters<
            typeof toolOrders
          >[0],
        ),

    "pulse.stock":
      (input) =>
        toolStock(
          input as Parameters<
            typeof toolStock
          >[0],
        ),

    "pulse.theme":
      (input) =>
        toolTheme(
          input as Parameters<
            typeof toolTheme
          >[0],
        ),

    "pulse.diff":
      (input) =>
        toolDiff(
          input as Parameters<
            typeof toolDiff
          >[0],
        ),

    "pulse.range":
      (input) =>
        toolRange(
          input as Parameters<
            typeof toolRange
          >[0],
        ),
  });

function normalizeRequiredCapabilities(
  capabilities?: readonly string[],
): readonly string[] {
  return Object.freeze(
    [
      ...new Set(
        (capabilities || [])
          .map((capability) =>
            String(
              capability,
            ).trim(),
          )
          .filter(Boolean),
      ),
    ].sort(),
  );
}

function assertBoundaryCompatible(
  descriptor: PulseToolDescriptor,
  purpose: PulseToolInvocationPurpose,
  requiredCapabilities:
    readonly string[],
): void {
  if (
    descriptor.sideEffect !==
      "NONE"
  ) {
    throw new Error(
      "PULSE_TOOL_SIDE_EFFECT_NOT_ALLOWED:" +
        descriptor.id,
    );
  }

  if (
    descriptor.authority !==
      "NONE"
  ) {
    throw new Error(
      "PULSE_TOOL_AUTHORITY_NOT_ALLOWED:" +
        descriptor.id,
    );
  }

  if (
    descriptor.kind ===
      "PROPOSAL" &&
    purpose !== "PROPOSE"
  ) {
    throw new Error(
      "PULSE_TOOL_PURPOSE_MISMATCH:" +
        descriptor.id +
        ":PROPOSE_REQUIRED",
    );
  }

  const missing =
    requiredCapabilities.filter(
      (capability) =>
        !descriptor.capabilities.includes(
          capability,
        ),
    );

  if (missing.length > 0) {
    throw new Error(
      "PULSE_TOOL_CAPABILITY_MISMATCH:" +
        descriptor.id +
        ":" +
        missing.join(","),
    );
  }
}

function resolveHandler(
  descriptor: PulseToolDescriptor,
): PulseToolHandler {
  const handler =
    HANDLERS[
      descriptor.id
    ];

  if (
    typeof handler !==
    "function"
  ) {
    throw new Error(
      "PULSE_TOOL_HANDLER_UNAVAILABLE:" +
        descriptor.id,
    );
  }

  return handler;
}

export function invokePulseTool<
  T = unknown,
>(
  request:
    PulseToolInvocationRequest,
): PulseToolInvocationResult<T> {
  const toolId =
    String(
      request?.toolId ||
        "",
    ).trim();

  if (!toolId) {
    throw new Error(
      "PULSE_TOOL_ID_REQUIRED",
    );
  }

  const descriptor =
    getPulseToolDescriptor(
      toolId,
    );

  const purpose =
    request.purpose ||
    "OBSERVE";

  const requiredCapabilities =
    normalizeRequiredCapabilities(
      request.requiredCapabilities,
    );

  assertBoundaryCompatible(
    descriptor,
    purpose,
    requiredCapabilities,
  );

  const handler =
    resolveHandler(
      descriptor,
    );

  let output: unknown;

  try {
    output =
      handler(
        request.input,
      );
  } catch (error) {
    throw new Error(
      "PULSE_TOOL_INVOCATION_FAILED:" +
        descriptor.id,
      {
        cause:
          error,
      },
    );
  }

  return Object.freeze({
    contract:
      PULSE_TOOL_INVOCATION_BOUNDARY_CONTRACT,

    toolId:
      descriptor.id,

    implementationExport:
      descriptor.implementationExport,

    purpose,

    output: output as T,

    sideEffect:
      "NONE",

    authority:
      "NONE",

    registryValidated:
      true,
  });
}

export function isPulseToolInvocable(
  request:
    PulseToolInvocationRequest,
): boolean {
  try {
    const toolId =
      String(
        request?.toolId ||
          "",
      ).trim();

    if (!toolId) {
      return false;
    }

    const descriptor =
      getPulseToolDescriptor(
        toolId,
      );

    assertBoundaryCompatible(
      descriptor,
      request.purpose ||
        "OBSERVE",
      normalizeRequiredCapabilities(
        request.requiredCapabilities,
      ),
    );

    resolveHandler(
      descriptor,
    );

    return true;
  } catch {
    return false;
  }
}
