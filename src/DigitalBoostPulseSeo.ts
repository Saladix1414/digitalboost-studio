import { buildPages, explainScore, healthOf, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";
export function seoFacts() {
  const s = loadSeo();
  const pages = buildPages(s);
  const issues = scanIssues(pages, s);
  return { s: s, pages: pages, issues: issues, health: healthOf(issues), top: issues[0] || null, n: issues.length, crit: issues.filter(function (i) { return i.severity === 'critical'; }).length };
}
export function seoSpeak() {
  const f = seoFacts();
  if (!f.n) return { title: 'PULSE', body: 'Health ' + f.health + '/100. El recorte esta limpio. Keywords no: falta Search Console. Canvas o pedidos?', action: 'seo', label: 'Quedarme en SEO' };
  const t = f.top;
  return { title: 'PULSE', body: explainScore(f.issues) + ' El golpe es «' + t.title + '» en ' + t.url + '. ' + t.why + ' Optimizar es L1.', action: 'seo', label: 'Abrir SEO' };
}
export function seoFixProposal() {
  const f = seoFacts();
  const t = f.top;

  if (!t) {
    return {
      title: "PULSE",
      body: "SEO limpio. No hay correccion pendiente.",
      action: "seo",
      label: "Ver SEO",
      proposal: null,
    };
  }

  const p = f.pages.find(function (page: any) {
    return page.id === t.pageId || page.url === t.url;
  }) || {};

  return {
    title: "PULSE",
    body:
      "Propuesta SEO: " +
      t.fixKind +
      " en " +
      (p.url || t.url || "pagina") +
      ". Requiere Governance antes de aplicar.",
    action: "seo-fix",
    label: "Revisar y aplicar",
    proposal: {
      type: "seo-fix",
      fixKind: t.fixKind,
      pageId: p.id || t.pageId,
      url: p.url || t.url,
      issueId: t.id,
      reason: "PULSE propone corregir el problema SEO prioritario.",
    },
    confirm: true,
  };
}


