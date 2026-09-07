#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

E = [
"const KEY='db-seo-center-v1';",
"const BASE='https://nimbus.digitalboost.shop';",
"export const DEFAULT_ROBOTS='User-agent: *\\nAllow: /\\nDisallow: /cart\\nDisallow: /checkout\\nDisallow: /account\\nSitemap: https://nimbus.digitalboost.shop/sitemap.xml\\n';",
"const SEED=[{id:1,name:'Campera Aura Navy',sku:'DB-JK-01',price:190},{id:2,name:'Tote Cyan Pulse',sku:'DB-TG-04',price:60},{id:3,name:'Hoodie Violet Grid',sku:'DB-HD-12',price:129},{id:4,name:'Cap Digital Blue',sku:'DB-CP-08',price:95}];",
"export function loadSeo(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p)return p;}catch{}return {overrides:{},robots:DEFAULT_ROBOTS,redirects:[],ignored:[],resolved:[],lastScan:0,log:[],titleTpl:'{name} | Nimbus',descTpl:'{name} en Nimbus. Envio 48h.',canonicalBase:BASE,breadcrumbs:true};}",
"export function saveSeo(s:any){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}",
"function hero(){try{const b=JSON.parse(localStorage.getItem('db-store-canvas-v1')||'[]');const h=(b||[]).find((x:any)=>x&&x.type==='hero')||(b||[])[0]||{};return {title:h.title||'Nimbus',body:h.body||''};}catch{return {title:'Nimbus',body:''};}}",
"export function buildPages(s:any){",
"  const h=hero();",
"  const home={id:'home',url:'/',type:'Homepage',title:h.title,description:h.body,canonical:BASE+'/',indexable:true,h1:h.title,sku:'',price:0};",
"  const prods=SEED.map(function(p){const slug=p.sku.toLowerCase();return {id:'p-'+p.id,url:'/products/'+slug,type:'Product',title:String(s.titleTpl||'{name} | Nimbus').replace('{name}',p.name),description:String(s.descTpl||'{name}').replace('{name}',p.name),canonical:(s.canonicalBase||BASE)+'/products/'+slug,indexable:true,h1:p.name,sku:p.sku,price:p.price};});",
"  const col={id:'col',url:'/collections/destacados',type:'Collection',title:'Destacados | Nimbus',description:'',canonical:BASE+'/collections/destacados',indexable:true,h1:'Destacados',sku:'',price:0};",
"  const util=['cart','checkout','account'].map(function(u){return {id:u,url:'/'+u,type:'Utility',title:u,description:'',canonical:BASE+'/'+u,indexable:false,h1:u,sku:'',price:0};});",
"  return [home].concat(prods,[col],util).map(function(p){return Object.assign({},p,(s.overrides||{})[p.id]||{});});",
"}",
"export function scanIssues(pages:any[],s:any){",
"  const out:any[]=[];",
"  const skip=function(id:string){return (s.ignored||[]).indexOf(id)!==-1||(s.resolved||[]).indexOf(id)!==-1;};",
"  const add=function(i:any){if(!skip(i.id))out.push(i);};",
"  const titles:any={};",
"  pages.forEach(function(p){",
"    titles[p.title]=(titles[p.title]||[]).concat([p.url]);",
"    if(p.type!=='Utility'&&p.indexable&&String(p.title||'').length<12)add({id:'title:'+p.id,title:'Title corto',description:p.title||'—',severity:'critical',url:p.url,why:'El title es la senal on-page mas fuerte.',fix:'Aplicar plantilla.',fixKind:'title',pageId:p.id,cat:'onpage'});",
"    if(p.type!=='Utility'&&p.indexable&&String(p.description||'').length<50)add({id:'desc:'+p.id,title:'Meta description delgada',description:String((p.description||'').length)+' chars',severity:'high',url:p.url,why:'Sin description el snippet queda a criterio del motor.',fix:'Generar description.',fixKind:'desc',pageId:p.id,cat:'onpage'});",
"    if(p.type==='Collection'&&String(p.description||'').length<50)add({id:'thin:'+p.id,title:'Coleccion delgada',description:'Sin description de coleccion',severity:'medium',url:p.url,why:'La coleccion compite como landing.',fix:'Redactar description.',fixKind:'desc',pageId:p.id,cat:'content'});",
"    if(p.type==='Utility'&&p.indexable)add({id:'noindex:'+p.id,title:'Utilidad indexable',description:p.url,severity:'critical',url:p.url,why:'Cart/checkout/account no van al indice.',fix:'Marcar noindex.',fixKind:'noindex',pageId:p.id,cat:'index'});",
"    if(p.type==='Product'&&!(s.overrides&&s.overrides[p.id]&&s.overrides[p.id].alt))add({id:'alt:'+p.id,title:'Imagen sin alt',description:p.h1,severity:'medium',url:p.url,why:'Alt indexa imagen y accesibilidad.',fix:'Escribir alt.',fixKind:'alt',pageId:p.id,cat:'images'});",
"    if(p.type==='Product')add({id:'schema:'+p.id,title:'JSON-LD Product no emitido',description:p.sku,severity:'low',url:p.url,why:'Hay SKU y precio reales; falta markup publicado.',fix:'Ver JSON-LD.',fixKind:'schema',pageId:p.id,cat:'schema'});",
"  });",
"  Object.keys(titles).forEach(function(t){if(t&&titles[t].length>1)titles[t].forEach(function(u:string){const p=pages.find(function(x){return x.url===u;});if(!p||p.type==='Utility')return;add({id:'dup:'+p.id,title:'Possible duplicate title',description:t,severity:'high',url:u,why:'No afirmamos penalty. Canibaliza el recorte.',fix:'Diferenciar title.',fixKind:'title',pageId:p.id,cat:'onpage'});});});",
"  if(/Disallow:\\s*\\/\\s*$/m.test(String(s.robots||'')))add({id:'robots',title:'robots bloquea todo',description:'Disallow: /',severity:'critical',url:'/robots.txt',why:'Saca el sitio del indice.',fix:'Reset robots.',fixKind:'none',pageId:'robots',cat:'technical'});",
"  (s.redirects||[]).forEach(function(r:any){if(r.from===r.to)add({id:'loop:'+r.id,title:'Redirect loop',description:r.from,severity:'critical',url:r.from,why:'Rompe el crawl.',fix:'Quitar.',fixKind:'none',pageId:r.id,cat:'technical'});});",
"  return out;",
"}",
"export function healthOf(issues:any[]){let n=100;issues.forEach(function(i){n-=i.severity==='critical'?12:i.severity==='high'?7:i.severity==='medium'?4:2;});return Math.max(0,Math.min(100,n));}",
"export function pulseTitle(p:any){return p.type==='Product'?p.h1+' — envio 48h | Nimbus':(p.h1||'Nimbus')+' | Nimbus Store';}",
"export function pulseDesc(p:any){return p.type==='Product'?p.h1+' en Nimbus. Stock real, envio 48h, checkout seguro.':p.type==='Collection'?'Coleccion '+p.h1+': piezas Nimbus, envio 48h, historia de marca.':'Nimbus Store. Coleccion viva, envio 48h, checkout seguro.';}",
"export function pulseAlt(p:any){return (p.h1||'Producto')+' Nimbus';}",
"export function jsonLd(p:any){if(p.type==='Product')return {'@context':'https://schema.org','@type':'Product',name:p.h1,sku:p.sku,offers:{'@type':'Offer',priceCurrency:'USD',price:p.price}};return {'@context':'https://schema.org','@type':'WebSite',name:'Nimbus',url:BASE};}",
"export function sitemapXml(pages:any[]){const body=pages.filter(function(p){return p.indexable;}).map(function(p){return '  <url><loc>'+BASE+(p.url==='/'?'':p.url)+'</loc></url>';}).join('\\n');return '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\\n'+body+'\\n</urlset>\\n';}",
"export function wouldLoop(list:any[],from:string,to:string){if(from===to)return true;const map:any={};list.forEach(function(r){map[r.from]=r.to;});map[from]=to;const seen:any={};let cur=from;for(let i=0;i<10;i++){if(!map[cur])return false;if(seen[cur])return true;seen[cur]=1;cur=map[cur];}return true;}",
"export const TABS=['overview','audit','pages','products','collections','keywords','technical','structured','sitemaps','redirects','links','images','settings','reports'];",
]
(src/"DigitalBoostSeo.ts").write_text("\n".join(E)+"\n",encoding="utf-8")
print("ok engine",len(E))

