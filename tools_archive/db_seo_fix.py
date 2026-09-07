#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not (src / "DigitalBoostSeo.ts").is_file():
    raise SystemExit("cd digitalboost-studio")
U = [
'import { useEffect, useMemo, useState } from "react";',
'import { DEFAULT_ROBOTS, TABS, buildPages, explainScore, healthOf, jsonLd, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues, scoreCats, sitemapXml, wouldLoop } from "./DigitalBoostSeo";',
"export default function DigitalBoostSeoCenter() {",
"  const [s, setS] = useState(function () { return loadSeo(); });",
"  const [tab, setTab] = useState('overview');",
"  const [log, setLog] = useState('SEO Center listo');",
"  const [sel, setSel] = useState(null as any);",
"  const [draft, setDraft] = useState({ title: '', description: '', canonical: '', indexable: true });",
"  const [from, setFrom] = useState('');",
"  const [to, setTo] = useState('');",
"  const [robots, setRobots] = useState('');",
"  const pages = useMemo(function () { return buildPages(s); }, [s]);",
"  const issues = useMemo(function () { return scanIssues(pages, s); }, [pages, s]);",
"  const health = healthOf(issues);",
"  const cats = scoreCats(issues);",
"  useEffect(function () {",
"    setRobots(s.robots || DEFAULT_ROBOTS);",
"    document.body.classList.add('db-seo-open');",
"    const el = document.getElementById('db-studio-dock');",
"    if (el) el.style.display = 'none';",
"    return function () {",
"      document.body.classList.remove('db-seo-open');",
"      if (el) el.style.display = '';",
"    };",
"  }, []);",
"  function commit(n: any, msg: string) { saveSeo(n); setS(JSON.parse(JSON.stringify(n))); setLog(msg); }",
"  function fix(iss: any) {",
"    const p = pages.find(function (x) { return x.id === iss.pageId; });",
"    if (!p) { setLog('sin pagina'); return; }",
"    const ov = Object.assign({}, s.overrides || {});",
"    const cur = Object.assign({}, ov[p.id] || {});",
"    if (iss.fixKind === 'title') cur.title = pulseTitle(p);",
"    if (iss.fixKind === 'desc') cur.description = pulseDesc(p);",
"    if (iss.fixKind === 'noindex') cur.indexable = false;",
"    if (iss.fixKind === 'alt') cur.alt = pulseAlt(p);",
"    ov[p.id] = cur;",
"    commit(Object.assign({}, s, { overrides: ov, resolved: (s.resolved || []).concat([iss.id]) }), 'Fix ' + iss.fixKind + ' ' + p.url);",
"  }",
"  function openP(p: any) { setSel(p); setDraft({ title: p.title, description: p.description, canonical: p.canonical, indexable: p.indexable }); setTab('pages'); }",
"  const crit = issues.filter(function (i) { return i.severity === 'critical'; }).length;",
"  return (",
'    <div className="relative z-[80] space-y-4">',
'      <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">{log}</p>',
'      <div className="flex flex-wrap items-center justify-between gap-2">',
'        <div><p className="text-lg font-semibold text-white">SEO Center</p><p className="text-sm text-[#AFC0D5]">Health {health}/100 · {crit} critical</p></div>',
'        <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { commit(Object.assign({}, s, { lastScan: Date.now(), log: (s.log || []).concat([{ t: Date.now(), score: health, critical: crit }]).slice(-12) }), explainScore(issues)); }}>Run SEO Scan</button>',
"      </div>",
'      <div className="flex gap-1 overflow-x-auto">',
"        {TABS.map(function (t) { return <button key={t} type=\"button\" onClick={function () { setTab(t); }} className={'h-9 shrink-0 rounded-full px-3 text-[10px] uppercase ' + (tab === t ? 'bg-cyan-400 text-[#070D18]' : 'border border-white/10 text-[#AFC0D5]')}>{t}</button>; })}",
"      </div>",
"      {tab === 'overview' && (",
'        <div className="space-y-2">',
"          {cats.map(function (c) { return <div key={c.id} className=\"flex justify-between rounded-xl border border-white/10 px-3 py-2 text-xs\"><span>{c.id}</span><span>{c.score} {c.passed ? 'passed' : c.n + ' issues'}</span></div>; })}",
'          <p className="text-[11px] text-[#AFC0D5]">{explainScore(issues)}</p>',
"        </div>",
"      )}",
"      {tab === 'audit' && issues.map(function (i) { return <div key={i.id} className=\"mb-2 rounded-xl border border-white/10 p-4\"><div className=\"text-[10px] uppercase text-amber-200\">{i.severity}</div><div className=\"font-semibold\">{i.title}</div><p className=\"text-[11px] text-[#AFC0D5]\">{i.url} · {i.why}</p><button type=\"button\" className=\"mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-[11px] font-semibold text-[#070D18]\" onClick={function () { fix(i); }}>Fix</button></div>; })}",
"      {tab === 'pages' && pages.map(function (p) { return <button key={p.id} type=\"button\" onClick={function () { openP(p); }} className=\"mb-1 flex w-full justify-between rounded-xl border border-white/10 px-3 py-3 text-left text-xs\"><span className=\"font-mono text-cyan-300\">{p.url}</span><span>{p.type}</span></button>; })}",
"      {tab === 'pages' && sel && (",
'        <div className="space-y-2">',
'          <input className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" value={draft.title} onChange={function (e) { setDraft(Object.assign({}, draft, { title: e.target.value })); }} />',
'          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2" value={draft.description} onChange={function (e) { setDraft(Object.assign({}, draft, { description: e.target.value })); }} />',
'          <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[sel.id] = Object.assign({}, ov[sel.id] || {}, draft); commit(Object.assign({}, s, { overrides: ov }), "Guardado " + sel.url); }}>Guardar</button>',
'          <div className="rounded-xl bg-white p-4 text-black"><div className="text-[10px] uppercase">Preview · no es Google</div><div className="text-sm text-blue-700">{draft.title}</div><div className="text-xs">{draft.description}</div></div>',
"        </div>",
"      )}",
"      {tab === 'products' && pages.filter(function (p) { return p.type === 'Product'; }).map(function (p) { return <div key={p.id} className=\"mb-2 flex justify-between rounded-xl border border-white/10 p-3 text-sm\"><span>{p.h1}</span><button type=\"button\" className=\"h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]\" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[p.id] = { title: pulseTitle(p), description: pulseDesc(p), alt: pulseAlt(p) }; commit(Object.assign({}, s, { overrides: ov }), 'opt ' + p.h1); }}>Optimize</button></div>; })}",
"      {tab === 'keywords' && <p className=\"text-sm text-[#AFC0D5]\">Connect Google Search Console. Sin OAuth no hay volume.</p>}",
"      {tab === 'structured' && pages.filter(function (p) { return p.type === 'Product' || p.type === 'Homepage'; }).map(function (p) { return <pre key={p.id} className=\"mb-2 overflow-auto rounded-xl border border-white/10 p-3 text-[11px] text-[#AFC0D5]\">{JSON.stringify(jsonLd(p), null, 2)}</pre>; })}",
"      {tab === 'sitemaps' && <pre className=\"text-[11px] text-[#AFC0D5]\">{sitemapXml(pages)}</pre>}",
"      {tab === 'redirects' && (",
"        <div>",
'          <input className="mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="/old" value={from} onChange={function (e) { setFrom(e.target.value); }} />',
'          <input className="mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="/new" value={to} onChange={function (e) { setTo(e.target.value); }} />',
'          <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { const f = from[0] === "/" ? from : "/" + from; const d = to[0] === "/" ? to : "/" + to; if (wouldLoop(s.redirects || [], f, d)) { setLog("loop"); return; } commit(Object.assign({}, s, { redirects: (s.redirects || []).concat([{ id: Date.now(), from: f, to: d, code: 301 }]) }), "301"); }}>Add 301</button>',
"        </div>",
"      )}",
"      {tab === 'images' && pages.filter(function (p) { return p.type === 'Product'; }).map(function (p) { return <div key={p.id} className=\"mb-2 flex justify-between rounded-xl border border-white/10 p-3 text-sm\"><span>{p.h1}</span><button type=\"button\" className=\"h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]\" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[p.id] = Object.assign({}, ov[p.id] || {}, { alt: pulseAlt(p) }); commit(Object.assign({}, s, { overrides: ov }), 'alt'); }}>Write alt</button></div>; })}",
"      {tab === 'settings' && (",
"        <div>",
'          <textarea className="min-h-40 w-full rounded-xl border border-white/10 bg-[#0A1020] p-3 font-mono text-xs" value={robots} onChange={function (e) { setRobots(e.target.value); }} />',
'          <button type="button" className="mt-2 h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { commit(Object.assign({}, s, { robots: robots }), "robots ok"); }}>Guardar robots</button>',
"        </div>",
"      )}",
"      {tab === 'collections' && pages.filter(function (p) { return p.type === 'Collection'; }).map(function (p) { return <div key={p.id} className=\"rounded-xl border border-white/10 p-4\"><div>{p.h1}</div><button type=\"button\" className=\"mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]\" onClick={function () { openP(p); }}>Editar</button></div>; })}",
"      {tab === 'technical' && pages.map(function (p) { return <div key={p.id} className=\"flex justify-between py-2 font-mono text-xs\"><span>{p.url}</span><span>{p.indexable ? 'Indexable' : 'Noindex'}</span></div>; })}",
"      {tab === 'links' && pages.filter(function (p) { return p.indexable; }).map(function (p) { return <div key={p.id} className=\"flex justify-between py-2 text-xs\"><span className=\"font-mono\">{p.url}</span></div>; })}",
"      {tab === 'reports' && ((s.log || []).length ? (s.log || []).slice().reverse().map(function (r: any) { return <div key={r.t} className=\"flex justify-between text-xs\"><span>{new Date(r.t).toLocaleString()}</span><span>{r.score}</span></div>; }) : <p className=\"text-sm text-[#AFC0D5]\">Sin scans.</p>)}",
"    </div>",
"  );",
"}",
]
(src / "DigitalBoostSeoCenter.tsx").write_text("\n".join(U) + "\n", encoding="utf-8")
print("ok rewrite", len(U))

# healthOf duplicate check
eng = (src / "DigitalBoostSeo.ts").read_text(encoding="utf-8")
if eng.count("export function healthOf") > 1:
    first = eng.find("export function healthOf")
    second = eng.find("export function healthOf", first + 10)
    if second > 0:
        nxt = eng.find("export function", second + 10)
        if nxt < 0:
            nxt = len(eng)
        eng = eng[:second] + eng[nxt:]
        (src / "DigitalBoostSeo.ts").write_text(eng, encoding="utf-8")
        print("ok dedupe health")
print("LISTO FIX")
