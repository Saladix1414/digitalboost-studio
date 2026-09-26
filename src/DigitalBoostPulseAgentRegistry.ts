/**
 * PULSE Agent Registry — P0.8.3
 *
 * This registry formalizes the agent identities already present
 * in DigitalBoostPulseConst.ts.
 *
 * IMPORTANT:
 * - Registry metadata is NOT execution authority.
 * - Agent identity is NOT an approval.
 * - Agent capability binding is NOT an authorization.
 * - Agents cannot directly mutate application state.
 * - Governance remains the source of truth for policy/approval.
 * - Executor remains the source of truth for controlled mutation.
 * - P0.8.3 does NOT replace pickAgent().
 */

import type {
  PulseAgent,
  PulseIntent,
} from "./DigitalBoostPulseConst";

export const PULSE_AGENT_REGISTRY_CONTRACT =
  "p0.8.3" as const;

export type PulseAgentAuthority =
  | "NONE";

export type PulseAgentSideEffect =
  | "NONE";

export type PulseAgentDescriptor = {
  readonly contractVersion:
    typeof PULSE_AGENT_REGISTRY_CONTRACT;

  readonly id:
    PulseAgent;

  readonly displayName:
    string;

  readonly description:
    string;

  /**
   * Intents that are semantically compatible with
   * the current agent role.
   *
   * This metadata does not perform routing or authorization.
   */
  readonly allowedIntents:
    readonly PulseIntent[];

  /**
   * Sections explicitly associated with this role.
   *
   * Empty means no section restriction is declared
   * at this registry layer.
   */
  readonly allowedSections:
    readonly string[];

  /**
   * Capabilities are descriptive permissions/capability
   * labels only. They are not runtime authorization.
   */
  readonly capabilities:
    readonly string[];

  /**
   * Logical skills this role may compose.
   *
   * These are capability relationships, not execution grants.
   */
  readonly skills:
    readonly string[];

  /**
   * Tools that this agent role may reason about/use
   * through future governed boundaries.
   *
   * The registry itself does not invoke them.
   */
  readonly tools:
    readonly string[];

  readonly authority:
    PulseAgentAuthority;

  readonly sideEffect:
    PulseAgentSideEffect;

  /**
   * A2A is represented in the canonical type system as an
   * external-agent role. It remains non-authoritative.
   */
  readonly externalAgent:
    boolean;
};

function descriptor(
  input: Omit<
    PulseAgentDescriptor,
    | "contractVersion"
    | "authority"
    | "sideEffect"
  >,
): PulseAgentDescriptor {
  return Object.freeze({
    ...input,

    contractVersion:
      PULSE_AGENT_REGISTRY_CONTRACT,

    authority:
      "NONE",

    sideEffect:
      "NONE",

    allowedIntents:
      Object.freeze([
        ...input.allowedIntents,
      ]),

    allowedSections:
      Object.freeze([
        ...input.allowedSections,
      ]),

    capabilities:
      Object.freeze([
        ...input.capabilities,
      ]),

    skills:
      Object.freeze([
        ...input.skills,
      ]),

    tools:
      Object.freeze([
        ...input.tools,
      ]),
  });
}