U = [
'import { useEffect, useMemo, useState } from "react";',
'import { DEFAULT_ROBOTS, TABS, buildPages, healthOf, jsonLd, loadSeo, pulseAlt, pulseDesc, pulseTitle, saveSeo, scanIssues, sitemapXml, wouldLoop } from "./DigitalBoostSeo";',
"export default function DigitalBoostSeoCenter(){",
"  const [s,setS]=useState(function(){return loadSeo();});",
"  const [tab,setTab]=useState('overview');",
"  const [phase,setPhase]=useState('idle');",
"  const [log,setLog]=useState('SEO Center listo');",
"  const [sel,setSel]=useState(null as any);",
"  const [draft,setDraft]=useState({title:'',description:'',canonical:'',indexable:true});",
"  const [from,setFrom]=useState(''); const [to,setTo]=useState('');",
"  const [robots,setRobots]=useState(s.robots||DEFAULT_ROBOTS);",
"  const pages=useMemo(function(){return buildPages(s);},[s]);",
"  const issues=useMemo(function(){return scanIssues(pages,s);},[pages,s]);",
"  const health=healthOf(issues);",
"  useEffect(function(){document.body.classList.add('db-seo-open');const el=document.getElementById('db-studio-dock');if(el)el.style.display='none';return function(){document.body.classList.remove('db-seo-open');if(el)el.style.display='';};},[]);",
"  function commit(n:any,msg:string){saveSeo(n);setS(JSON.parse(JSON.stringify(n)));setLog(msg);}",
"  function scan(){setPhase('scanning');setLog('Scanning…');setTimeout(function(){setPhase('analyzing');setLog('Analyzing…');},300);setTimeout(function(){const n=Object.assign({},s,{lastScan:Date.now(),log:(s.log||[]).concat([{t:Date.now(),score:health,critical:issues.filter(function(i){return i.severity==='critical';}).length}]).slice(-12)});commit(n,'Scan '+health+'/100');setPhase('done');},800);}",
"  function fix(iss:any){const p=pages.find(function(x){return x.id===iss.pageId;});if(!p){setLog('sin pagina');return;}const ov=Object.assign({},s.overrides||{});const cur=Object.assign({},ov[p.id]||{});if(iss.fixKind==='title')cur.title=pulseTitle(p);if(iss.fixKind==='desc')cur.description=pulseDesc(p);if(iss.fixKind==='noindex')cur.indexable=false;if(iss.fixKind==='alt')cur.alt=pulseAlt(p);ov[p.id]=cur;commit(Object.assign({},s,{overrides:ov,resolved:(s.resolved||[]).concat([iss.id]),lastScan:Date.now()}),'Fix '+iss.fixKind+' '+p.url);}",
"  function ignore(iss:any){commit(Object.assign({},s,{ignored:(s.ignored||[]).concat([iss.id])}),'Ignore '+iss.id);}",
"  function openP(p:any){setSel(p);setDraft({title:p.title,description:p.description,canonical:p.canonical,indexable:p.indexable});setTab('pages');}",
"  function saveP(){if(!sel)return;const ov=Object.assign({},s.overrides||{});ov[sel.id]=Object.assign({},ov[sel.id]||{},draft);commit(Object.assign({},s,{overrides:ov}),'Guardado '+sel.url);}",
"  function pulseAll(){const ov=Object.assign({},s.overrides||{});pages.forEach(function(p){if(p.type==='Utility')return;ov[p.id]=Object.assign({},ov[p.id]||{},{title:pulseTitle(p),description:pulseDesc(p),alt:pulseAlt(p)});});commit(Object.assign({},s,{overrides:ov}),'PULSE bulk aplicado');}",
"  const crit=issues.filter(function(i){return i.severity==='critical';}).length;",
"  const warn=issues.filter(function(i){return i.severity==='high'||i.severity==='medium';}).length;",
"  return (",
'    <div className="relative z-[80] space-y-4">',
'      <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">{log} · {phase}</p>',
'      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-lg font-semibold text-white">SEO Center</p><p className="text-sm text-[#AFC0D5]">Nimbus · health {health}/100 · {crit} critical · {warn} warn</p></div><button type="button" onClick={scan} className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]">Run SEO Scan</button></div>',
'      <div className="flex gap-1 overflow-x-auto">{TABS.map(function(t){return <button key={t} type="button" onClick={function(){setTab(t);}} className={"h-9 shrink-0 rounded-full px-3 text-[10px] uppercase tracking-[0.12em] "+(tab===t?"bg-cyan-400 text-[#070D18]":"border border-white/10 text-[#AFC0D5]")}>{t}</button>;})}</div>',
"      {tab==='overview'&&(<div className=\"grid gap-3 sm:grid-cols-4\"><div className=\"rounded-2xl border border-violet-400/20 bg-violet-500/20 p-5\"><p className=\"text-[10px] uppercase text-[#AFC0D5]\">Health</p><p className=\"mt-2 text-3xl font-bold\">{health}</p></div><div className=\"rounded-2xl border border-white/10 p-5\"><p className=\"text-[10px] uppercase text-[#AFC0D5]\">Critical</p><p className=\"mt-2 text-3xl text-red-300\">{crit}</p></div><div className=\"rounded-2xl border border-white/10 p-5\"><p className=\"text-[10px] uppercase text-[#AFC0D5]\">Warnings</p><p className=\"mt-2 text-3xl text-amber-300\">{warn}</p></div><div className=\"rounded-2xl border border-white/10 p-5\"><p className=\"text-[10px] uppercase text-[#AFC0D5]\">Indexable</p><p className=\"mt-2 text-3xl\">{pages.filter(function(p){return p.indexable;}).length}</p></div><p className=\"sm:col-span-4 text-[11px] text-[#AFC0D5]\">Promedio por issues del catalogo+canvas. Performance no entra: no hay Lighthouse. GSC no entra: no hay OAuth.</p></div>)}",
"      {tab==='audit'&&issues.map(function(i){return <div key={i.id} className=\"mb-2 rounded-xl border border-white/10 p-4\"><div className=\"text-[10px] uppercase text-amber-200\">{i.severity} · {i.cat}</div><div className=\"font-semibold\">{i.title}</div><p className=\"text-[11px] text-[#AFC0D5]\">{i.url} · {i.why}</p><div className=\"mt-2 flex gap-1\"><button type=\"button\" className=\"h-10 rounded-lg bg-cyan-400 px-3 text-[11px] font-semibold text-[#070D18]\" onClick={function(){fix(i);}}>Fix</button><button type=\"button\" className=\"h-10 rounded-lg border border-white/10 px-3 text-[11px]\" onClick={function(){ignore(i);}}>Ignore</button></div></div>;})}",
"      {tab==='pages'&&(<div>{pages.map(function(p){return <button key={p.id} type=\"button\" onClick={function(){openP(p);}} className=\"mb-1 flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-3 text-left\"><span className=\"font-mono text-xs text-cyan-300\">{p.url}</span><span className=\"text-[11px]\">{p.type} · {p.indexable?'index':'noindex'}</span></button>;})}{sel&&(<div className=\"mt-4 grid gap-3 lg:grid-cols-2\"><div className=\"space-y-2\"><input className=\"h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm\" value={draft.title} onChange={function(e){setDraft(Object.assign({},draft,{title:e.target.value}));}} /><p className=\"text-[10px] text-[#AFC0D5]\">{draft.title.length} chars · guia 50-60</p><textarea className=\"min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm\" value={draft.description} onChange={function(e){setDraft(Object.assign({},draft,{description:e.target.value}));}} /><label className=\"flex h-11 items-center gap-2 text-sm\"><input type=\"checkbox\" checked={draft.indexable} onChange={function(e){setDraft(Object.assign({},draft,{indexable:e.target.checked}));}} />Indexable</label><button type=\"button\" className=\"h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]\" onClick={saveP}>Guardar</button><button type=\"button\" className=\"ml-2 h-11 rounded-lg border border-white/10 px-4 text-xs\" onClick={function(){setDraft(Object.assign({},draft,{title:pulseTitle(sel),description:pulseDesc(sel)}));}}>PULSE</button></div><div className=\"rounded-xl border border-white/10 bg-white p-4 text-black\"><div className=\"text-[10px] uppercase text-neutral-500\">Preview · no es Google</div><div className=\"mt-2 text-sm text-blue-700\">{draft.title}</div><div className=\"font-mono text-[11px] text-emerald-700\">{draft.canonical}</div><div className=\"mt-1 text-xs\">{draft.description}</div></div></div>)}</div>)}",
"      {tab==='products'&&pages.filter(function(p){return p.type==='Product';}).map(function(p){return <div key={p.id} className=\"mb-2 flex items-center justify-between rounded-xl border border-white/10 p-3\"><div><div className=\"text-sm\">{p.h1}</div><div className=\"font-mono text-[10px] text-[#AFC0D5]\">{p.sku} · {p.url}</div></div><div className=\"flex gap-1\"><button type=\"button\" className=\"h-10 rounded-lg border border-white/10 px-3 text-[10px]\" onClick={function(){openP(p);}}>Edit</button><button type=\"button\" className=\"h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]\" onClick={function(){const ov=Object.assign({},s.overrides||{});ov[p.id]=Object.assign({},ov[p.id]||{},{title:pulseTitle(p),description:pulseDesc(p),alt:pulseAlt(p)});commit(Object.assign({},s,{overrides:ov}),'opt '+p.h1);}}>Optimize</button></div></div>;})}",
"      {tab==='collections'&&pages.filter(function(p){return p.type==='Collection';}).map(function(p){return <div key={p.id} className=\"rounded-xl border border-white/10 p-4\"><div className=\"font-semibold\">{p.h1}</div><p className=\"text-xs text-[#AFC0D5]\">{p.description||'sin description'}</p><button type=\"button\" className=\"mt-2 h-10 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]\" onClick={function(){openP(p);}}>Editar</button></div>;})}",
"      {tab==='keywords'&&(<div className=\"rounded-xl border border-white/10 p-6\"><p className=\"font-semibold\">Connect Google Search Console</p><p className=\"mt-2 text-sm text-[#AFC0D5]\">Sin OAuth no hay volume, position ni CTR. No se inventan.</p></div>)}",
"      {tab==='technical'&&pages.map(function(p){return <div key={p.id} className=\"flex justify-between border-b border-white/10 py-2 font-mono text-xs\"><span>{p.url}</span><span>{p.indexable?'Indexable':'Noindex'}</span></div>;})}",
"      {tab==='structured'&&pages.filter(function(p){return p.type==='Product'||p.type==='Homepage';}).map(function(p){return <pre key={p.id} className=\"mb-2 overflow-auto rounded-xl border border-white/10 p-3 text-[11px] text-[#AFC0D5]\">{JSON.stringify(jsonLd(p),null,2)}</pre>;})}",
"      {tab==='sitemaps'&&(<div><button type=\"button\" className=\"h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]\" onClick={function(){navigator.clipboard.writeText(sitemapXml(pages));setLog('sitemap copiado');}}>Copy sitemap.xml</button><pre className=\"mt-3 max-h-64 overflow-auto text-[11px] text-[#AFC0D5]\">{sitemapXml(pages)}</pre></div>)}",
"      {tab==='redirects'&&(<div><input className=\"mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3\" placeholder=\"/old\" value={from} onChange={function(e){setFrom(e.target.value);}} /><input className=\"mb-2 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3\" placeholder=\"/new\" value={to} onChange={function(e){setTo(e.target.value);}} /><button type=\"button\" className=\"h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]\" onClick={function(){const f=from[0]==='/'?from:'/'+from;const t=to[0]==='/'?to:'/'+to;if(wouldLoop(s.redirects||[],f,t)){setLog('loop, no se guarda');return;}commit(Object.assign({},s,{redirects:(s.redirects||[]).concat([{id:Date.now(),from:f,to:t,code:301}])}),'301 '+f+' -> '+t);setFrom('');setTo('');}}>Add 301</button>{(s.redirects||[]).map(function(r:any){return <div key={r.id} className=\"mt-2 flex justify-between font-mono text-xs\">{r.code} {r.from} → {r.to}<button type=\"button\" className=\"text-amber-200\" onClick={function(){commit(Object.assign({},s,{redirects:(s.redirects||[]).filter(function(x:any){return x.id!==r.id;})}),'quitado');}}>x</button></div>;})}</div>)}",
"      {tab==='links'&&pages.filter(function(p){return p.indexable;}).map(function(p){const linked=p.url==='/'||p.type==='Product'||p.url.indexOf('/collections')===0;return <div key={p.id} className=\"flex justify-between py-2 text-xs\"><span className=\"font-mono\">{p.url}</span><span>{linked?'linked':'weak'}</span></div>;})}",
"      {tab==='images'&&pages.filter(function(p){return p.type==='Product';}).map(function(p){const alt=(s.overrides&&s.overrides[p.id]&&s.overrides[p.id].alt)||'Missing alt';return <div key={p.id} className=\"mb-2 flex justify-between rounded-xl border border-white/10 p-3 text-sm\"><span>{p.h1} · {alt}</span><button type=\"button\" className=\"h-10 rounded-lg bg-cyan-400 px-3 text-[10px] font-semibold text-[#070D18]\" onClick={function(){const ov=Object.assign({},s.overrides||{});ov[p.id]=Object.assign({},ov[p.id]||{},{alt:pulseAlt(p)});commit(Object.assign({},s,{overrides:ov}),'alt '+p.h1);}}>Write alt</button></div>;})}",
"      {tab==='settings'&&(<div><textarea className=\"min-h-40 w-full rounded-xl border border-white/10 bg-[#0A1020] p-3 font-mono text-xs\" value={robots} onChange={function(e){setRobots(e.target.value);}} /><button type=\"button\" className=\"mt-2 h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]\" onClick={function(){commit(Object.assign({},s,{robots:robots}),'robots ok');}}>Guardar robots</button><button type=\"button\" className=\"ml-2 h-11 rounded-lg border border-white/10 px-4 text-xs\" onClick={function(){setRobots(DEFAULT_ROBOTS);commit(Object.assign({},s,{robots:DEFAULT_ROBOTS}),'robots reset');}}>Reset</button><p className=\"mt-2 text-[11px] text-amber-200\">{/Disallow:\\s*\\/\\s*$/m.test(robots)?'PELIGRO: Disallow: /':''}</p></div>)}",
"      {tab==='reports'&&((s.log||[]).length? (s.log||[]).slice().reverse().map(function(r:any){return <div key={r.t} className=\"flex justify-between rounded-xl border border-white/10 px-3 py-2 text-xs\"><span>{new Date(r.t).toLocaleString()}</span><span>{r.score}/100 · {r.critical} crit</span></div>;}):<p className=\"text-sm text-[#AFC0D5]\">Sin scans. Run SEO Scan.</p>)}",
'      {tab!=="keywords"&&<button type="button" onClick={pulseAll} className="h-12 w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-xs font-semibold">Analizar con AI (bulk PULSE)</button>}',
"    </div>",
"  );",
"}",
]
(src/"DigitalBoostSeoCenter.tsx").write_text("\n".join(U)+"\n",encoding="utf-8")
print("ok ui",len(U))

ws=src/"StoreBuilderWorkspace.tsx"
if ws.is_file():
    t=ws.read_text(encoding="utf-8")
    if "DigitalBoostSeoCenter" not in t:
        t='import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";\n'+t
    a=t.find('case "seo":')
    if a!=-1:
        b=t.find('case "',a+8)
        if b!=-1:
            t=t[:a]+'case "seo":\n        return (<DigitalBoostSeoCenter />);\n\n      '+t[b:]
            print("ok case")
    ws.write_text(t,encoding="utf-8")
print("LISTO FULL")
