#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

# --- SEO tool for Pulse ---
T = [
'import { buildPages, healthOf, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";',
"export function seoFacts() {",
"  const s = loadSeo();",
"  const pages = buildPages(s);",
"  const issues = scanIssues(pages, s);",
"  const health = healthOf(issues);",
"  const top = issues[0] || null;",
"  return { s: s, pages: pages, issues: issues, health: health, top: top, n: issues.length, crit: issues.filter(function (i) { return i.severity === 'critical'; }).length };",
"}",
"export function seoSpeak() {",
"  const f = seoFacts();",
"  if (!f.n) return { title: 'PULSE · SEO', body: 'Health ' + f.health + '/100. El recorte esta limpio. Keywords no: falta Search Console, no invento volume. Abrimos Pages o nos vamos al canvas?', action: 'seo', label: 'Abrir SEO' };",
"  const t = f.top;",
"  return { title: 'PULSE · SEO', body: 'Health ' + f.health + '/100. ' + f.crit + ' critical, ' + f.n + ' abiertos. El golpe es «' + t.title + '» en ' + t.url + '. ' + t.why + ' L1 = Optimizar.', action: 'seo', label: 'Abrir SEO', draft: t.fixKind === 'title' || t.fixKind === 'desc' ? { kind: t.fixKind === 'title' ? 'hero' : 'cta', title: t.title, body: t.description, cta: 'Optimizar' } : undefined };",
"}",
"export function seoFixTop() {",
"  const f = seoFacts();",
"  const t = f.top;",
"  if (!t) return seoSpeak();",
"  const p = f.pages.find(function (x) { return x.id === t.pageId; });",
"  if (!p) return seoSpeak();",
"  const ov = Object.assign({}, f.s.overrides || {});",
"  const cur = Object.assign({}, ov[p.id] || {});",
"  if (t.fixKind === 'title') cur.title = pulseTitle(p);",
"  if (t.fixKind === 'desc') cur.description = pulseDesc(p);",
"  if (t.fixKind === 'alt') cur.alt = pulseAlt(p);",
"  if (t.fixKind === 'noindex') cur.indexable = false;",
"  ov[p.id] = cur;",
"  const n = Object.assign({}, f.s, { overrides: ov, resolved: (f.s.resolved || []).concat([t.id]), lastScan: Date.now() });",
"  saveSeo(n);",
"  return { title: 'PULSE · SEO aplicado', body: 'Listo. ' + t.fixKind + ' en ' + p.url + '. Health ahora se recalcula en SEO Center. Revertir = Ignore no: Reset del producto o Deshacer no pisa SEO. Abrí SEO y mira el score.', action: 'seo', label: 'Ver SEO' };",
"}",
]
if (src / "DigitalBoostSeo.ts").is_file():
    (src / "DigitalBoostPulseSeo.ts").write_text("\n".join(T) + "\n", encoding="utf-8")
    print("ok pulse seo")
else:
    print("WARN no DigitalBoostSeo.ts — corre db_seo_full.py")

# --- router ---
rt = src / "DigitalBoostPulseRouter.ts"
if rt.is_file():
    r = rt.read_text(encoding="utf-8")
    if "seoSpeak" not in r:
        if "from './DigitalBoostPulseSeo'" not in r and 'from "./DigitalBoostPulseSeo"' not in r:
            r = 'import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";\n' + r
        needle = "const f = toolInspect(input);"
        add = needle + "\n  if (hit(q, ['seo', 'meta', 'sitemap', 'robots', 'canonical', 'indexa', 'keyword', 'alt text', 'auditar tienda'])) {\n    if (hit(q, ['optimiz', 'fix', 'aplicar', 'correg'])) return finish(input, seoFixTop());\n    return finish(input, seoSpeak());\n  }"
        if needle in r:
            r = r.replace(needle, add, 1)
            print("ok router")
        else:
            print("no inspect needle")
        rt.write_text(r, encoding="utf-8")
    else:
        print("ya router")

# --- skills voice ---
sk = src / "DigitalBoostPulseSkills.ts"
if sk.is_file():
    k = sk.read_text(encoding="utf-8")
    if "seoSpeak" not in k and (src / "DigitalBoostPulseSeo.ts").is_file():
        k = 'import { seoSpeak } from "./DigitalBoostPulseSeo";\n' + k
        old = "export function skillBriefing(i: PulseInput) {"
        if old in k:
            k = k.replace(
                old,
                "export function skillBriefing(i: PulseInput) {\n  if (i.section === 'seo') return seoSpeak();",
                1,
            )
            print("ok briefing seo")
        k = k.replace(
            "return { title: 'PULSE Design', body: 'Inspeccion de '",
            "return { title: 'PULSE Design', body: 'Estoy en el canvas de '",
            1,
        )
        sk.write_text(k, encoding="utf-8")
        print("ok skills")
    else:
        print("skills skip")

# --- operator tray / say / navigate seo ---
op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    n = 0
    if "seo: " not in o and "publicar:" in o:
        o = o.replace("publicar: \"Podemos publicar?\"", "publicar: \"Podemos publicar?\", seo: \"Como esta el SEO?\"", 1)
        n += 1
    elif "seo:" not in o and "hola:" in o:
        o = o.replace("hola: \"Hola\"", "hola: \"Hola\", seo: \"Como esta el SEO?\"", 1)
        n += 1
    if '["seo"' not in o:
        if '["publicar", "Publicar"]' in o:
            o = o.replace('["publicar", "Publicar"]', '["publicar", "Publicar"], ["seo", "SEO"]', 1)
            n += 1
        elif '["theme", "Theme"]' in o:
            o = o.replace('["theme", "Theme"]', '["theme", "Theme"], ["seo", "SEO"]', 1)
            n += 1
    if 'action === "seo"' not in o and "onNavigate" in o:
        # try common navigate
        if "action === 'website-builder'" in o or 'action === "website-builder"' in o:
            o = o.replace(
                'action === "website-builder"',
                'action === "seo" || action === "website-builder"',
                1,
            )
            n += 1
    op.write_text(o, encoding="utf-8")
    print("ok operator", n)

# --- workspace: pulse action seo -> setSection ---
ws = src / "StoreBuilderWorkspace.tsx"
if ws.is_file():
    w = ws.read_text(encoding="utf-8")
    if "id === 'seo'" not in w and 'id === "seo"' not in w:
        # onNavigate from pulse
        if 'if (id === "website-builder")' in w:
            w = w.replace(
                'if (id === "website-builder")',
                'if (id === "seo") { setSection("seo"); return; }\n    if (id === "website-builder")',
                1,
            )
            print("ok nav seo")
        elif "setSection(id)" in w:
            print("ya setSection(id) cubre seo")
        else:
            print("no nav hook")
        ws.write_text(w, encoding="utf-8")

print("LISTO PULSE OS")
print("PULSE: seo / auditar / optimizar  |  chip SEO  |  action abre SEO Manager")
