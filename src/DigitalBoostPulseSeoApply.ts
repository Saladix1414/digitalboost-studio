import {
  buildPages,
  loadSeo,
  pulseAlt,
  pulseDesc,
  pulseTitle,
  saveSeo,
  scanIssues,
} from "./DigitalBoostSeo";

export type SeoFixKind = "title" | "desc" | "alt" | "noindex";

export type SeoFixProposal = {
  type: "seo-fix";
  fixKind: SeoFixKind;
  pageId?: string;
  url?: string;
  issueId?: string;
  reason?: string;
};

function resolvePage(proposal: SeoFixProposal, pages: any[]) {
  return pages.find(function (page: any) {
    return (
      (proposal.pageId && page.id === proposal.pageId) ||
      (proposal.url && page.url === proposal.url)
    );
  }) || null;
}

function currentIssueMatches(
  proposal: SeoFixProposal,
  pages: any[],
  settings: any,
) {
  if (!proposal.issueId) return true;

  const issues = scanIssues(pages, settings);
  return issues.some(function (issue: any) {
    const sameId = issue.id === proposal.issueId;
    const sameKind = issue.fixKind === proposal.fixKind;
    const samePage =
      (!proposal.pageId || issue.pageId === proposal.pageId) &&
      (!proposal.url || issue.url === proposal.url);

    return sameId && sameKind && samePage;
  });
}

export function validateSeoFixProposal(
  proposal: unknown,
): { ok: true } | { ok: false; error: string } {
  if (!proposal || typeof proposal !== "object") {
    return { ok: false, error: "SEO proposal missing." };
  }

  const p = proposal as Partial<SeoFixProposal>;

  if (p.type !== "seo-fix") {
    return { ok: false, error: "Unsupported SEO proposal type." };
  }

  if (
    p.fixKind !== "title" &&
    p.fixKind !== "desc" &&
    p.fixKind !== "alt" &&
    p.fixKind !== "noindex"
  ) {
    return { ok: false, error: "Unsupported SEO fix kind." };
  }

  if (!p.pageId && !p.url) {
    return { ok: false, error: "SEO proposal has no target page." };
  }

  return { ok: true };
}

export function applySeoFixProposal(
  proposal: SeoFixProposal,
) {
  const validation = validateSeoFixProposal(proposal);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const settings = loadSeo();
  const pages = buildPages(settings);
  const page = resolvePage(proposal, pages);

  if (!page) {
    throw new Error("SEO target page no longer exists.");
  }

  if (!currentIssueMatches(proposal, pages, settings)) {
    throw new Error("SEO proposal is stale or no longer matches the current issue.");
  }

  const overrides = Object.assign({}, settings.overrides || {});
  const current = Object.assign({}, overrides[page.id] || {});

  if (proposal.fixKind === "title") {
    current.title = pulseTitle(page);
  }

  if (proposal.fixKind === "desc") {
    current.description = pulseDesc(page);
  }

  if (proposal.fixKind === "alt") {
    current.alt = pulseAlt(page);
  }

  if (proposal.fixKind === "noindex") {
    current.indexable = false;
  }

  overrides[page.id] = current;

  const resolved = Array.isArray(settings.resolved)
    ? settings.resolved.slice()
    : [];

  if (proposal.issueId && resolved.indexOf(proposal.issueId) === -1) {
    resolved.push(proposal.issueId);
  }

  saveSeo(
    Object.assign({}, settings, {
      overrides: overrides,
      resolved: resolved,
      lastScan: Date.now(),
    }),
  );

  return true;
}
