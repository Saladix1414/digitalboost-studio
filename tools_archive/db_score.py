#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
p = src / "DigitalBoostSeo.ts"
if not p.is_file():
    raise SystemExit("cd digitalboost-studio y corre db_seo_full.py")
t = p.read_text(encoding="utf-8")
block = [
"",
"const W: Record<string, number> = { technical: 18, onpage: 18, index: 14, content: 14, links: 10, images: 8, schema: 10, performance: 8 };",
"const PEN: Record<string, number> = { critical: 22, high: 12, medium: 6, low: 3 };",
"export function scoreCats(issues: any[]) {",
"  const ids = Object.keys(W);",
"  return ids.map(function (id) {",
"    const mine = issues.filter(function (i) { return (i.cat || 'onpage') === id; });",
"    let s = 100;",
"    mine.forEach(function (i) { s -= PEN[i.severity] || 4; });",
"    if (s < 0) s = 0;",
"    return { id: id, score: s, n: mine.length, passed: mine.length === 0 };",
"  });",
"}",
"export function healthOf(issues: any[]) {",
"  const cats = scoreCats(issues);",
"  let h = 0;",
"  cats.forEach(function (c) { h += c.score * ((W[c.id] || 0) / 100); });",
"  return Math.round(Math.max(0, Math.min(100, h)));",
"}",
"export function explainScore(issues: any[]) {",
"  const h = healthOf(issues);",
"  const band = h >= 80 ? 'sano' : h >= 60 ? 'justo' : 'rojo';",
"  const cats = scoreCats(issues).filter(function (c) { return !c.passed; }).sort(function (a, b) { return a.score - b.score; });",
"  const worst = cats[0];",
"  return 'Health ' + h + '/100 (' + band + '). ' + (worst ? 'El recorte esta en ' + worst.id + ' (' + worst.score + ').' : 'Categorias en verde.') + ' Pesos: technical 18 onpage 18 index 14 content 14 links 10 images 8 schema 10 performance 8. Performance queda 100 sin Lighthouse.';",
"}",
]
# replace old healthOf
start = t.find("export function healthOf")
if start >= 0:
    end = t.find("export function", start + 10)
    if end < 0:
        end = len(t)
    t = t[:start] + "\n".join(block) + "\n" + t[end:]
    print("ok replace health")
else:
    t = t.rstrip() + "\n" + "\n".join(block) + "\n"
    print("ok append")
p.write_text(t, encoding="utf-8")

# pulse uses explain
seo = src / "DigitalBoostPulseSeo.ts"
if seo.is_file():
    s = seo.read_text(encoding="utf-8")
    if "explainScore" not in s:
        s = s.replace(
            'from "./DigitalBoostSeo";',
            'from "./DigitalBoostSeo";\nimport { explainScore } from "./DigitalBoostSeo";',
            1,
        )
        # cleaner single import
        s = s.replace(
            'import { buildPages, healthOf, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";\nimport { explainScore } from "./DigitalBoostSeo";',
            'import { buildPages, explainScore, healthOf, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";',
            1,
        )
        s = s.replace(
            "return { title: 'PULSE', body: 'Health ' + f.health + '/100. El golpe es «'",
            "return { title: 'PULSE', body: explainScore(f.issues) + ' El golpe es «'",
            1,
        )
        seo.write_text(s, encoding="utf-8")
        print("ok pulse explain")

ui = src / "DigitalBoostSeoCenter.tsx"
if ui.is_file():
    u = ui.read_text(encoding="utf-8")
    if "scoreCats" not in u:
        u = u.replace(
            'from "./DigitalBoostSeo";',
            'from "./DigitalBoostSeo";',
            1,
        )
        u = u.replace(
            "healthOf, jsonLd",
            "explainScore, healthOf, jsonLd, scoreCats",
            1,
        )
        u = u.replace(
            "healthOf, jsonLd",
            "explainScore, healthOf, jsonLd, scoreCats",
            1,
        )
        if "explainScore" not in u:
            u = u.replace(
                'healthOf,',
                'explainScore, healthOf, scoreCats,',
                1,
            )
        if "scoreCats(" not in u:
            u = u.replace(
                "{tab==='overview'&&(",
                "{tab==='overview'&&(<div>{scoreCats(issues).map(function(c){return <div key={c.id} className=\"mb-1 flex justify-between rounded-xl border border-white/10 px-3 py-2 text-xs\"><span>{c.id}</span><span>{c.score} {c.passed?'passed':c.n+' issues'}</span></div>;})}<p className=\"mt-3 text-[11px] text-[#AFC0D5]\">{explainScore(issues)}</p>",
                1,
            )
            print("ok overview cats")
        ui.write_text(u, encoding="utf-8")
print("LISTO SCORE")
