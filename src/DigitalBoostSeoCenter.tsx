import { useEffect, useMemo, useState } from "react";
import { DEFAULT_ROBOTS, TABS, buildPages, explainScore, healthOf, jsonLd, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues, scoreCats, sitemapXml, wouldLoop, titlePx, descPx, utmOf, reportMd, addKeyword, cannibal } from "./DigitalBoostSeo";
export default function DigitalBoostSeoCenter() {
  const [s, setS] = useState(function () { return loadSeo(); });
  const [tab, setTab] = useState(function () { try { return localStorage.getItem('db-seo-tab-v1') || 'overview'; } catch { return 'overview'; } });
  const [log, setLog] = useState('SEO Center listo');
  const [sel, setSel] = useState(null as any);
  const [draft, setDraft] = useState({ title: '', description: '', canonical: '', indexable: true });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [robots, setRobots] = useState('');
  const [kw, setKw] = useState('');
  const [kwUrl, setKwUrl] = useState('/');
  const [utm, setUtm] = useState({ u: '/', s: 'pulse', m: 'seo', c: 'nimbus' });
  const pages = useMemo(function () { return buildPages(s); }, [s]);
  const issues = useMemo(function () { return scanIssues(pages, s); }, [pages, s]);
  const health = healthOf(issues);
  const cats = scoreCats(issues);
  useEffect(function () {
    setRobots(s.robots || DEFAULT_ROBOTS);
    document.body.classList.add('db-seo-open');
    const el = document.getElementById('db-studio-dock');
    if (el) el.style.display = 'none';
    return function () {
      document.body.classList.remove('db-seo-open');
      if (el) el.style.display = '';
    };
  }, []);
  function commit(n: any, msg: string) { saveSeo(n); setS(JSON.parse(JSON.stringify(n))); setLog(msg); }
  function fix(iss: any) {
    const p = pages.find(function (x) { return x.id === iss.pageId; });
    if (!p) { setLog('sin pagina'); return; }
    const ov = Object.assign({}, s.overrides || {});
    const cur = Object.assign({}, ov[p.id] || {});
    if (iss.fixKind === 'title') cur.title = pulseTitle(p);
    if (iss.fixKind === 'desc') cur.description = pulseDesc(p);
    if (iss.fixKind === 'noindex') cur.indexable = false;
    if (iss.fixKind === 'alt') cur.alt = pulseAlt(p);
    ov[p.id] = cur;
    commit(Object.assign({}, s, { overrides: ov, resolved: (s.resolved || []).concat([iss.id]) }), 'Fix ' + iss.fixKind + ' ' + p.url);
  }
  function openP(p: any) { setSel(p); setDraft({ title: p.title, description: p.description, canonical: p.canonical, indexable: p.indexable }); setTab('pages'); }
  const crit = issues.filter(function (i) { return i.severity === 'critical'; }).length;
  return (
    <div className="relative z-[80] space-y-4">
      <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">{log}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-lg font-semibold text-white">SEO Center</p><p className="text-sm text-[#AFC0D5]">Health {health}/100 · {crit} critical</p></div>
        <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { commit(Object.assign({}, s, { lastScan: Date.now(), log: (s.log || []).concat([{ t: Date.now(), score: health, critical: crit }]).slice(-12) }), explainScore(issues)); }}>Run SEO Scan</button>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map(function (t) { return <button key={t} type="button" onClick={function () { setTab(t); }} className={'h-9 shrink-0 rounded-full px-3 text-[10px] uppercase ' + (tab === t ? 'bg-cyan-400 text-[#070D18]' : 'border border-white/10 text-[#AFC0D5]')}>{t}</button>; })}
      </div>
      {tab === 'overview' && (
        <div className="space-y-2">
          {cats.map(function (c) { return <div key={c.id} className="flex justify-between rounded-xl border border-white/10 px-3 py-2 text-xs"><span>{c.id}</span><span>{c.score} {c.passed ? 'passed' : c.n + ' issues'}</span></div>; })}
          <p className="text-[11px] text-[#AFC0D5]">{explainScore(issues)}</p>
        </div>
      )}
      {tab === 'audit' && issues.map(function (i) { return <div key={i.id} className="mb-2 rounded-xl border border-white/10 p-4"><div className="text-[10px] uppercase text-amber-200">{i.severity}</div><div className="font-semibold">{i.title}</div><p className="text-[11px] text-[#AFC0D5]">{i.url} · {i.why}</p><button type="button" className="mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-[11px] font-semibold text-[#070D18]" onClick={function () { fix(i); }}>Fix</button></div>; })}
      {tab === 'pages' && pages.map(function (p) { return <button key={p.id} type="button" onClick={function () { openP(p); }} className="mb-1 flex w-full justify-between rounded-xl border border-white/10 px-3 py-3 text-left text-xs"><span className="font-mono text-cyan-300">{p.url}</span><span>{p.type}</span></button>; })}
      {tab === 'pages' && sel && (
        <div className="space-y-2">
          <input className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" value={draft.title} onChange={function (e) { setDraft(Object.assign({}, draft, { title: e.target.value })); }} /><p className="text-[10px] text-[#AFC0D5]">{draft.title.length} chars · \~{titlePx(draft.title)}px / 600 · desc \~{descPx(draft.description)}px / 990</p>
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2" value={draft.description} onChange={function (e) { setDraft(Object.assign({}, draft, { description: e.target.value })); }} />
          <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[sel.id] = Object.assign({}, ov[sel.id] || {}, draft); commit(Object.assign({}, s, { overrides: ov }), "Guardado " + sel.url); }}>Guardar</button>
          <div className="rounded-xl bg-white p-4 text-black"><div className="text-[10px] uppercase">Preview · no es Google</div><div className="text-sm text-blue-700">{draft.title}</div><div className="text-xs">{draft.description}</div></div>
        </div>
      )}
      {tab === 'products' && pages.filter(function (p) { return p.type === 'Product'; }).map(function (p) { return <div key={p.id} className="mb-2 flex justify-between rounded-xl border border-white/10 p-3 text-sm"><span>{p.h1}</span><button type="button" className="h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[p.id] = { title: pulseTitle(p), description: pulseDesc(p), alt: pulseAlt(p) }; commit(Object.assign({}, s, { overrides: ov }), 'opt ' + p.h1); }}>Optimize</button></div>; })}
      {tab === 'keywords' && (<div className="space-y-2"><p className="text-xs text-[#AFC0D5]">Mapa local keyword → URL. Volume/position: Connect GSC, no se inventa.</p><input className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm" placeholder="zapatillas running" value={kw} onChange={function (e) { setKw(e.target.value); }} /><input className="h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm" placeholder="/collections/destacados" value={kwUrl} onChange={function (e) { setKwUrl(e.target.value); }} /><button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { if (!kw) return; commit(addKeyword(Object.assign({}, s), kw, kwUrl, 'transactional'), 'map ' + kw); setKw(''); }}>Mapear</button>{(s.keywords || []).map(function (k: any, i: number) { return <div key={i} className="font-mono text-xs">{k.kw} → {k.url} · {k.intent}</div>; })}{cannibal(s).map(function (c: string) { return <p key={c} className="text-xs text-amber-200">Possible cannibal: {c}</p>; })}</div>)}
      {tab === 'structured' && pages.filter(function (p) { return p.type === 'Product' || p.type === 'Homepage'; }).map(function (p) { return <pre key={p.id} className="mb-2 overflow-auto rounded-xl border border-white/10 p-3 text-[11px] text-[#AFC0D5]">{JSON.stringify(jsonLd(p), null, 2)}</pre>; })}
      {tab === 'sitemaps' && <pre className="text-[11px] text-[#AFC0D5]">{sitemapXml(pages)}</pre>}
      {tab === 'redirects' && (
        <div>
          <input className="mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="/old" value={from} onChange={function (e) { setFrom(e.target.value); }} />
          <input className="mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3" placeholder="/new" value={to} onChange={function (e) { setTo(e.target.value); }} />
          <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { const f = from[0] === "/" ? from : "/" + from; const d = to[0] === "/" ? to : "/" + to; if (wouldLoop(s.redirects || [], f, d)) { setLog("loop"); return; } commit(Object.assign({}, s, { redirects: (s.redirects || []).concat([{ id: Date.now(), from: f, to: d, code: 301 }]) }), "301"); }}>Add 301</button>
        </div>
      )}
      {tab === 'images' && pages.filter(function (p) { return p.type === 'Product'; }).map(function (p) { return <div key={p.id} className="mb-2 flex justify-between rounded-xl border border-white/10 p-3 text-sm"><span>{p.h1}</span><button type="button" className="h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]" onClick={function () { const ov = Object.assign({}, s.overrides || {}); ov[p.id] = Object.assign({}, ov[p.id] || {}, { alt: pulseAlt(p) }); commit(Object.assign({}, s, { overrides: ov }), 'alt'); }}>Write alt</button></div>; })}
      {tab === 'settings' && (
        <div>
          <textarea className="min-h-40 w-full rounded-xl border border-white/10 bg-[#0A1020] p-3 font-mono text-xs" value={robots} onChange={function (e) { setRobots(e.target.value); }} />
          <button type="button" className="mt-2 h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={function () { commit(Object.assign({}, s, { robots: robots }), "robots ok"); }}>Guardar robots</button>
        </div>
      )}
      {tab === 'collections' && pages.filter(function (p) { return p.type === 'Collection'; }).map(function (p) { return <div key={p.id} className="rounded-xl border border-white/10 p-4"><div>{p.h1}</div><button type="button" className="mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]" onClick={function () { openP(p); }}>Editar</button></div>; })}
      {tab === 'technical' && <div className="rounded-xl border border-white/10 p-3 text-[11px] text-[#AFC0D5]">UTM<br/><input className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-2" value={utm.u} onChange={function (e) { setUtm(Object.assign({}, utm, { u: e.target.value })); }} /><input className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-2" value={utm.s} onChange={function (e) { setUtm(Object.assign({}, utm, { s: e.target.value })); }} /><button type="button" className="mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]" onClick={function () { const x = utmOf(utm.u, utm.s, utm.m, utm.c); navigator.clipboard.writeText(x); setLog(x); }}>Copy UTM</button><button type="button" className="ml-2 h-10 rounded-lg border border-white/10 px-3 text-[10px]" onClick={function () { navigator.clipboard.writeText(reportMd(pages, issues, health)); setLog('informe copiado'); }}>Copy informe</button></div>}{tab === 'technical' && pages.map(function (p) { return <div key={p.id} className="flex justify-between py-2 font-mono text-xs"><span>{p.url}</span><span>{p.indexable ? 'Indexable' : 'Noindex'}</span></div>; })}
      {tab === 'links' && pages.filter(function (p) { return p.indexable; }).map(function (p) { return <div key={p.id} className="flex justify-between py-2 text-xs"><span className="font-mono">{p.url}</span></div>; })}
      {tab === 'marketing' && (<div className="space-y-3"><p className="text-sm font-semibold text-white">Marketing en el recorte</p><p className="text-xs text-[#AFC0D5]">Misma tienda, otro job. SEO = snippet. Ads = Pulse Card (L3). No mezclar title SERP con copy de campana.</p><div className="rounded-xl border border-white/10 p-4"><p className="text-[10px] uppercase text-cyan-300">Social / OG</p><p className="mt-2 text-sm">{(pages[0] && pages[0].title) || 'Home'}</p><p className="text-xs text-[#AFC0D5]">{(pages[0] && pages[0].description) || 'Sin description'}</p></div><button type="button" className="h-11 w-full rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]" onClick={function () { setTab('pages'); if (pages[0]) openP(pages[0]); }}>Editar OG de la home</button><button type="button" className="h-11 w-full rounded-lg border border-white/10 text-xs" onClick={function () { setLog('Campana = Pulse Card. No se dispara desde SEO.'); }}>Crear campana (L3, no desde aca)</button></div>)}{tab === 'reports' && ((s.log || []).length ? (s.log || []).slice().reverse().map(function (r: any) { return <div key={r.t} className="flex justify-between text-xs"><span>{new Date(r.t).toLocaleString()}</span><span>{r.score}</span></div>; }) : <p className="text-sm text-[#AFC0D5]">Sin scans.</p>)}
    </div>
  );
}
