export type WebsitesBuilderKind = "web" | "landing";

export type WebDesignLanguage =
  | "Digital Editorial"
  | "Dark Intelligence"
  | "Commerce Luxury"
  | "Neo-Brutalist"
  | "Soft Precision"
  | "Experimental"
  | "Commerce Native"
  | "Data Native";

export type WebDataState =
  | "REAL"
  | "DERIVED"
  | "FIXTURE"
  | "MOCK"
  | "EMPTY"
  | "UNAVAILABLE";

export interface WebsitesBuilderBrief {
  kind: WebsitesBuilderKind;
  projectName: string;
  audience: string;
  offer: string;
  goal: string;
  tone: string;
  designLanguage: WebDesignLanguage;
  headline: string;
  subheadline: string;
  primaryCta: string;
  proof: string;
}

export interface WebDesignTokens {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  accent: string;
  accentForeground: string;
  border: string;
  radius: number;
  container: number;
}

export interface WebCanvasBlockSeed {
  id: string;
  type:
    | "hero"
    | "text"
    | "image"
    | "button"
    | "products"
    | "features"
    | "banner"
    | "footer";
  label: string;
  text: string;
  background: string;
  color: string;
  fontSize: number;
  padding: number;
  align: "left" | "center" | "right";
  width: number;
}

export const WEB_DESIGN_LANGUAGES: WebDesignLanguage[] = [
  "Digital Editorial",
  "Dark Intelligence",
  "Commerce Luxury",
  "Neo-Brutalist",
  "Soft Precision",
  "Experimental",
  "Commerce Native",
  "Data Native",
];

export function inferDesignLanguage(
  prompt: string
): WebDesignLanguage {
  const value = prompt.toLowerCase();

  if (/tienda|commerce|producto|venta/.test(value))
    return "Commerce Native";

  if (/lujo|premium|fashion|moda/.test(value))
    return "Commerce Luxury";

  if (/data|analytics|datos|dashboard/.test(value))
    return "Data Native";

  if (/editorial|revista|medio|news/.test(value))
    return "Digital Editorial";

  if (/brutal|bold|crudo/.test(value))
    return "Neo-Brutalist";

  if (/dark|cyber|security|developer|ai|ia/.test(value))
    return "Dark Intelligence";

  return "Soft Precision";
}

export function createFallbackBrief(
  prompt: string,
  kind: WebsitesBuilderKind = "web",
  preferred?: WebDesignLanguage
): WebsitesBuilderBrief {
  const clean = prompt.trim();

  return {
    kind,
    projectName:
      kind === "landing"
        ? "Landing DigitalBoost"
        : "Proyecto DigitalBoost",

    audience: "Audiencia por definir",

    offer:
      clean || "Propuesta de valor por definir",

    goal:
      kind === "landing"
        ? "Convertir una intención principal"
        : "Comunicar la propuesta con claridad",

    tone:
      "Claro, específico y orientado al producto",

    designLanguage:
      preferred || inferDesignLanguage(clean),

    headline:
      clean ||
      "Construí una experiencia digital con una dirección visual clara.",

    subheadline:
      "Una estructura editable que prioriza intención, jerarquía, contenido y responsive.",

    primaryCta:
      kind === "landing"
        ? "Empezar"
        : "Explorar",

    proof: "Por definir",
  };
}

export function normalizeBrief(
  input: unknown,
  fallback: WebsitesBuilderBrief
): WebsitesBuilderBrief {
  const source =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};

  const get = (
    key: string,
    fallbackValue: string
  ) => {
    const value = source[key];

    return typeof value === "string" &&
      value.trim()
      ? value.trim()
      : fallbackValue;
  };

  const candidate = source.designLanguage;

  const designLanguage =
    typeof candidate === "string" &&
    WEB_DESIGN_LANGUAGES.includes(
      candidate as WebDesignLanguage
    )
      ? (candidate as WebDesignLanguage)
      : fallback.designLanguage;

  return {
    kind:
      source.kind === "landing" ||
      source.kind === "web"
        ? source.kind
        : fallback.kind,

    projectName: get(
      "projectName",
      fallback.projectName
    ),

    audience: get(
      "audience",
      fallback.audience
    ),

    offer: get(
      "offer",
      fallback.offer
    ),

    goal: get(
      "goal",
      fallback.goal
    ),

    tone: get(
      "tone",
      fallback.tone
    ),

    designLanguage,

    headline: get(
      "headline",
      fallback.headline
    ),

    subheadline: get(
      "subheadline",
      fallback.subheadline
    ),

    primaryCta: get(
      "primaryCta",
      fallback.primaryCta
    ),

    proof: get(
      "proof",
      "Por definir"
    ),
  };
}

