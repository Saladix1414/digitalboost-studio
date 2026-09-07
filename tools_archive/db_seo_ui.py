#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not (src / "DigitalBoostSeo.ts").is_file():
    raise SystemExit("corre db_seo_lib.py primero")
U = [
'import { useMemo, useState } from "react";',
'import { buildPages, healthOf, loadSeo, pulseDesc, pulseTitle, saveSeo, scanIssues, DEFAULT_ROBOTS } from "./DigitalBoostSeo";',
"const TABS = ['overview','audit','pages','products','technical','sitemaps','redirects','settings'];",
"export default function DigitalBoostSeoCenter() {",
"  const [s, setS] = useState(loadSeo);",
"  const [tab, setTab] = useState('overview');",
"  const [phase, setPhase] = useState('idle');",
"  const pages = useMemo(function () { return buildPages(s); }, [s]);",
"  const issues = useMemo(function () { return scanIssues(pages, s); }, [pages, s]);",
"  const health = healthOf(issues);",
"  function commit(n: any) { saveSeo(n); setS(n); }",
"  function scan() {",
"    setPhase('scanning');",
"    setTimeout(function () { setPhase('analyzing'); }, 400);",
"    setTimeout(function () { const n = Object.assign({}, s, { lastScan: Date.now(), log: (s.log || []).concat([{ t: Date.now(), score: health }]).slice(-12) }); commit(n); setPhase('done'); }, 900);",
"  }",
"  function fix(iss: any) {",
"    const ov = Object.assign({}, s.overrides || {});",
"    const p = pages.find(function (x) { return x.id === iss.pageId; });",
"    if (!p) return;",
"    const cur = Object.assign({}, ov[p.id] || {});",
"    if (iss.fixKind === 'title') cur.title = pulseTitle(p);",
"    if (iss.fixKind === 'desc') cur.description = pulseDesc(p);",
"    if (iss.fixKind === 'noindex') cur.indexable = false;",
"    ov[p.id] = cur;",
"    commit(Object.assign({}, s, { overrides: ov, resolved: (s.resolved || []).concat([iss.id]) }));",
"  }",
"  return (",
'    <div className="flex h-full min-h-0 flex-col bg-[#070D18] text-[#F7FAFF]">',
'      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">',
"        <div>",
'          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">SEO Center · Aura</div>',
'          <div className="text-xs text-[#AFC0D5]">Health {health}/100 · {phase === "scanning" ? "Scanning" : phase === "analyzing" ? "Analyzing" : (s.lastScan ? "scan listo" : "sin scan")}</div>',
"        </div>",
'        <button type="button" onClick={scan} className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]">Run SEO Scan</button>',
"      </div>",
'      <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-2 py-2">',
"        {TABS.map(function (t) { return <button key={t} type=\"button\" onClick={function () { setTab(t); }} className={'h-9 shrink-0 rounded-full px-3 text-[11px] ' + (tab === t ? 'bg-cyan-400 text-[#070D18]' : 'text-[#AFC0D5]')}>{t}</button>; })}",
"      </div>",
'      <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">',
"        {tab === 'overview' && <p>Errores {issues.filter(function (i) { return i.severity === 'critical'; }).length}. Warnings {issues.filter(function (i) { return i.severity !== 'critical'; }).length}. Sin Search Console no hay posiciones.</p>}",
"        {tab === 'audit' && issues.map(function (i) { return <div key={i.id} className=\"mb-2 rounded-xl border border-white/10 p-3\"><div className=\"text-[10px] uppercase text-amber-200\">{i.severity}</div><div className=\"font-semibold\">{i.title}</div><p className=\"text-xs text-[#AFC0D5]\">{i.url} · {i.why}</p>{i.fixKind !== 'none' && <button type=\"button\" className=\"mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]\" onClick={function () { fix(i); }}>Fix</button>}</div>; })}",
"        {tab === 'pages' && pages.map(function (p) { return <div key={p.id} className=\"mb-2 rounded-xl border border-white/10 px-3 py-2 font-mono text-xs\">{p.url} · {p.type} · {p.indexable ? 'index' : 'noindex'} · {p.title}</div>; })}",
"        {tab === 'products' && pages.filter(function (p) { return p.type === 'Product'; }).map(function (p) { return <div key={p.id} className=\"mb-2 rounded-xl border border-white/10 p-3\"><div>{p.h1}</div><button type=\"button\" className=\"mt-2 h-10 rounded-lg border border-white/10 px-3 text-xs\" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[p.id] = { title: pulseTitle(p), description: pulseDesc(p) }; commit(Object.assign({}, s, { overrides: ov })); }}>Optimize with PULSE</button></div>; })}",
"        {tab === 'technical' && pages.map(function (p) { return <div key={p.id} className=\"border-b border-white/10 py-2 font-mono text-xs\">{p.url} · {p.indexable ? 'Indexable' : 'Noindex'}</div>; })}",
"        {tab === 'sitemaps' && <pre className=\"whitespace-pre-wrap text-[11px] text-[#AFC0D5]\">{pages.filter(function (p) { return p.indexable; }).map(function (p) { return BASE_SAFE(p.url); }).join('\\n')}</pre>}",
"        {tab === 'redirects' && <Redirects s={s} commit={commit} />}",
"        {tab === 'settings' && <Settings s={s} commit={commit} />}",
"      </div>",
"    </div>",
"  );",
"}",
"function BASE_SAFE(url: string) { return 'https://aura.digitalboost.shop' + (url === '/' ? '/' : url); }",
"function Redirects(props: { s: any; commit: (n: any) => void }) {",
"  const [from, setFrom] = useState(''); const [to, setTo] = useState('');",
"  return (",
'    <div>',
'      <input className="mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="/old" value={from} onChange={function (e) { setFrom(e.target.value); }} />',
'      <input className="mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="/new" value={to} onChange={function (e) { setTo(e.target.value); }} />',
'      <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { const f = from[0] === "/" ? from : "/" + from; const t = to[0] === "/" ? to : "/" + to; if (f === t) return; props.commit(Object.assign({}, props.s, { redirects: (props.s.redirects || []).concat([{ id: Date.now(), from: f, to: t, code: 301 }]) })); }}>Add 301</button>',
"      {(props.s.redirects || []).map(function (r: any) { return <div key={r.id} className=\"mt-2 font-mono text-xs\">{r.code} {r.from} → {r.to}</div>; })}",
"    </div>",
"  );",
"}",
"function Settings(props: { s: any; commit: (n: any) => void }) {",
"  const [robots, setRobots] = useState(props.s.robots || DEFAULT_ROBOTS);",
"  return (",
"    <div>",
'      <textarea className="min-h-40 w-full rounded-xl border border-white/10 bg-[#0A1020] p-3 font-mono text-xs" value={robots} onChange={function (e) { setRobots(e.target.value); }} />',
'      <button type="button" className="mt-2 h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { props.commit(Object.assign({}, props.s, { robots: robots })); }}>Guardar robots</button>',
'      <button type="button" className="ml-2 h-11 rounded-lg border border-white/10 px-4 text-xs" onClick={function () { setRobots(DEFAULT_ROBOTS); props.commit(Object.assign({}, props.s, { robots: DEFAULT_ROBOTS })); }}>Reset</button>',
"    </div>",
"  );",
"}",
]
(src / "DigitalBoostSeoCenter.tsx").write_text("\n".join(U) + "\n", encoding="utf-8")
print("ok ui")

