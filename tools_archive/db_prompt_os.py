#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

def w(name, lines):
    (src / name).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("ok", name, len(lines))

# SEO bridge
if (src / "DigitalBoostSeo.ts").is_file():
    w("DigitalBoostPulseSeo.ts", [
        'import { buildPages, healthOf, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";',
        "export function seoFacts() {",
        "  const s = loadSeo();",
        "  const pages = buildPages(s);",
        "  const issues = scanIssues(pages, s);",
        "  return { s: s, pages: pages, issues: issues, health: healthOf(issues), top: issues[0] || null, n: issues.length, crit: issues.filter(function (i) { return i.severity === 'critical'; }).length };",
        "}",
        "export function seoSpeak() {",
        "  const f = seoFacts();",
        "  if (!f.n) return { title: 'PULSE', body: 'Health ' + f.health + '/100. El recorte esta limpio. Keywords no: falta Search Console. Canvas o pedidos?', action: 'seo', label: 'Quedarme en SEO' };",
        "  const t = f.top;",
        "  return { title: 'PULSE', body: 'Health ' + f.health + '/100. El golpe es «' + t.title + '» en ' + t.url + '. ' + t.why + ' Optimizar es L1.', action: 'seo', label: 'Abrir SEO' };",
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
        "  saveSeo(Object.assign({}, f.s, { overrides: ov, resolved: (f.s.resolved || []).concat([t.id]), lastScan: Date.now() }));",
        "  return { title: 'PULSE', body: 'Hecho. ' + t.fixKind + ' en ' + p.url + '. Mira el score en SEO Center. No toque el canvas.', action: 'seo', label: 'Ver SEO' };",
        "}",
    ])
else:
    print("WARN falta DigitalBoostSeo.ts")

w("DigitalBoostPulseSkills.ts", [
    'import type { PulseInput } from "./DigitalBoostPulseKB";',
    'import { toolInspect, toolScoreLine } from "./DigitalBoostPulseTools";',
    'import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";',
    "function studio(i: PulseInput) { return i.section === 'website-builder' || i.section === 'store-builder' || i.section === 'builder'; }",
    "function heroDraft(f: { heroTitle: string }) {",
    "  const alt = (f.heroTitle || '').indexOf('permiso') !== -1;",
    "  return { kind: 'hero', title: alt ? 'La pieza que se explica sola.' : 'La coleccion que no pide permiso.', body: 'Una promesa. Un boton.', cta: 'Entrar' };",
    "}",
    "export function skillBriefing(i: PulseInput) {",
    "  if (i.section === 'seo') return seoSpeak();",
    "  const f = toolInspect(i);",
    "  if (studio(i)) {",
    "    const hit = f.heroTitle ? 'El hero dice «' + f.heroTitle + '»' : 'El hero esta vacio';",
    "    const next = f.genericHero ? 'Sigue siendo plantilla. Reescribirlo es L1.' : (f.missingCta ? 'Faltan ' + f.missingCta + ' CTA.' : 'El fold esta bien. SEO o 1047.');",
    "    return { title: 'PULSE', body: f.page + ', ' + f.blocks + ' bloques. ' + hit + '. ' + toolScoreLine(f) + '. ' + next, action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };",
    "  }",
    "  return { title: 'PULSE', body: f.store + ' · ' + f.range + (f.live ? ' · live' : '') + '. ' + toolScoreLine(f) + '. 1047 en preparacion y cap fino. Despacho, SEO o canvas?', action: 'dashboard', label: 'Quedarme aca' };",
    "}",
    "export function skillPlan(i: PulseInput) {",
    "  if (i.section === 'seo') return seoSpeak();",
    "  const f = toolInspect(i);",
    "  if (studio(i)) return { title: 'PULSE', body: 'Hoy en el canvas: ' + (f.genericHero ? '1) hero. ' : '1) hero con voz. ') + (f.missingCta ? '2) ' + f.missingCta + ' CTA. ' : '2) CTA ok. ') + '3) un theme. No disparamos campana.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };",
    "  return { title: 'PULSE', body: 'Hoy: 1) 1047. 2) anotar cap. 3) SEO si el health pega. 4) campana = Pulse Card, L3.', action: 'orders', label: 'Ir a Pedidos' };",
    "}",
    "export function skillAlerta(i: PulseInput) {",
    "  if (i.section === 'seo') return seoSpeak();",
    "  const f = toolInspect(i);",
    "  if (studio(i)) return { title: 'PULSE', body: toolScoreLine(f) + '. ' + (f.notes.join('. ') || 'Nada duro en el fold') + '.', action: 'website-builder', label: 'Seguir', draft: f.genericHero ? heroDraft(f) : undefined };",
    "  return { title: 'PULSE', body: toolScoreLine(f) + '. Rojos: cap, 1047, mobile. Health no escribe inventario.', action: '__health', label: 'Abrir Health' };",
    "}",
    "export function skillHero(i?: PulseInput) {",
    "  const f = toolInspect(i);",
    "  return { title: 'PULSE', body: 'El hero de ' + f.page + ' dice «' + (f.heroTitle || 'sin titulo') + '». ' + (f.genericHero ? 'Es plantilla. Te dejo una linea. L1, History revierte.' : 'Ya tiene voz. Te dejo otra por si queres tensar.') , action: 'website-builder', label: 'Aplicar hero', draft: heroDraft(f) };",
    "}",
    "export function skillSeoFix(_i?: PulseInput) { return seoFixTop(); }",
])

