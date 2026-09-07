#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
p = src / "DigitalBoostSeo.ts"
if not p.is_file():
    raise SystemExit("cd digitalboost-studio y db_seo_full.py")
t = p.read_text(encoding="utf-8")
extra = [
"",
"export function titlePx(s: string) { return Math.round(String(s || '').length * 10.2); }",
"export function descPx(s: string) { return Math.round(String(s || '').length * 6.5); }",
"export function slugOk(slug: string) {",
"  const s = String(slug || '').replace(/^\\//, '');",
"  if (!s) return 'slug vacio';",
"  if (/[A-Z]/.test(s)) return 'mayusculas';",
"  if (/\\s/.test(s)) return 'espacios';",
"  if (/[áéíóúñ]/.test(s)) return 'acentos';",
"  if (s.length > 60) return 'largo';",
"  return '';",
"}",
"export function utmOf(url: string, source: string, medium: string, campaign: string) {",
"  const base = url.indexOf('http') === 0 ? url : 'https://nimbus.digitalboost.shop' + (url[0] === '/' ? url : '/' + url);",
"  const q = 'utm_source=' + encodeURIComponent(source || 'pulse') + '&utm_medium=' + encodeURIComponent(medium || 'seo') + '&utm_campaign=' + encodeURIComponent(campaign || 'nimbus');",
"  return base + (base.indexOf('?') === -1 ? '?' : '&') + q;",
"}",
"export function reportMd(pages: any[], issues: any[], health: number) {",
"  const lines = ['# SEO report Nimbus', '', 'Health ' + health + '/100', 'Pages ' + pages.length, 'Issues ' + issues.length, ''];",
"  issues.forEach(function (i) { lines.push('- [' + i.severity + '] ' + i.url + ' — ' + i.title); });",
"  return lines.join('\\n');",
"}",
"export function addKeyword(s: any, kw: string, url: string, intent: string) {",
"  const map = (s.keywords || []).slice();",
"  map.push({ kw: kw, url: url, intent: intent || 'informational' });",
"  s.keywords = map;",
"  return s;",
"}",
"export function cannibal(s: any) {",
"  const m: any = {};",
"  (s.keywords || []).forEach(function (k: any) { m[k.kw] = (m[k.kw] || []).concat([k.url]); });",
"  const out: string[] = [];",
"  Object.keys(m).forEach(function (k) { const u = Array.from(new Set(m[k])); if (u.length > 1) out.push(k + ' → ' + u.join(', ')); });",
"  return out;",
"}",
]
if "export function titlePx" not in t:
    t = t.rstrip() + "\n" + "\n".join(extra) + "\n"
    print("ok helpers")
else:
    print("ya helpers")

# extra issues: h1 mismatch + slug + pixel + cannibal — inject before return out
if "h1mismatch" not in t:
    mark = "return out;"
    inj = (
        "pages.forEach(function(p){"
        " if(p.type!=='Utility'&&p.indexable){"
        "  if(p.h1&&p.title&&p.title.toLowerCase().indexOf(String(p.h1).split(' ')[0].toLowerCase())===-1)add({id:'h1:'+p.id,title:'H1 vs title',description:'El title no retoma el H1',severity:'medium',url:p.url,why:'Title y H1 desalineados diluyen el recorte.',fix:'Reescribir title con el H1.',fixKind:'title',pageId:p.id,cat:'onpage'});"
        "  const sl=slugOk(p.url); if(sl)add({id:'slug:'+p.id,title:'Slug: '+sl,description:p.url,severity:'low',url:p.url,why:'Slug sucio no es penalty; complica canonicos.',fix:'none',fixKind:'none',pageId:p.id,cat:'technical'});"
        "  if(titlePx(p.title)>600)add({id:'px:'+p.id,title:'Title recortable en SERP',description:titlePx(p.title)+'px est.',severity:'low',url:p.url,why:'Guia \~600px, no regla de Google.',fix:'Acortar title.',fixKind:'title',pageId:p.id,cat:'onpage'});"
        " }"
        "});"
        "cannibal(s).forEach(function(c,i){add({id:'can:'+i,title:'Keyword cannibalization',description:c,severity:'high',url:'/',why:'Dos URLs para el mismo keyword local. No es dato de GSC.',fix:'Dejar una URL.',fixKind:'none',pageId:'home',cat:'onpage'});});"
        "return out;"
    )
    if t.count("return out;") >= 1:
        t = t.replace("return out;", inj, 1)
        print("ok extra issues")
p.write_text(t, encoding="utf-8")