ws = src / "StoreBuilderWorkspace.tsx"
if ws.is_file():
    t = ws.read_text(encoding="utf-8")
    if 'from "./DigitalBoostSeoCenter"' not in t:
        t = 'import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";\n' + t
        print("ok import")
    if '| "seo"' not in t and '| "website-builder"' in t:
        t = t.replace('| "website-builder"', '| "website-builder" | "seo"', 1)
        print("ok type")
    if 'id: "seo"' not in t and "id: \"analytics\"" in t:
        t = t.replace(
            'id: "analytics"',
            'id: "analytics"',
            1,
        )
    if 'case "seo"' not in t and 'case "analytics"' in t:
        t = t.replace(
            'case "analytics":',
            'case "seo":\n        return <DigitalBoostSeoCenter />;\n      case "analytics":',
            1,
        )
        print("ok case")
    elif 'case "seo"' not in t and 'case "dashboard"' in t:
        t = t.replace(
            'case "dashboard":',
            'case "seo":\n        return <DigitalBoostSeoCenter />;\n      case "dashboard":',
            1,
        )
        print("ok case dash")
    # nav chip
    if 'setSection("seo")' not in t and "SEO" not in t[t.find("Analytics") if "Analytics" in t else 0:]:
        pass
    ws.write_text(t, encoding="utf-8")
print("LISTO SEO UI")
print("si no hay item SEO en el menu, el case ya abre con setSection('seo')")