w("DigitalBoostPulseRouter.ts", [
    'import type { PulseInput, PulseDecision } from "./DigitalBoostPulseKB";',
    'import { toolDiff, toolInspect, toolMap, toolNba, toolOrders, toolRange, toolScoreLine, toolStock, toolTheme } from "./DigitalBoostPulseTools";',
    'import { seoFixTop, seoSpeak } from "./DigitalBoostPulseSeo";',
    "function hit(q: string, keys: string[]) { for (let i = 0; i < keys.length; i++) if (q.indexOf(keys[i]) !== -1) return true; return false; }",
    "export function routeTools(input: PulseInput, q: string, finish: (i: PulseInput, p: any) => PulseDecision): PulseDecision | null {",
    "  const f = toolInspect(input);",
    "  if (hit(q, ['seo', 'meta', 'sitemap', 'robots', 'canonical', 'indexa', 'keyword', 'auditar'])) {",
    "    if (hit(q, ['optimiz', 'fix', 'aplicar', 'correg', 'alt'])) return finish(input, seoFixTop());",
    "    return finish(input, seoSpeak());",
    "  }",
    "  if (hit(q, ['inspecc', 'auditar', 'score', 'puntaje'])) return finish(input, { title: 'PULSE', body: toolScoreLine(f) + '. ' + f.store + ' · ' + f.page + ' · ' + f.blocks + ' bloques. Hero: «' + (f.heroTitle || '-') + '». ' + (f.notes.join('. ') || 'Sin notas.'), action: input.section === 'website-builder' ? 'website-builder' : 'dashboard', label: 'Seguir' });",
    "  if (hit(q, ['mapa', 'bloques', 'estructura', 'outline'])) return finish(input, { title: 'PULSE', body: toolMap(f), action: 'website-builder', label: 'Abrir canvas' });",
    "  if (hit(q, ['siguiente', 'nba', 'que hago', 'qué hago', 'golpe'])) return finish(input, toolNba(f));",
    "  if (hit(q, ['diff', 'compar', 'antes'])) return finish(input, toolDiff(f));",
    "  if (hit(q, ['theme', 'noir', 'aura', 'nimbus', 'preset'])) return finish(input, toolTheme(f));",
    "  if (hit(q, ['publicar', 'publish', 'lanzar'])) { const ok = f.score >= 70 && !f.genericHero; return finish(input, { title: 'PULSE', body: toolScoreLine(f) + '. ' + (ok ? 'Fold listo para Preview. Publicar no dispara campana.' : 'Todavia no: ' + (f.notes.join(', ') || 'sube el score') + '.'), action: 'website-builder', label: 'Seguir' }); }",
    "  if (hit(q, ['rango', '7d', '30d', '90d'])) return finish(input, toolRange(f));",
    "  if (hit(q, ['1048', '1047', 'pedido', 'despacho', 'envio'])) return finish(input, toolOrders(f));",
    "  if (hit(q, ['stock', 'cap', 'invent', 'sku'])) return finish(input, toolStock(f));",
    "  return null;",
    "}",
])

# operator: tray + say + navigate
op = src / "DigitalBoostOperator.tsx"
if op.is_file():
    o = op.read_text(encoding="utf-8")
    if "seo: " not in o:
        for a, b in [
            ('hola: "Hola"', 'hola: "Hola", seo: "Como esta el recorte?", publicar: "Podemos publicar?"'),
            ("hola: 'Hola'", "hola: 'Hola', seo: 'Como esta el recorte?'"),
        ]:
            if a in o:
                o = o.replace(a, b, 1)
                print("ok say")
                break
    if '["seo"' not in o:
        for a, b in [
            ('["theme", "Theme"]', '["theme", "Theme"], ["seo", "SEO"], ["publicar", "Publicar"]'),
            ("['theme', 'Theme']", "['theme', 'Theme'], ['seo', 'SEO']"),
        ]:
            if a in o:
                o = o.replace(a, b, 1)
                print("ok tray")
                break
    # navigate seo
    if '=== "seo"' not in o and "go === 'seo'" not in o:
        o = o.replace(
            "if (d.action === \"website-builder\"",
            "if (d.action === \"seo\" || d.action === \"website-builder\"",
            1,
        )
        o = o.replace(
            "if (d.action === 'website-builder'",
            "if (d.action === 'seo' || d.action === 'website-builder'",
            1,
        )
        print("ok action")
    op.write_text(o, encoding="utf-8")
else:
    print("no operator")

ws = src / "StoreBuilderWorkspace.tsx"
if ws.is_file():
    t = ws.read_text(encoding="utf-8")
    if "DigitalBoostSeoCenter" in t and 'id === "seo"' not in t:
        if 'if (id === "website-builder")' in t:
            t = t.replace(
                'if (id === "website-builder")',
                'if (id === "seo") { setSection("seo"); return; }\n    if (id === "website-builder")',
                1,
            )
            print("ok ws seo")
            ws.write_text(t, encoding="utf-8")
        else:
            print("ws sin hook")
    else:
        print("ws ok")

# tools NBA voice
tools = src / "DigitalBoostPulseTools.ts"
if tools.is_file():
    x = tools.read_text(encoding="utf-8")
    x = x.replace(
        "El recorte esta en el hero de plantilla. Reescribirlo es L1.",
        "El hero sigue de plantilla. Reescribirlo es L1, no una campana.",
    )
    x = x.replace(
        "Faltan " ,
        "Faltan ",
    )
    tools.write_text(x, encoding="utf-8")
    print("ok tools voice")

print("LISTO PROMPT OS")
