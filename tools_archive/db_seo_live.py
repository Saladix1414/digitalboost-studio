#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

# --- engine if missing ---
if not (src / "DigitalBoostSeo.ts").is_file():
    print("Falta DigitalBoostSeo.ts — corre db_seo_lib.py primero")
    raise SystemExit(1)

U = [
'import { useMemo, useState } from "react";',
'import { buildPages, healthOf, loadSeo, pulseDesc, pulseTitle, saveSeo, scanIssues } from "./DigitalBoostSeo";',
"export default function DigitalBoostSeoCenter() {",
"  const [s, setS] = useState(loadSeo);",
"  const [phase, setPhase] = useState('idle');",
"  const [picked, setPicked] = useState(null as any);",
"  const pages = useMemo(function () { return buildPages(s); }, [s]);",
"  const issues = useMemo(function () { return scanIssues(pages, s); }, [pages, s]);",
"  const health = healthOf(issues);",
"  const crit = issues.filter(function (i) { return i.severity === 'critical'; }).length;",
"  const warn = issues.filter(function (i) { return i.severity === 'high' || i.severity === 'medium'; }).length;",
"  const ok = Math.max(0, 18 - issues.length);",
"  function commit(n: any) { saveSeo(n); setS(Object.assign({}, n)); }",
"  function scan() {",
"    setPhase('scanning');",
"    setTimeout(function () { setPhase('analyzing'); }, 350);",
"    setTimeout(function () { commit(Object.assign({}, s, { lastScan: Date.now() })); setPhase('done'); }, 900);",
"  }",
"  function fix(iss: any) {",
"    const p = pages.find(function (x) { return x.id === iss.pageId; });",
"    if (!p) return;",
"    const ov = Object.assign({}, s.overrides || {});",
"    const cur = Object.assign({}, ov[p.id] || {});",
"    if (iss.fixKind === 'title') cur.title = pulseTitle(p);",
"    if (iss.fixKind === 'desc') cur.description = pulseDesc(p);",
"    if (iss.fixKind === 'noindex') cur.indexable = false;",
"    ov[p.id] = cur;",
"    commit(Object.assign({}, s, { overrides: ov, resolved: (s.resolved || []).concat([iss.id]) }));",
"    setPicked(null);",
"  }",
"  function pulseAll() {",
"    const ov = Object.assign({}, s.overrides || {});",
"    pages.filter(function (p) { return p.type === 'Product' || p.type === 'Homepage' || p.type === 'Collection'; }).forEach(function (p) {",
"      ov[p.id] = Object.assign({}, ov[p.id] || {}, { title: pulseTitle(p), description: pulseDesc(p) });",
"    });",
"    commit(Object.assign({}, s, { overrides: ov }));",
"  }",
"  const label = health >= 80 ? 'Buen estado general' : health >= 60 ? 'Justo' : 'Atencion';",
"  return (",
'    <div className="space-y-6">',
'      <div className="flex flex-wrap items-center gap-3">',
"        <div>",
'          <p className="text-lg font-semibold text-white">SEO Manager</p>',
'          <p className="mt-1 text-sm text-[#AFC0D5]">Centro de inteligencia SEO · Nimbus · datos del canvas y el catalogo.</p>',
"        </div>",
"      </div>",
'      <div className="grid gap-4 md:grid-cols-4">',
'        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/20 p-5"><p className="text-[10px] uppercase tracking-wider text-[#AFC0D5]">SEO Score</p><p className="mt-2 text-3xl font-bold text-white">{health}<span className="text-sm text-[#AFC0D5]">/100</span></p><p className="mt-1 text-[11px] text-emerald-300">{label}</p></div>',
'        <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5"><p className="text-[10px] uppercase tracking-wider text-[#AFC0D5]">Correctos</p><p className="mt-2 text-3xl font-bold text-emerald-300">{ok}</p><p className="mt-1 text-[11px] text-[#AFC0D5]">Checks en verde</p></div>',
'        <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5"><p className="text-[10px] uppercase tracking-wider text-[#AFC0D5]">Oportunidades</p><p className="mt-2 text-3xl font-bold text-amber-300">{warn}</p><p className="mt-1 text-[11px] text-[#AFC0D5]">High / medium</p></div>',
'        <div className="rounded-2xl border border-red-400/15 bg-red-500/5 p-5"><p className="text-[10px] uppercase tracking-wider text-[#AFC0D5]">Atencion</p><p className="mt-2 text-3xl font-bold text-red-300">{crit}</p><p className="mt-1 text-[11px] text-[#AFC0D5]">Critical</p></div>',
"      </div>",
'      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">',
'        <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">',
'          <div className="flex items-center justify-between gap-3">',
"            <div>",
'              <p className="text-sm font-semibold text-white">Oportunidades SEO</p>',
'              <p className="mt-1 text-xs text-[#AFC0D5]">{phase === "scanning" ? "Scanning…" : phase === "analyzing" ? "Analyzing…" : "Priorizado por severidad. Fix escribe override local."}</p>',
"            </div>",
'            <button type="button" onClick={scan} className="rounded-lg border border-violet-400/20 px-3 py-2 text-[10px] text-violet-300">Auditar tienda</button>',
"          </div>",
'          <div className="mt-5 space-y-3">',
"            {issues.length === 0 && <p className=\"text-xs text-[#AFC0D5]\">Sin issues abiertos. Corre Auditar tienda.</p>}",
"            {issues.map(function (i) {",
"              return (",
'                <div key={i.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#070D18] p-4 sm:flex-row sm:items-center sm:justify-between">',
"                  <div>",
'                    <p className="text-xs font-semibold text-white">{i.title}</p>',
'                    <p className="mt-1 text-[11px] leading-5 text-[#AFC0D5]">{i.url} · {i.description}</p>',
"                  </div>",
"                  <div className=\"flex gap-1\">",
'                    <button type="button" className="h-10 rounded-lg border border-white/10 px-3 text-[10px]" onClick={function () { setPicked(i); }}>Revisar</button>',
"                    {i.fixKind !== 'none' && <button type=\"button\" className=\"h-10 rounded-lg border border-[#00B7FF]/30 px-3 text-[10px] text-white\" onClick={function () { fix(i); }}>Optimizar</button>}",
"                  </div>",
"                </div>",
"              );",
"            })}",
"          </div>",
"        </div>",
'        <div className="rounded-2xl border border-violet-400/20 bg-violet-500/20 p-5">',
'          <p className="text-sm font-semibold text-white">AI SEO</p>',
'          <p className="mt-2 text-xs leading-6 text-[#AFC0D5]">PULSE aplica plantillas del catalogo. No llama a un modelo externo. Pedi confirmacion: el boton de abajo pisa titles/descriptions de home, productos y colecciones.</p>',
'          <button type="button" onClick={pulseAll} className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-[11px] font-semibold text-white">Analizar con AI</button>',
"        </div>",
"      </div>",
"      {picked && (",
'        <div className="rounded-2xl border border-white/10 bg-[#0B1B30] p-5">',
'          <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-300">{picked.severity}</p>',
'          <p className="mt-2 text-sm font-semibold">{picked.title}</p>',
'          <p className="mt-2 text-xs text-[#AFC0D5]">{picked.why}</p>',
'          <p className="mt-1 text-xs text-[#AFC0D5]">{picked.fix}</p>',
'          <button type="button" className="mt-3 h-10 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]" onClick={function () { if (picked.fixKind !== "none") fix(picked); else setPicked(null); }}>Aplicar</button>',
"        </div>",
"      )}",
'      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/15 p-5 text-xs text-[#AFC0D5]">SEO lee el canvas (db-store-canvas-v1) y el catalogo. Keywords/GSC no aparecen: no hay fuente. El dock de Store Builder no deberia verse aca.</div>',
"    </div>",
"  );",
"}",
]
(src / "DigitalBoostSeoCenter.tsx").write_text("\n".join(U) + "\n", encoding="utf-8")
print("ok center")

ws = src / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("no workspace")
t = ws.read_text(encoding="utf-8")
if 'from "./DigitalBoostSeoCenter"' not in t and "from './DigitalBoostSeoCenter'" not in t:
    t = 'import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";\n' + t
    print("ok import")
a = t.find('case "seo":')
if a < 0:
    print("NO case seo")
else:
    b = t.find('case "', a + 8)
    if b < 0:
        print("no next case")
    else:
        t = t[:a] + 'case "seo":\n        return (\n          <DigitalBoostSeoCenter />\n        );\n\n      ' + t[b:]
        print("ok replace case")
ws.write_text(t, encoding="utf-8")
print("LISTO LIVE")