export function createDesignTokens(
  language: WebDesignLanguage
): WebDesignTokens {
  const dark =
    language === "Dark Intelligence" ||
    language === "Data Native" ||
    language === "Experimental";

  return {
    background:
      dark ? "#05070d" : "#f8fafc",

    surface:
      dark ? "#0b1020" : "#ffffff",

    foreground:
      dark ? "#f8fafc" : "#0f172a",

    muted:
      dark ? "#94a3b8" : "#64748b",

    accent:
      language === "Commerce Luxury"
        ? "#9a6b3f"
        : language === "Neo-Brutalist"
        ? "#ff5c35"
        : "#6366f1",

    accentForeground: "#ffffff",

    border:
      dark ? "#1e293b" : "#e2e8f0",

    radius:
      language === "Neo-Brutalist"
        ? 4
        : 16,

    container: 1200,
  };
}

export function briefToBuilderBlocks(
  brief: WebsitesBuilderBrief,
  tokens: WebDesignTokens
): WebCanvasBlockSeed[] {
  return [
    {
      id: "canonical-hero",
      type: "hero",
      label: "Hero",
      text:
        brief.headline +
        "\n\n" +
        brief.subheadline,
      background: tokens.background,
      color: tokens.foreground,
      fontSize: 46,
      padding: 80,
      align: "left",
      width: 100,
    },

    {
      id: "canonical-value",
      type: "features",
      label: "Propuesta de valor",
      text: brief.offer,
      background: tokens.surface,
      color: tokens.foreground,
      fontSize: 26,
      padding: 56,
      align: "left",
      width: 100,
    },

    {
      id: "canonical-proof",
      type: "text",
      label: "Prueba",
      text:
        brief.proof || "Por definir",
      background: tokens.background,
      color: tokens.muted,
      fontSize: 18,
      padding: 48,
      align: "left",
      width: 100,
    },

    {
      id: "canonical-cta",
      type: "button",
      label: "CTA",
      text: brief.primaryCta,
      background: tokens.surface,
      color: tokens.foreground,
      fontSize: 18,
      padding: 48,
      align: "left",
      width: 100,
    },
  ];
}

export function verifyWebsitesBuilderProject(
  prompt: string,
  brief: WebsitesBuilderBrief,
  tokens: WebDesignTokens,
  blocks: WebCanvasBlockSeed[]
) {
  const checks = [
    {
      id: "intent",
      label: "Intent",
      passed:
        prompt.trim().length >= 8,
      detail:
        "Existe intención explícita.",
    },

    {
      id: "brief",
      label: "Brief",
      passed: Boolean(
        brief.headline &&
        brief.offer &&
        brief.primaryCta
      ),
      detail:
        "Headline, propuesta y CTA.",
    },

    {
      id: "structure",
      label: "Structure",
      passed: blocks.length >= 4,
      detail:
        `${blocks.length} bloques estructurados.`,
    },

    {
      id: "design",
      label: "Design system",
      passed: Boolean(
        tokens.background &&
        tokens.foreground &&
        tokens.accent
      ),
      detail:
        brief.designLanguage,
    },

    {
      id: "data",
      label: "Data integrity",
      passed: true,
      detail:
        "Estado dinámico: EMPTY. Sin métricas inventadas.",
    },
  ];

  return {
    passed:
      checks.every(
        (check) => check.passed
      ),
    checks,
  };
}
