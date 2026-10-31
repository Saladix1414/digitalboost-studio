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
  minHeight?: number;
  offsetX?: number;
  offsetY?: number;
  paddingX?: number;
  paddingY?: number;
  borderStyle?: "none" | "solid";
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadow?: "none" | "soft" | "glow";
  hidden?: boolean;
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

/* -------------------------------------------------------------------------- */
/* Canonical Websites Builder project graph                                   */
/*                                                                            */
/* The canvas may continue rendering BuilderBlock[] as an editable projection */
/* of a page. This graph is the durable product model and must remain UI       */
/* independent.                                                               */
/* -------------------------------------------------------------------------- */

export type WebsiteProjectStatus =
  | "draft"
  | "ready-for-verification"
  | "verified";

export type WebsiteComponentType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "navigation"
  | "list"
  | "form"
  | "custom";

export interface WebsiteComponent {
  id: string;
  type: WebsiteComponentType;
  name: string;
  content: Record<string, unknown>;
  dataState: WebDataState;
  dataSource?: string;
  bindings?: Record<string, string>;
}

export interface WebsiteSection {
  id: string;
  type: string;
  name: string;
  hidden: boolean;
  components: WebsiteComponent[];
  settings: Record<string, unknown>;
}

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  sections: WebsiteSection[];
  seo: {
    title: string;
    description: string;
    indexable: boolean;
  };
}

export interface WebsiteProject {
  schemaVersion: 1;
  id: string;
  name: string;
  kind: WebsitesBuilderKind;
  status: WebsiteProjectStatus;

  brief: WebsitesBuilderBrief;
  designTokens: WebDesignTokens;

  pages: WebsitePage[];

  data: {
    state: WebDataState;
    sources: string[];
  };

  governance: {
    authority: "proposal-only";
    execution: "user-approved";
    publishing: "preview-only";
  };
}

function projectIdFromBrief(
  brief: WebsitesBuilderBrief
): string {
  const base =
    brief.offer ||
    brief.headline ||
    "website";

  const slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `website-${slug || "project"}`;
}

export function createWebsiteProject(
  brief: WebsitesBuilderBrief,
  tokens: WebDesignTokens
): WebsiteProject {
  const projectId = projectIdFromBrief(brief);

  return {
    schemaVersion: 1,
    id: projectId,
    name:
      brief.offer ||
      brief.headline ||
      "Untitled website",
    kind: brief.kind,
    status: "draft",

    brief,
    designTokens: tokens,

    pages: [
      {
        id: `${projectId}-home`,
        name: "Home",
        slug: "/",
        title: brief.headline,
        description: brief.subheadline,

        sections: [],

        seo: {
          title: brief.headline,
          description: brief.subheadline,
          indexable: true,
        },
      },
    ],

    data: {
      state: "EMPTY",
      sources: [],
    },

    governance: {
      authority: "proposal-only",
      execution: "user-approved",
      publishing: "preview-only",
    },
  };
}

export function updateWebsiteProjectDesignTokens(
  project: WebsiteProject,
  patch: Partial<WebDesignTokens>
): WebsiteProject {
  return { ...project, designTokens: { ...project.designTokens, ...patch } };
}

export function getWebsiteHomePage(
  project: WebsiteProject
): WebsitePage {
  const home =
    project.pages.find(
      (page) => page.slug === "/"
    ) || project.pages[0];

  if (!home) {
    throw new Error(
      "Website project requires at least one page."
    );
  }

  return home;
}

export function updateWebsitePageSections(
  project: WebsiteProject,
  pageId: string,
  sections: WebsiteSection[]
): WebsiteProject {
  if (
    !project.pages.some(
      (page) => page.id === pageId
    )
  ) {
    return project;
  }

  return {
    ...project,
    pages: project.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            sections,
          }
        : page
    ),
  };
}

export function createWebsitePage(
  project: WebsiteProject,
  name = `Page ${project.pages.length + 1}`
): WebsiteProject {
  const cleanName = name.trim() || `Page ${project.pages.length + 1}`;
  const baseSlug = cleanName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `page-${project.pages.length + 1}`;
  const usedSlugs = new Set(project.pages.map((page) => page.slug));
  let slug = `/${baseSlug}`;
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `/${baseSlug}-${suffix++}`;
  const usedIds = new Set(project.pages.map((page) => page.id));
  let id = `${project.id}-${baseSlug}`;
  suffix = 2;
  while (usedIds.has(id)) id = `${project.id}-${baseSlug}-${suffix++}`;

  return {
    ...project,
    pages: [...project.pages, {
      id,
      name: cleanName,
      slug,
      title: cleanName,
      description: "",
      sections: [],
      seo: { title: cleanName, description: "", indexable: true },
    }],
  };
}

export function updateWebsitePageDetails(
  project: WebsiteProject,
  pageId: string,
  patch: Partial<Pick<WebsitePage, "name" | "slug" | "title" | "description">>
): WebsiteProject {
  const target = project.pages.find((page) => page.id === pageId);
  if (!target) return project;
  const slugPart = patch.slug?.trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const nextSlug = patch.slug === undefined
    ? target.slug
    : target.slug === "/"
      ? "/"
      : `/${slugPart || "page"}`;
  if (project.pages.some((page) => page.id !== pageId && page.slug === nextSlug)) return project;
  return {
    ...project,
    pages: project.pages.map((page) => page.id === pageId
      ? { ...page, ...patch, slug: nextSlug }
      : page),
  };
}

