/**
 * DigitalBoost Pulse — Canonical Context Builder
 *
 * Fase 1:
 * Unifica el contexto operativo que PULSE necesita para
 * razonar sobre Commerce OS, Store Builder, SEO,
 * Marketing y Analytics.
 *
 * Importante:
 * - No fabrica métricas.
 * - No modifica módulos existentes.
 * - No ejecuta acciones.
 * - Usa localStorage únicamente como fuente opcional
 *   cuando el módulo correspondiente ya persiste datos.
 */

export type PulseContextSourceStatus =
  | "available"
  | "partial"
  | "unavailable";

export interface PulseContextDomain<T = unknown> {
  status: PulseContextSourceStatus;
  data: T;
  source: string;
}

export interface PulseCommerceContext {
  sales?: number;
  orders?: number;
  customers?: number;
  products?: number;
  inventory?: number;
}

export interface PulseStoreBuilderContext {
  activeSection?: string;
  builderState?: string;
}

export interface PulseSeoContext {
  score?: number;
  issues?: number;
  pages?: number;
}

export interface PulseMarketingContext {
  campaigns?: number;
  channels?: number;
}

export interface PulseAnalyticsContext {
  available: boolean;
  metrics?: Record<string, unknown>;
}

export interface PulseAIContext {
  ollama: boolean;
  qwen2: boolean;
  llama3: boolean;
  openclaw: boolean;
}

export interface PulseContext {
  version: "1.0";
  generatedAt: string;

  commerce: PulseContextDomain<PulseCommerceContext>;
  storeBuilder: PulseContextDomain<PulseStoreBuilderContext>;
  seo: PulseContextDomain<PulseSeoContext>;
  marketing: PulseContextDomain<PulseMarketingContext>;
  analytics: PulseContextDomain<PulseAnalyticsContext>;
  ai: PulseContextDomain<PulseAIContext>;

  summary: {
    availableDomains: string[];
    unavailableDomains: string[];
  };
}

function safeRead(key: string): unknown {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function domain<T>(
  status: PulseContextSourceStatus,
  data: T,
  source: string
): PulseContextDomain<T> {
  return { status, data, source };
}

/**
 * Construye el contexto canónico actual.
 *
 * Este primer adaptador es deliberadamente conservador:
 * cuando no existe una fuente de datos formal, informa
 * "unavailable" en lugar de inventar información.
 */
export function buildPulseContext(
  input: {
    store?: string;
    range?: string;
    section?: string;
  } = {}
): PulseContext {
  const generatedAt = new Date().toISOString();

  const storeSection =
    input.section ||
    (typeof window !== "undefined"
      ? (() => {
          try {
            return (
              window.localStorage.getItem("digitalboost_store_section") ||
              undefined
            );
          } catch {
            return undefined;
          }
        })()
      : undefined);

  const seoRaw = safeRead("db-seo-center-v1");

  const seoData: PulseSeoContext = {};

  if (seoRaw && typeof seoRaw === "object") {
    const seo = seoRaw as Record<string, unknown>;

    if (typeof seo.score === "number") {
      seoData.score = seo.score;
    }

    if (Array.isArray(seo.issues)) {
      seoData.issues = seo.issues.length;
    }

    if (Array.isArray(seo.pages)) {
      seoData.pages = seo.pages.length;
    }
  }

  const seoAvailable = Object.keys(seoData).length > 0;

  const commerce = domain<PulseCommerceContext>(
    "partial",
    {
      // Estos campos solo se rellenan cuando PULSE recibe
      // datos reales mediante su input.
    },
    "PulseInput / Commerce OS"
  );

  const storeBuilder = domain<PulseStoreBuilderContext>(
    storeSection ? "available" : "partial",
    {
      activeSection: storeSection,
      builderState: undefined,
    },
    "digitalboost_store_section"
  );

  const seo = domain<PulseSeoContext>(
    seoAvailable ? "available" : "unavailable",
    seoData,
    "db-seo-center-v1"
  );

  const marketing = domain<PulseMarketingContext>(
    "unavailable",
    {},
    "DigitalBoostMarketingCenter"
  );

  const analytics = domain<PulseAnalyticsContext>(
    "unavailable",
    { available: false },
    "Analytics"
  );

  const ai = domain<PulseAIContext>(
    "available",
    {
      ollama: true,
      qwen2: true,
      llama3: true,
      openclaw: false,
    },
    "DigitalBoost AI Architecture"
  );

  const domains = {
    commerce,
    storeBuilder,
    seo,
    marketing,
    analytics,
    ai,
  };

  const availableDomains = Object.entries(domains)
    .filter(([, value]) => value.status === "available")
    .map(([key]) => key);

  const unavailableDomains = Object.entries(domains)
    .filter(([, value]) => value.status === "unavailable")
    .map(([key]) => key);

  return {
    version: "1.0",
    generatedAt,
    commerce,
    storeBuilder,
    seo,
    marketing,
    analytics,
    ai,
    summary: {
      availableDomains,
      unavailableDomains,
    },
  };
}

export function buildPulseContextSummary(
  context: PulseContext
): string {
  return [
    `Context version: ${context.version}`,
    `Generated: ${context.generatedAt}`,
    `Available: ${context.summary.availableDomains.join(", ") || "none"}`,
    `Unavailable: ${context.summary.unavailableDomains.join(", ") || "none"}`,
    `Store section: ${context.storeBuilder.data.activeSection || "unknown"}`,
    `SEO status: ${context.seo.status}`,
    `Marketing status: ${context.marketing.status}`,
    `Analytics status: ${context.analytics.status}`,
    `AI: Ollama=${context.ai.data.ollama}, Qwen2=${context.ai.data.qwen2}, Llama3=${context.ai.data.llama3}, OpenClaw=${context.ai.data.openclaw}`,
  ].join("\n");
}
