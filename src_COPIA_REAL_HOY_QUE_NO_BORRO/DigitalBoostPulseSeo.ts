import { buildPages, explainScore, healthOf, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";
export function seoFacts() {
  const s = loadSeo();
  const pages = buildPages(s);
  const issues = scanIssues(pages, s);
  return { s: s, pages: pages, issues: issues, health: healthOf(issues), top: issues[0] || null, n: issues.length, crit: issues.filter(function (i) { return i.severity === 'critical'; }).length };
}
export function seoSpeak() {
  const f = seoFacts();
  if (!f.n) return { title: 'PULSE IA', body: 'Health ' + f.health + '/100. El recorte esta limpio. Keywords no: falta Search Console. Canvas o pedidos?', action: 'seo', label: 'Quedarme en SEO' };
  const t = f.top;
  return { title: 'PULSE IA', body: explainScore(f.issues) + ' El golpe es «' + t.title + '» en ' + t.url + '. ' + t.why + ' Optimizar es L1.', action: 'seo', label: 'Abrir SEO' };
}
export function seoFixTop() {
  const f = seoFacts();
  const t = f.top;
  if (!t) return seoSpeak();
  const p = f.pages.find(function (x) { return x.id === t.pageId; });
  if (!p) return seoSpeak();
  const ov = Object.assign({}, f.s.overrides || {});
  const cur = Object.assign({}, ov[p.id] || {});
  if (t.fixKind === 'title') cur.title = pulseTitle(p);
  if (t.fixKind === 'desc') cur.description = pulseDesc(p);
  if (t.fixKind === 'alt') cur.alt = pulseAlt(p);
  if (t.fixKind === 'noindex') cur.indexable = false;
  ov[p.id] = cur;
  saveSeo(Object.assign({}, f.s, { overrides: ov, resolved: (f.s.resolved || []).concat([t.id]), lastScan: Date.now() }));
  return { title: 'PULSE IA', body: 'Hecho. ' + t.fixKind + ' en ' + p.url + '. Mira el score en SEO Center. No toque el canvas.', action: 'seo', label: 'Ver SEO' };
}