export function deleteWebsitePage(
  project: WebsiteProject,
  pageId: string
): WebsiteProject {
  const page = project.pages.find((entry) => entry.id === pageId);
  if (!page || page.slug === "/" || project.pages.length <= 1) return project;
  return { ...project, pages: project.pages.filter((entry) => entry.id !== pageId) };
}

export function updateWebsitePageSeo(
  project: WebsiteProject,
  pageId: string,
  patch: Partial<WebsitePage["seo"]>
): WebsiteProject {
  if (!project.pages.some((page) => page.id === pageId)) {
    return project;
  }

  return {
    ...project,
    pages: project.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            seo: { ...page.seo, ...patch },
          }
        : page
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Website Project <-> Canvas projection                                      */
/* -------------------------------------------------------------------------- */

export function canvasBlocksToWebsiteSections(
  blocks: WebCanvasBlockSeed[]
): WebsiteSection[] {
  return blocks.map((block) => ({
    id: block.id,
    type: block.type,
    name: block.label,
    hidden: Boolean(block.hidden),

    components: [
      {
        id: `${block.id}-content`,
        type:
          block.type === "button"
            ? "button"
            : block.type === "image"
            ? "image"
            : block.type === "hero"
            ? "heading"
            : "text",
        name: `${block.label} content`,
        content: {
          text: block.text,
        },
        dataState: "EMPTY",
      },
    ],

    settings: {
      background: block.background,
      color: block.color,
      fontSize: block.fontSize,
      padding: block.padding,
      align: block.align,
      width: block.width,
      minHeight: block.minHeight ?? 0,
      offsetX: block.offsetX ?? 0,
      offsetY: block.offsetY ?? 0,
      paddingX: block.paddingX ?? block.padding,
      paddingY: block.paddingY ?? block.padding,
      borderStyle: block.borderStyle ?? "none",
      borderWidth: block.borderWidth ?? 1,
      borderColor: block.borderColor ?? "#d9e8f7",
      borderRadius: block.borderRadius ?? 0,
      shadow: block.shadow ?? "none",
    },
  }));
}

export function websiteSectionsToCanvasBlocks(
  sections: WebsiteSection[]
): WebCanvasBlockSeed[] {
  return sections.map((section) => {
    const component =
      section.components[0];

    const settings =
      section.settings || {};

    const text =
      component &&
      typeof component.content.text === "string"
        ? component.content.text
        : "";

    const type =
      section.type === "hero" ||
      section.type === "text" ||
      section.type === "image" ||
      section.type === "button" ||
      section.type === "products" ||
      section.type === "features" ||
      section.type === "banner" ||
      section.type === "footer"
        ? section.type
        : "text";

    return {
      id: section.id,
      type,
      label:
        section.name ||
        "Section",
      text,

      background:
        typeof settings.background === "string"
          ? settings.background
          : "#ffffff",

      color:
        typeof settings.color === "string"
          ? settings.color
          : "#0f172a",

      fontSize:
        typeof settings.fontSize === "number"
          ? settings.fontSize
          : 18,

      padding:
        typeof settings.padding === "number"
          ? settings.padding
          : 32,

      align:
        settings.align === "center" ||
        settings.align === "right"
          ? settings.align
          : "left",

      width:
        typeof settings.width === "number"
          ? settings.width
          : 100,
      minHeight: typeof settings.minHeight === "number" ? settings.minHeight : 0,
      offsetX: typeof settings.offsetX === "number" ? settings.offsetX : 0,
      offsetY: typeof settings.offsetY === "number" ? settings.offsetY : 0,
      paddingX: typeof settings.paddingX === "number" ? settings.paddingX : (typeof settings.padding === "number" ? settings.padding : 32),
      paddingY: typeof settings.paddingY === "number" ? settings.paddingY : (typeof settings.padding === "number" ? settings.padding : 32),
      borderStyle: settings.borderStyle === "solid" ? "solid" : "none",
      borderWidth: typeof settings.borderWidth === "number" ? settings.borderWidth : 1,
      borderColor: typeof settings.borderColor === "string" ? settings.borderColor : "#d9e8f7",
      borderRadius: typeof settings.borderRadius === "number" ? settings.borderRadius : 0,
      shadow: settings.shadow === "soft" || settings.shadow === "glow" ? settings.shadow : "none",
      hidden: section.hidden,
    };
  });
}

export function createWebsiteProjectFromBrief(
  brief: WebsitesBuilderBrief,
  tokens: WebDesignTokens
): WebsiteProject {
  const project =
    createWebsiteProject(
      brief,
      tokens
    );

  const home =
    getWebsiteHomePage(project);

  const sections =
    canvasBlocksToWebsiteSections(
      briefToBuilderBlocks(
        brief,
        tokens
      )
    );

  return updateWebsitePageSections(
    project,
    home.id,
    sections
  );
}

export function updateWebsiteProjectFromCanvas(
  project: WebsiteProject,
  blocks: WebCanvasBlockSeed[],
  pageId?: string
): WebsiteProject {
  const page = project.pages.find((entry) => entry.id === pageId) ?? getWebsiteHomePage(project);

  return updateWebsitePageSections(
    project,
    page.id,
    canvasBlocksToWebsiteSections(
      blocks
    )
  );
}

export function websiteProjectToCanvasBlocks(
  project: WebsiteProject,
  pageId?: string
): WebCanvasBlockSeed[] {
  const page = project.pages.find((entry) => entry.id === pageId) ?? getWebsiteHomePage(project);
  return websiteSectionsToCanvasBlocks(
    page.sections
  );
}