ui = src / "DigitalBoostSeoCenter.tsx"
if not ui.is_file():
    print("no ui")
    print("LISTO PRO")
    raise SystemExit(0)
u = ui.read_text(encoding="utf-8")
if "titlePx" not in u:
    u = u.replace(
        "wouldLoop } from \"./DigitalBoostSeo\";",
        "wouldLoop, titlePx, descPx, utmOf, reportMd, addKeyword, cannibal } from \"./DigitalBoostSeo\";",
        1,
    )
    print("ok import")
if "const [kw, setKw]" not in u:
    u = u.replace(
        "const [robots, setRobots] = useState('');",
        "const [robots, setRobots] = useState('');\n  const [kw, setKw] = useState('');\n  const [kwUrl, setKwUrl] = useState('/');\n  const [utm, setUtm] = useState({ u: '/', s: 'pulse', m: 'seo', c: 'nimbus' });",
        1,
    )
    print("ok state")

# replace keywords tab
oldk = "{tab === 'keywords' && <p className=\"text-sm text-[#AFC0D5]\">Connect Google Search Console. Sin OAuth no hay volume.</p>}"
newk = (
    "{tab === 'keywords' && ("
    "<div className=\"space-y-2\">"
    "<p className=\"text-xs text-[#AFC0D5]\">Mapa local keyword → URL. Volume/position: Connect GSC, no se inventa.</p>"
    "<input className=\"h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm\" placeholder=\"zapatillas running\" value={kw} onChange={function (e) { setKw(e.target.value); }} />"
    "<input className=\"h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm\" placeholder=\"/collections/destacados\" value={kwUrl} onChange={function (e) { setKwUrl(e.target.value); }} />"
    "<button type=\"button\" className=\"h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]\" onClick={function () { if (!kw) return; commit(addKeyword(Object.assign({}, s), kw, kwUrl, 'transactional'), 'map ' + kw); setKw(''); }}>Mapear</button>"
    "{(s.keywords || []).map(function (k: any, i: number) { return <div key={i} className=\"font-mono text-xs\">{k.kw} → {k.url} · {k.intent}</div>; })}"
    "{cannibal(s).map(function (c: string) { return <p key={c} className=\"text-xs text-amber-200\">Possible cannibal: {c}</p>; })}"
    "</div>"
    ")}"
)
if oldk in u:
    u = u.replace(oldk, newk, 1)
    print("ok keywords")
elif "Connect Google Search Console" in u:
    # leave and append after keywords line isn't unique
    print("keywords otro formato")

if "utmOf(" not in u.split("tab === 'marketing'")[-1] if "tab === 'marketing'" in u else u:
    pass
if "tab === 'utm'" not in u:
    extra_ui = (
        "{tab === 'technical' && <div className=\"rounded-xl border border-white/10 p-3 text-[11px] text-[#AFC0D5]\">UTM<br/><input className=\"mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-2\" value={utm.u} onChange={function (e) { setUtm(Object.assign({}, utm, { u: e.target.value })); }} />"
        "<input className=\"mt-2 h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-2\" value={utm.s} onChange={function (e) { setUtm(Object.assign({}, utm, { s: e.target.value })); }} />"
        "<button type=\"button\" className=\"mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]\" onClick={function () { const x = utmOf(utm.u, utm.s, utm.m, utm.c); navigator.clipboard.writeText(x); setLog(x); }}>Copy UTM</button>"
        "<button type=\"button\" className=\"ml-2 h-10 rounded-lg border border-white/10 px-3 text-[10px]\" onClick={function () { navigator.clipboard.writeText(reportMd(pages, issues, health)); setLog('informe copiado'); }}>Copy informe</button></div>}"
    )
    if "{tab === 'technical' && pages.map" in u:
        u = u.replace("{tab === 'technical' && pages.map", extra_ui + "{tab === 'technical' && pages.map", 1)
        print("ok utm+report")

# pixel hint on pages editor
if "titlePx(" not in u:
    u = u.replace(
        'value={draft.title} onChange={function (e) { setDraft(Object.assign({}, draft, { title: e.target.value })); }} />',
        'value={draft.title} onChange={function (e) { setDraft(Object.assign({}, draft, { title: e.target.value })); }} /><p className="text-[10px] text-[#AFC0D5]">{draft.title.length} chars · \~{titlePx(draft.title)}px / 600 · desc \~{descPx(draft.description)}px / 990</p>',
        1,
    )
    print("ok px")
ui.write_text(u, encoding="utf-8")
print("LISTO PRO")
