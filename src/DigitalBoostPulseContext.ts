import { buildStateSnapshot, fact, type PulseFact, type PulseStateSnapshot } from "./DigitalBoostPulseSnapshot";
import { loadSearchAdapter } from "./DigitalBoostPulseSearchAdapter";
import { assemblePulseContext, contextItem, type PulseContextItem } from "./DigitalBoostPulseContextEngine";
import { hashProposal } from "./DigitalBoostPulseContracts";
import { assertInferenceObservationItem } from "./ai/DigitalBoostPulseInferenceContextBoundary";
export type PulseContextSourceStatus = "available" | "partial" | "unavailable";
export interface PulseContextDomain<T = unknown> {
  status: PulseContextSourceStatus; data: T; source: string;
  capturedAt?: string; confidence?: number; freshness?: "fresh" | "aging" | "stale" | "unknown";
}
export interface PulseCommerceContext { sales?: number; orders?: number; customers?: number; products?: number; inventory?: number; }
export interface PulseStoreBuilderContext {
  activeSection?: string; builderState?: string; page?: string; theme?: string;
  live?: boolean; blockCount?: number; heroTitle?: string; canvasPresent?: boolean;
}
export interface PulseSeoContext { score?: number; issues?: number; pages?: number; lastScan?: number; }
export interface PulseMarketingContext { campaigns?: number; channels?: number; }
export interface PulseAnalyticsContext { available: boolean; metrics?: Record<string, unknown>; }
export interface PulseAIContext { ollama: boolean; qwen2: boolean; llama3: boolean; openclaw: boolean; }
export interface PulseSearchContext { rows?: number; topQuery?: string; source?: string; note?: string; }
export interface PulseContext {
  version: "2.0";
  generatedAt: string;
  snapshot: PulseStateSnapshot;

  contextId: string;
  tenantId: string;
  contractVersion: string;

  contextItems: PulseContextItem[];

  conflicts: ReturnType<
    typeof assemblePulseContext
  >["conflicts"];

  compression: ReturnType<
    typeof assemblePulseContext
  >["compression"];

  commerce: PulseContextDomain<PulseCommerceContext>;
  storeBuilder: PulseContextDomain<PulseStoreBuilderContext>;
  seo: PulseContextDomain<PulseSeoContext>;
  marketing: PulseContextDomain<PulseMarketingContext>;
  analytics: PulseContextDomain<PulseAnalyticsContext>;
  ai: PulseContextDomain<PulseAIContext>;
  search: PulseContextDomain<PulseSearchContext>;

  summary: {
    availableDomains: string[];
    unavailableDomains: string[];
    contextVersion: string;
    assemblyVersion: string;
  };
}
function safeRead(key: string): unknown {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    try { return JSON.parse(raw); } catch { return raw; }
  } catch { return undefined; }
}
function safeText(key: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  try { return window.localStorage.getItem(key) || undefined; } catch { return undefined; }
}
function domain<T>(status: PulseContextSourceStatus, data: T, source: string, generatedAt: string): PulseContextDomain<T> {
  return { status, data, source, capturedAt: generatedAt, confidence: status === "available" ? 0.8 : status === "partial" ? 0.4 : 0, freshness: status === "unavailable" ? "unknown" : "fresh" };
}

function canvasBlocks(page?: string): unknown[] | undefined {
  const keyed = page ? safeRead("db-store-canvas-v1:" + page) : undefined;
  const raw = keyed !== undefined ? keyed : safeRead("db-store-canvas-v1");
  return Array.isArray(raw) ? raw : undefined;
}
function readSeo(): PulseSeoContext {
  const seoRaw = safeRead("db-seo-center-v1");
  const seoData: PulseSeoContext = {};
  if (!seoRaw || typeof seoRaw !== "object") return seoData;
  const seo = seoRaw as Record<string, unknown>;
  if (typeof seo.score === "number") seoData.score = seo.score;
  if (Array.isArray(seo.issues)) seoData.issues = seo.issues.length;
  if (Array.isArray(seo.pages)) seoData.pages = seo.pages.length;
  if (typeof seo.lastScan === "number" && seo.lastScan > 0) seoData.lastScan = seo.lastScan;
  return seoData;
}
function readCampaigns(): number | undefined {
  const raw = safeRead("digitalboost_campaigns");
  if (Array.isArray(raw)) return raw.length;
  if (raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items)) return (raw as { items: unknown[] }).items.length;
  return undefined;
}

