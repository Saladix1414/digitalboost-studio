/**
 * PULSE Skill Registry — P0.8.1
 *
 * Skills are compositional reasoning/capability units.
 *
 * IMPORTANT:
 * - Registry metadata is NOT execution authority.
 * - Registry metadata does NOT approve actions.
 * - Registry metadata does NOT mutate application state.
 * - Governance remains the source of truth for policy/approval.
 * - Executor remains the source of truth for controlled mutation.
 */

export const PULSE_SKILL_REGISTRY_CONTRACT =
  "p0.8.1" as const;

export type PulseSkillKind =
  | "COMPOSITE"
  | "PROPOSAL";

export type PulseSkillAuthority =
  | "NONE";

export type PulseSkillSideEffect =
  | "NONE";

export type PulseSkillInputShape =
  | "PulseInput";

export type PulseSkillDescriptor = {
  readonly contractVersion:
    typeof PULSE_SKILL_REGISTRY_CONTRACT;

  readonly id: string;

  /**
   * Exported implementation symbol currently
   * providing this logical skill.
   */
  readonly implementationExport: string;

  readonly kind: PulseSkillKind;

  /**
   * Skills registered in P0.8.1 do not execute
   * application mutations themselves.
   */
  readonly sideEffect:
    PulseSkillSideEffect;

  /**
   * Explicit authority marker.
   */
  readonly authority:
    PulseSkillAuthority;

  readonly capabilities:
    readonly string[];

  /**
   * Logical dependencies exposed as stable IDs.
   *
   * These identify capabilities/tools the skill may
   * consume; they do not grant execution permission.
   */
  readonly dependencies:
    readonly string[];

  readonly input: Readonly<{
    shape: PulseSkillInputShape;
  }>;

  readonly output: Readonly<{
    shape: string;
  }>;

  readonly source:
    | "pulse-skills";

  /**
   * Skill IDs are intended to remain stable even when
   * implementation details change.
   */
  readonly description: string;
};

function descriptor(
  input: Omit<
    PulseSkillDescriptor,
    | "contractVersion"
    | "sideEffect"
    | "authority"
  >,
): PulseSkillDescriptor {
  return Object.freeze({
    ...input,

    contractVersion:
      PULSE_SKILL_REGISTRY_CONTRACT,

    sideEffect:
      "NONE",

    authority:
      "NONE",

    capabilities: Object.freeze([
      ...input.capabilities,
    ]),

    dependencies: Object.freeze([
      ...input.dependencies,
    ]),

    input: Object.freeze({
      ...input.input,
    }),

    output: Object.freeze({
      ...input.output,
    }),
  });
}

const DESCRIPTORS:
  readonly PulseSkillDescriptor[] =
  Object.freeze([
    descriptor({
      id: "pulse.briefing",
      implementationExport:
        "skillBriefing",
      kind: "COMPOSITE",
      capabilities: [
        "context.read",
        "diagnostics.read",
        "recommendation.generate",
      ],
      dependencies: [
        "pulse.inspect",
        "pulse.score",
      ],
      input: {
        shape: "PulseInput",
      },
      output: {
        shape: "PulseDecisionLike",
      },
      source: "pulse-skills",
      description:
        "Builds a concise operational briefing from current context and observable PULSE facts.",
    }),

    descriptor({
      id: "pulse.plan",
      implementationExport:
        "skillPlan",
      kind: "COMPOSITE",
      capabilities: [
        "context.read",
        "planning.propose",
        "recommendation.generate",
      ],
      dependencies: [
        "pulse.inspect",
        "pulse.nba",
      ],
      input: {
        shape: "PulseInput",
      },
      output: {
        shape: "PulseDecisionLike",
      },
      source: "pulse-skills",
      description:
        "Produces a proposed action sequence without granting execution authority.",
    }),

    descriptor({
      id: "pulse.alerta",
      implementationExport:
        "skillAlerta",
      kind: "COMPOSITE",
      capabilities: [
        "context.read",
        "diagnostics.read",
        "risk.detect",
      ],
      dependencies: [
        "pulse.inspect",
        "pulse.score",
      ],
      input: {
        shape: "PulseInput",
      },
      output: {
        shape: "PulseDecisionLike",
      },
      source: "pulse-skills",
      description:
        "Surfaces operational alerts from observed PULSE state without applying changes.",
    }),

    descriptor({
      id: "pulse.hero",
      implementationExport:
        "skillHero",
      kind: "PROPOSAL",
      capabilities: [
        "context.read",
        "design.observe",
        "design.propose",
      ],
      dependencies: [
        "pulse.inspect",
        "pulse.diff",
      ],
      input: {
        shape: "PulseInput",
      },
      output: {
        shape: "PulseDecisionLike",
      },
      source: "pulse-skills",
      description:
        "Produces a hero-content proposal for the builder; application remains outside the skill.",
    }),

    descriptor({
      id: "pulse.seo-fix",
      implementationExport:
        "skillSeoFix",
      kind: "PROPOSAL",
      capabilities: [
        "seo.read",
        "seo.diagnose",
        "seo.propose",
      ],
      dependencies: [],
      input: {
        shape: "PulseInput",
      },
      output: {
        shape: "PulseDecisionLike",
      },
      source: "pulse-skills",
      description:
        "Produces an SEO remediation proposal without directly applying the fix.",
    }),
  ]);

const REGISTRY_BY_ID =
  new Map<string, PulseSkillDescriptor>(
    DESCRIPTORS.map((item) => [
      item.id,
      item,
    ]),
  );

export const PULSE_SKILL_DESCRIPTORS =
  DESCRIPTORS;

export function listPulseSkillDescriptors():
  readonly PulseSkillDescriptor[] {
  return Object.freeze([
    ...PULSE_SKILL_DESCRIPTORS,
  ]);
}

export function getPulseSkillDescriptor(
  skillId: string,
): PulseSkillDescriptor {
  const normalized =
    String(skillId || "").trim();

  if (!normalized) {
    throw new Error(
      "PULSE_SKILL_ID_REQUIRED",
    );
  }

  const descriptor =
    REGISTRY_BY_ID.get(normalized);

  if (!descriptor) {
    throw new Error(
      "PULSE_SKILL_UNKNOWN:" +
        normalized,
    );
  }

  return descriptor;
}

export function isPulseSkillKnown(
  skillId: string,
): boolean {
  const normalized =
    String(skillId || "").trim();

  if (!normalized) {
    return false;
  }

  return REGISTRY_BY_ID.has(
    normalized,
  );
}

export function assertPulseSkillKnown(
  skillId: string,
): PulseSkillDescriptor {
  return getPulseSkillDescriptor(
    skillId,
  );
}
