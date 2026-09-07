#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")
L = [
'import { productsSeed } from "./commerce-data";',
'export type Sev = "critical" | "high" | "medium" | "low";',
"export type SeoPage = { id: string; url: string; type: string; title: string; description: string; canonical: string; indexable: boolean; h1: string; };",
"export type SeoIssue = { id: string; title: string; description: string; severity: Sev; url: string; why: string; fix: string; fixKind: string; pageId: string; };",
"const KEY = 'db-seo-center-v1';",
"const BASE = 'https://aura.digitalboost.shop';",
"export const DEFAULT_ROBOTS = 'User-agent: *\\nAllow: /\\nDisallow: /cart\\nDisallow: /checkout\\nDisallow: /account\\nSitemap: https://aura.digitalboost.shop/sitemap.xml\\n';",
"export function loadSeo() {",
"  try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if (p) return p; } catch {}",
"  return { overrides: {}, robots: DEFAULT_ROBOTS, redirects: [] as any[], ignored: [] as string[], resolved: [] as string[], lastScan: 0, log: [] as any[], titleTpl: '{name} | Aura Store', descTpl: '{name} en Aura. Envio 48h.' };",
"}",
"export function saveSeo(s: any) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }",
"export function buildPages(s: any): SeoPage[] {",
"  let hero = 'Aura Store'; let body = '';",
"  try { const raw = localStorage.getItem('db-store-canvas-v1') || '[]'; const b = JSON.parse(raw); const h = (b || []).find((x: any) => x && x.type === 'hero') || (b || [])[0] || {}; hero = h.title || hero; body = h.body || ''; } catch {}",
"  const home: SeoPage = { id: 'home', url: '/', type: 'Homepage', title: hero, description: body, canonical: BASE + '/', indexable: true, h1: hero };",
"  const prods: SeoPage[] = (productsSeed || []).map(function (p: any) {",
"    const slug = String(p.sku || p.id).toLowerCase();",
"    return { id: 'p-' + p.id, url: '/products/' + slug, type: 'Product', title: String(s.titleTpl || '{name} | Aura Store').replace('{name}', p.name), description: String(s.descTpl || '{name}').replace('{name}', p.name), canonical: BASE + '/products/' + slug, indexable: true, h1: p.name };",
"  });",
"  const col: SeoPage = { id: 'col', url: '/collections/destacados', type: 'Collection', title: 'Destacados | Aura Store', description: '', canonical: BASE + '/collections/destacados', indexable: true, h1: 'Destacados' };",
"  const util: SeoPage[] = ['cart', 'checkout', 'account'].map(function (u) { return { id: u, url: '/' + u, type: 'Utility', title: u, description: '', canonical: BASE + '/' + u, indexable: false, h1: u }; });",
"  return [home].concat(prods, [col], util).map(function (p) { const o = (s.overrides || {})[p.id] || {}; return Object.assign({}, p, o); });",
"}",
"export function scanIssues(pages: SeoPage[], s: any): SeoIssue[] {",
"  const out: SeoIssue[] = [];",
"  const skip = function (id: string) { return (s.ignored || []).indexOf(id) !== -1 || (s.resolved || []).indexOf(id) !== -1; };",
"  function add(i: SeoIssue) { if (!skip(i.id)) out.push(i); }",
"  pages.forEach(function (p) {",
"    if (p.type !== 'Utility' && p.indexable && String(p.title || '').length < 12) add({ id: 'title:' + p.id, title: 'Title corto', description: String(p.title || ''), severity: 'critical', url: p.url, why: 'El title es la senal on-page mas fuerte.', fix: 'Aplicar plantilla.', fixKind: 'title', pageId: p.id });",
"    if (p.type !== 'Utility' && p.indexable && String(p.description || '').length < 40) add({ id: 'desc:' + p.id, title: 'Meta description delgada', description: String((p.description || '').length) + ' chars', severity: 'high', url: p.url, why: 'Sin description el snippet queda a criterio del motor.', fix: 'Generar description.', fixKind: 'desc', pageId: p.id });",
"    if (p.type === 'Collection' && String(p.description || '').length < 40) add({ id: 'thin:' + p.id, title: 'Coleccion delgada', description: 'Sin description', severity: 'medium', url: p.url, why: 'La coleccion compite como landing.', fix: 'Redactar description.', fixKind: 'desc', pageId: p.id });",
"    if (p.type === 'Utility' && p.indexable) add({ id: 'noindex:' + p.id, title: 'Utilidad indexable', description: p.url, severity: 'critical', url: p.url, why: 'Cart/checkout no van al indice.', fix: 'Marcar noindex.', fixKind: 'noindex', pageId: p.id });",
"  });",
"  if (/Disallow:\\s*\\/\\s*$/m.test(String(s.robots || ''))) add({ id: 'robots', title: 'robots bloquea todo', description: 'Disallow: /', severity: 'critical', url: '/robots.txt', why: 'Saca el sitio del indice.', fix: 'Reset robots.', fixKind: 'none', pageId: 'robots' });",
"  return out;",
"}",
"export function healthOf(issues: SeoIssue[]) {",
"  let n = 100;",
"  issues.forEach(function (i) { n -= i.severity === 'critical' ? 14 : i.severity === 'high' ? 8 : 4; });",
"  if (n < 0) n = 0; if (n > 100) n = 100; return n;",
"}",
"export function pulseTitle(p: SeoPage) { return p.type === 'Product' ? p.h1 + ' — envio 48h | Aura' : (p.h1 || 'Aura') + ' | Aura Store'; }",
"export function pulseDesc(p: SeoPage) { return p.type === 'Product' ? p.h1 + ' en Aura. Stock real, envio 48h.' : 'Aura Store. Envio 48h. Checkout seguro.'; }",
]
# if no commerce-data, inline 4 products
lib = "\n".join(L)
if not (src / "commerce-data.ts").is_file() and not (src / "commerce-data.tsx").is_file():
    lib = lib.replace(
        'import { productsSeed } from "./commerce-data";',
        "const productsSeed = [{ id: 1, name: 'Campera Aura Navy', sku: 'DB-JK-01' }, { id: 2, name: 'Tote Cyan Pulse', sku: 'DB-TG-04' }, { id: 3, name: 'Hoodie Violet Grid', sku: 'DB-HD-12' }, { id: 4, name: 'Cap Digital Blue', sku: 'DB-CP-08' }];",
    )
(src / "DigitalBoostSeo.ts").write_text(lib + "\n", encoding="utf-8")
print("ok lib", len(lib.splitlines()))
print("LISTO SEO LIB")