export function buildPulseContext(
  input: {
    store?: string;
    tenant?: string;
    range?: string;
    section?: string;
    page?: string;
    inferenceObservationItems?: readonly PulseContextItem[];
  } = {},
): PulseContext {
  const generatedAt = new Date().toISOString();
  const store = input.store || safeText("db-active-store-v1") || "unknown";
  const tenantId = input.tenant || safeText("db-active-tenant-v1") || safeText("db-tenant-v1") || "digitalboost";
  const storeSection = input.section || safeText("digitalboost_store_section") || safeText("db-os-section-v1");
  const page = input.page || safeText("db-store-page-v1");
  const theme = safeText("db-os-theme-v1");
  const liveRaw = safeText("db-os-live-v1");
  const blocks = canvasBlocks(page);
  const hero = blocks && blocks.length ? (blocks.find((b: any) => b && (b.type === "hero" || b.kind === "hero")) || blocks[0]) : undefined;
  const heroTitle = hero && typeof hero === "object" ? String((hero as any).title || "") : undefined;
  const storeData: PulseStoreBuilderContext = { activeSection: storeSection, page, theme, live: liveRaw === undefined ? undefined : liveRaw !== "0", blockCount: blocks ? blocks.length : undefined, heroTitle: heroTitle || undefined, canvasPresent: Boolean(blocks) };
  const storePresent = Boolean(storeSection || page || blocks);
  const storeBuilder = domain<PulseStoreBuilderContext>(storePresent ? (blocks ? "available" : "partial") : "unavailable", storeData, blocks ? "db-store-canvas-v1" : storeSection ? "digitalboost_store_section" : "none", generatedAt);
  const seoRaw = safeRead("db-seo-center-v1");
  const campaignsRaw = safeRead("digitalboost_campaigns");

  const seoData = readSeo();
  const seo = domain<PulseSeoContext>(Object.keys(seoData).length > 0 ? "available" : "unavailable", seoData, "db-seo-center-v1", generatedAt);
  const campaignCount = readCampaigns();
  const marketing = domain<PulseMarketingContext>(campaignCount !== undefined ? "partial" : "unavailable", campaignCount !== undefined ? { campaigns: campaignCount } : {}, "digitalboost_campaigns", generatedAt);
  const commerce = domain<PulseCommerceContext>("unavailable", {}, "no-authoritative-commerce-store", generatedAt);
  const analytics = domain<PulseAnalyticsContext>("unavailable", { available: false }, "no-authoritative-analytics-store", generatedAt);
  const ai = domain<PulseAIContext>("unavailable", { ollama: false, qwen2: false, llama3: false, openclaw: false }, "runtime-status-not-sampled-here", generatedAt);
  const searchSnap = loadSearchAdapter();
  const search = domain<PulseSearchContext>(searchSnap.status, { rows: searchSnap.rows.length || undefined, topQuery: searchSnap.rows[0] && searchSnap.rows[0].query, source: searchSnap.source, note: searchSnap.note }, searchSnap.source, generatedAt);
  const facts: Record<string, PulseFact> = {
    store: fact(store, "db-active-store-v1", store !== "unknown", "store", generatedAt),
    section: fact(storeSection || null, "digitalboost_store_section", Boolean(storeSection), "store", generatedAt),
    page: fact(page || null, "db-store-page-v1", Boolean(page), "store", generatedAt),
    canvasBlocks: fact(storeData.blockCount ?? null, "db-store-canvas-v1", Boolean(blocks), "store", generatedAt),
    canvasFingerprint: fact(
      blocks ? hashProposal(blocks) : null,
      "db-store-canvas-v1",
      Boolean(blocks),
      "store",
      generatedAt,
    ),
    theme: fact(
      theme || null,
      "db-os-theme-v1",
      theme !== undefined,
      "store",
      generatedAt,
    ),
    live: fact(
      liveRaw || null,
      "db-os-live-v1",
      liveRaw !== undefined,
      "store",
      generatedAt,
    ),
    seoIssues: fact(seoData.issues ?? null, "db-seo-center-v1", seoData.issues !== undefined, "seo", generatedAt),
    seoFingerprint: fact(
      seoRaw !== undefined ? hashProposal(seoRaw) : null,
      "db-seo-center-v1",
      seoRaw !== undefined,
      "seo",
      generatedAt,
    ),
    campaigns: fact(campaignCount ?? null, "digitalboost_campaigns", campaignCount !== undefined, "marketing", generatedAt),
    campaignsFingerprint: fact(
      campaignsRaw !== undefined ? hashProposal(campaignsRaw) : null,
      "digitalboost_campaigns",
      campaignsRaw !== undefined,
      "marketing",
      generatedAt,
    ),
    searchQueries: fact(searchSnap.rows.length || null, searchSnap.source, searchSnap.status !== "unavailable", "search", generatedAt),
  };
  const snapshot = buildStateSnapshot({ store, tenant: tenantId, mode: "CURRENT", facts });
  const domains = {
    commerce,
    storeBuilder,
    seo,
    marketing,
    analytics,
    ai,
    search,
  };

  const availableDomains =
    Object.entries(domains)
      .filter(
        ([, value]) =>
          value.status === "available",
      )
      .map(([key]) => key);

  const unavailableDomains =
    Object.entries(domains)
      .filter(
        ([, value]) =>
          value.status === "unavailable",
      )
      .map(([key]) => key);

  const contextItems:
    PulseContextItem[] =
    Object.entries(
      snapshot.facts,
    ).map(
      ([key, currentFact]) =>
        contextItem({
          id: `fact:${key}`,
          key,
          tenantId,
          value:
            currentFact.value,
          source:
            currentFact.source,
          provenance:
            currentFact.provenance,
          timestamp:
            currentFact.timestamp,

          trust:
            key ===
              "searchQueries"
              ? "untrusted"
              : key ===
                    "seoIssues" ||
                key ===
                    "campaigns"
                ? "derived"
                : "raw",

          evidenceRefs:
            currentFact.present
              ? [
                  currentFact.source,
                ]
              : [],

          constraints:
            currentFact.present
              ? [
                  `scope:${currentFact.scope}`,
                ]
              : [],

          relevance:
            currentFact.present
              ? 0.8
              : 0.1,

          mandatory:
            key === "store" ||
            key === "section",

          ttlMs:
            10 * 60 * 1000,
        }),
    );

  const inferenceObservationItems =
    Array.from(
      input.inferenceObservationItems ?? [],
    );

  for (const item of inferenceObservationItems) {
    assertInferenceObservationItem(
      item,
      tenantId,
    );
  }

  const assembledContextItems = [
    ...contextItems,
    ...inferenceObservationItems,
  ];

  const assembly =
    assemblePulseContext({
      tenantId,
      snapshot,
      policyVersion:
        "pulse-gov-v1",
      items: assembledContextItems,
      now:
        Date.parse(
          generatedAt,
        ),
      maxBytes:
        24000,
    });

  return {
    version: "2.0",
    generatedAt,
    snapshot,

    contextId:
      assembly.contextId,

    tenantId,

    contractVersion:
      assembly.contractVersion,

    contextItems:
      assembly.items,

    conflicts:
      assembly.conflicts,

    compression:
      assembly.compression,

    commerce,
    storeBuilder,
    seo,
    marketing,
    analytics,
    ai,
    search,

    summary: {
      availableDomains,
      unavailableDomains,
      contextVersion:
          snapshot.version,

        assemblyVersion:
          assembly.version,},
  };
}
export function buildPulseContextSummary(context: PulseContext): string {
  return ["Context version: " + context.version, "Snapshot: " + context.snapshot.version, "Available: " + (context.summary.availableDomains.join(", ") || "none"), "Unavailable: " + (context.summary.unavailableDomains.join(", ") || "none"), "Store section: " + (context.storeBuilder.data.activeSection || "unknown"), "SEO status: " + context.seo.status, "Commerce status: " + context.commerce.status].join("\n");
}
export function currentContextVersion(input?: { store?: string; section?: string; page?: string }): string {
  return buildPulseContext(input).summary.contextVersion;
}