const DESCRIPTORS:
  readonly PulseAgentDescriptor[] =
  Object.freeze([
    descriptor({
      id: "sales",
      displayName:
        "Sales",
      description:
        "Commerce-facing reasoning for catalog and recommendation-oriented intents.",
      allowedIntents: [
        "catalog",
        "recommendation",
      ],
      allowedSections: [
        "dashboard",
        "commerce",
        "products",
        "store-builder",
      ],
      capabilities: [
        "catalog.read",
        "recommendation.propose",
        "commerce.context.read",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
      ],
      tools: [
        "pulse.inspect",
        "pulse.orders",
        "pulse.stock",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "ops",
      displayName:
        "Operations",
      description:
        "Operational reasoning for analysis, orders and optimization.",
      allowedIntents: [
        "analysis",
        "order",
        "optimization",
      ],
      allowedSections: [
        "dashboard",
        "analytics",
        "orders",
        "operations",
      ],
      capabilities: [
        "operations.read",
        "analytics.read",
        "orders.read",
        "diagnostics.read",
        "optimization.propose",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
        "pulse.alerta",
      ],
      tools: [
        "pulse.inspect",
        "pulse.score",
        "pulse.orders",
        "pulse.range",
        "pulse.nba",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "sourcing",
      displayName:
        "Sourcing",
      description:
        "Inventory and supplier-oriented reasoning.",
      allowedIntents: [
        "supplier",
        "inventory",
      ],
      allowedSections: [
        "products",
        "inventory",
        "sourcing",
        "dashboard",
      ],
      capabilities: [
        "inventory.read",
        "supplier.research",
        "replenishment.propose",
        "commerce.context.read",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
        "pulse.alerta",
      ],
      tools: [
        "pulse.inspect",
        "pulse.stock",
        "pulse.nba",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "marketing",
      displayName:
        "Marketing",
      description:
        "Marketing, SEO and campaign-oriented reasoning.",
      allowedIntents: [
        "marketing",
      ],
      allowedSections: [
        "marketing",
        "seo",
        "campaigns",
        "dashboard",
      ],
      capabilities: [
        "marketing.read",
        "seo.read",
        "seo.propose",
        "campaign.propose",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
        "pulse.seo-fix",
      ],
      tools: [
        "pulse.inspect",
        "pulse.nba",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "cx",
      displayName:
        "Customer Experience",
      description:
        "Customer/support-oriented reasoning.",
      allowedIntents: [
        "support",
      ],
      allowedSections: [
        "customers",
        "support",
        "dashboard",
      ],
      capabilities: [
        "customer.read",
        "support.read",
        "support.propose",
      ],
      skills: [
        "pulse.briefing",
        "pulse.alerta",
      ],
      tools: [
        "pulse.inspect",
        "pulse.orders",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "design",
      displayName:
        "Design",
      description:
        "Builder and content/design reasoning.",
      allowedIntents: [
        "content",
      ],
      allowedSections: [
        "website-builder",
        "store-builder",
        "builder",
      ],
      capabilities: [
        "design.read",
        "design.compare",
        "design.propose",
        "content.propose",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
        "pulse.hero",
      ],
      tools: [
        "pulse.inspect",
        "pulse.map",
        "pulse.diff",
        "pulse.theme",
        "pulse.nba",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "pulse",
      displayName:
        "PULSE Core",
      description:
        "Default orchestration role when no specialized agent applies.",
      allowedIntents: [
        "information",
        "search",
        "analysis",
        "optimization",
        "recommendation",
        "content",
        "catalog",
        "marketing",
        "support",
      ],
      allowedSections: [],
      capabilities: [
        "orchestration.read",
        "context.read",
        "intent.read",
        "goal.read",
        "planning.propose",
        "governance.coordinate",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
        "pulse.alerta",
      ],
      tools: [
        "pulse.inspect",
        "pulse.score",
        "pulse.map",
        "pulse.nba",
        "pulse.range",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        false,
    }),

    descriptor({
      id: "a2a",
      displayName:
        "A2A External Agent",
      description:
        "External-agent integration role. P0.8.3 keeps this role non-authoritative and non-mutating.",
      allowedIntents: [
        "information",
        "search",
        "recommendation",
        "analysis",
      ],
      allowedSections: [],
      capabilities: [
        "a2a.receive",
        "a2a.propose",
        "external.context.read",
      ],
      skills: [
        "pulse.briefing",
        "pulse.plan",
      ],
      tools: [
        "pulse.inspect",
        "pulse.nba",
      ],
      authority:
        "NONE",
      sideEffect:
        "NONE",
      externalAgent:
        true,
    }),
  ]);

const REGISTRY_BY_ID =
  new Map<PulseAgent, PulseAgentDescriptor>(
    DESCRIPTORS.map((item) => [
      item.id,
      item,
    ]),
  );

export const PULSE_AGENT_DESCRIPTORS =
  DESCRIPTORS;

export function listPulseAgentDescriptors():
  readonly PulseAgentDescriptor[] {
  return Object.freeze([
    ...PULSE_AGENT_DESCRIPTORS,
  ]);
}

export function getPulseAgentDescriptor(
  agentId: PulseAgent,
): PulseAgentDescriptor {
  const normalized =
    String(agentId || "").trim() as PulseAgent;

  if (!normalized) {
    throw new Error(
      "PULSE_AGENT_ID_REQUIRED",
    );
  }

  const descriptor =
    REGISTRY_BY_ID.get(
      normalized,
    );

  if (!descriptor) {
    throw new Error(
      "PULSE_AGENT_UNKNOWN:" +
        normalized,
    );
  }

  return descriptor;
}

export function isPulseAgentKnown(
  agentId: string,
): agentId is PulseAgent {
  const normalized =
    String(agentId || "").trim();

  return REGISTRY_BY_ID.has(
    normalized as PulseAgent,
  );
}

export function assertPulseAgentKnown(
  agentId: string,
): PulseAgentDescriptor {
  return getPulseAgentDescriptor(
    agentId,
  );
}
