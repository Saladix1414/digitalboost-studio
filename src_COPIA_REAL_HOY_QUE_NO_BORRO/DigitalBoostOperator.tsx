import { useEffect, useRef, useState } from "react";
import { analyze, analyzeSmart, explain, isBuilder, type PulseDecision } from "./DigitalBoostPulseBrain";
import { applyPulseDraft } from "./DigitalBoostPulseApply";
function readCanvas(){let page="Inicio",n=0,hero="";try{page=localStorage.getItem("db-store-page-v1")||"Inicio";const raw=localStorage.getItem("db-store-canvas-v1:"+page)||localStorage.getItem("db-store-canvas-v1")||"[]";const blocks=JSON.parse(raw);if(Array.isArray(blocks)){n=blocks.length;const h=blocks.find(function(b:any){return b&&b.type==="hero";});if(h)hero=String(h.title||"");}}catch{}return{page:page,n:n,hero:hero};}
function ctx(){let range="7d",store="Aura",live=true;try{range=localStorage.getItem("db-os-range-v1")||"7d";store=localStorage.getItem("db-active-store-v1")||"Aura";live=localStorage.getItem("db-os-live-v1")!=="0";}catch{}return{range:range,store:store,live:live};}
const SAY:Record<string,string>={briefing:"Como esta el dia?",hola:"Hola",golpe:"Cual es el siguiente paso?",hero:"Mejorar hero",publicar:"Publicar",seo:"Genera seo para Nimbus",productos:"Crea 3 productos para Nimbus",auditar:"Audita mi tienda",coleccion:"Crea coleccion nueva"};
type Msg={role:"user"|"pulse";text:string};
export default function DigitalBoostOperator(props:{onClose:()=>void;onNavigate:(id:any)=>void;section?:string;}){
const section=props.section||"dashboard";const c0=ctx();const[q,setQ]=useState("");const[out,setOut]=useState<PulseDecision|null>(null);const[loading,setLoading]=useState(false);const THREAD="db-pulse-thread-"+section;const[msgs,setMsgs]=useState<Msg[]>(function(){try{return JSON.parse(sessionStorage.getItem(THREAD)||"[]");}catch{return[];}});const scroller=useRef<HTMLDivElement|null>(null);
useEffect(function(){document.body.classList.add('db-pulse-open');return function(){document.body.classList.remove('db-pulse-open');};},[]);
async function think(word:string){
const raw=(word||q||"hola").trim();if(!raw)return;let line=SAY[raw.toLowerCase()]||raw;const c=ctx();const cv=readCanvas();const payload={q:raw,section:section,store:c.store,range:c.range,live:c.live,page:cv.page,blockCount:cv.n,heroTitle:cv.hero};
setMsgs(function(m){return m.concat([{role:"user",text:line}]).slice(-20);});setQ("");setLoading(true);let r:PulseDecision|null=null;
 // Nunca mostrar jerga vieja
 if(line.toLowerCase().includes("bloques") || line.toLowerCase().includes("canvas")) { line="Hola"; }
try{
 if(raw.toLowerCase().indexOf("audita")!==-1 || raw.toLowerCase().indexOf("auditoria")!==-1){
  try{
   const { auditStoreIA } = await import("./ollama/tasks");
   const audit = await auditStoreIA(c.store, cv.page, cv.hero, cv.n);
   if(audit){
     const body = audit;
     setMsgs(function(m){ const cp=m.slice(); cp[cp.length-1]={role:"pulse",text:body}; return cp; });
     setLoading(false); return;
   }
  }catch{}
 }
 if(raw.toLowerCase().indexOf("producto")!==-1 || raw.toLowerCase().indexOf("productos")!==-1){
  try{
   const { generateProductsIA } = await import("./ollama/tasks");
   let fullProd="";
   setMsgs(function(m){ return m.concat([{role:"pulse",text:"Generando productos..."}]).slice(-20); });
   const prods = await generateProductsIA(c.store, cv.hero);
   if(prods && prods.length){
     // guarda en canvas
     try{
       const key = "db-store-canvas-v1:" + cv.page;
       const rawC = localStorage.getItem(key) || "[]";
       const blocks = JSON.parse(rawC);
       prods.forEach(function(p:any){
         blocks.push({id:"prod_"+Date.now()+"_"+Math.random().toString(36).slice(2), type:"products", title:p.name, body:p.desc, cta:"$"+p.price, tag:p.tag||"new"});
       });
       localStorage.setItem(key, JSON.stringify(blocks)); localStorage.setItem("db-store-canvas-v1", JSON.stringify(blocks));
       localStorage.setItem("db-store-canvas-v1", JSON.stringify(blocks));
       window.dispatchEvent(new CustomEvent("db-pulse-apply", {detail:{kind:"products", items:prods}}));
     }catch{}
     const body = "Listo, cree "+prods.length+" productos:\n- "+prods.map(function(p:any){return p.name+" ($"+p.price+"): "+p.desc}).join("\n- ") + "\n\nYa los meti al canvas, cerra PULSE IA y miralo.";
     setMsgs(function(m){ const cp=m.slice(); cp[cp.length-1]={role:"pulse",text:body}; return cp; });
     setLoading(false); return;
   }
  }catch{}
 }
 if(raw.toLowerCase().indexOf("seo")!==-1){
 try{const {generateSeoIA}=await import("./ollama/tasks"); const seo=await generateSeoIA(cv.hero||"Nimbus", c.store); if(seo){ const body=`SEO listo:\nTitle: ${seo.seoTitle}\nDesc: ${seo.seoDesc}\nKW: ${seo.keywords}\n\nCopy: ${seo.productCopy}`; setMsgs(function(m){ const cp=m.slice(); cp[cp.length-1]={role:"pulse",text:body}; return cp; }); setLoading(false); return; } }catch{}
 }
 
 
 const rawLower=raw.toLowerCase();
 if(rawLower.includes("borra")||rawLower.includes("elimina")||rawLower.includes("borrar")){
   try{
     const { deleteProducts } = await import("./ollama/tasks");
     let filter = raw.replace(/borra|elimina|borrar|productos|producto|el|la|por favor/gi,"").trim();
     if(filter.length<2) filter=undefined;
     const res=deleteProducts(cv.page||"Nimbus", filter);
     const txt = filter? `Borre ${res.removed} que coinciden con "${filter}".` : `Borre ${res.removed} productos.`;
     setMsgs(m=>{ const cp=m.slice(); cp[cp.length-1]={role:"pulse",text:txt+" Actualizando..."}; return cp; });
     setTimeout(()=>location.reload(), 600);
     setLoading(false); return;
   }catch(e){ console.log(e); }
 }
 
  const low=raw.toLowerCase();
  if(low.includes("borra")||low.includes("elimina")){
    const { deleteProducts } = await import("./ollama/tasks");
    let name = raw.replace(/borra|elimina|producto|productos|el|la|por favor/gi,"").trim();
    const res=deleteProducts(cv.page||"Nimbus", name.length>1?name:undefined);
    setMsgs(m=>{ const cp=m.slice(); cp[cp.length-1]={role:"pulse",text: name? `Borré "${name}"` : `Borré ${res.removed} productos`}; return cp; });
    setTimeout(()=>location.reload(),500);
    setLoading(false); return;
  }
  const mod=await import("./ollama/client");const status=await mod.checkOllama();if(status.ok){const aiText=await mod.ollamaChatStream([{role:"system",content:"Sos PULSE, asistente DigitalBoost. Habla como socio, corto, argentino, humano. No digas bloques, canvas, CTA. 2 lineas max."},{role:"user",content:"Tienda "+c.store+" hero "+(cv.hero||"sin definir")+". Usuario: "+raw}]);if(aiText){r={title:"PULSE IA",body:aiText,action:section,actionLabel:"Seguir",confirm:false} as any;(r as any)._engine="ollama";}}}catch{}
if(!r){try{const smart=await analyzeSmart(payload as any);r=(smart as any).decision as any;if(r&&r.body&&r.body.indexOf("bloques")!==-1){r={...r,body:"Vi tu tienda "+c.store+". Hero: "+(cv.hero||"mejorable")+". ¿Lo mejoramos?"} as any;}}catch{r=analyze(payload);}}
setOut(r);setLoading(false);if(r)setMsgs(function(m){return m.concat([{role:"pulse",text:r!.body}]).slice(-20);});
}
useEffect(function(){ if(msgs.length===0 &&!sessionStorage.getItem("pulse_welcomed")){ sessionStorage.setItem("pulse_welcomed","1"); think("hola"); } },[]);
useEffect(function(){const el=scroller.current;if(el)el.scrollTop=el.scrollHeight;try{sessionStorage.setItem(THREAD,JSON.stringify(msgs));}catch{}},[msgs,loading]);
const TRAY=[["auditar","Audita mi tienda"],["productos","Crea 3 productos"],["hero","Mejorar hero"],["seo","SEO IA"]];
return(<div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}><div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#0C1427] text-[#F7FAFF]" onClick={function(e){e.stopPropagation();}}><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">PULSE IA</div><div className="text-sm font-semibold">Tienda {c0.store}</div></div><button type="button" onClick={props.onClose} className="h-9 w-9 rounded-md border border-white/10">x</button></div><div ref={scroller} className="min-h-[280px] flex-1 space-y-3 overflow-y-auto px-3 py-3">{msgs.map(function(m,i){const mine=m.role==="user";return<div key={i} className={mine? "flex justify-end":"flex justify-start"}><div className={mine? "max-w-[80%] rounded-2xl rounded-br-sm bg-[#1E3A5F] px-3.5 py-2.5 text-[13px]":"max-w-[88%] rounded-2xl rounded-bl-sm bg-[#132033] px-3.5 py-2.5 text-[13px] text-[#D5E4F5]"}>{m.text}</div></div>;})}{loading&&<div className="text-[12px] text-slate-400">PULSE pensando...</div>}</div><div className="border-t border-white/10 p-3"><div className="mb-2 flex gap-1">{TRAY.map(function(p){return<button key={p[0]} type="button" onClick={function(){think(p[0]);}} className="h-8 rounded-full border border-cyan-400/30 px-3 text-[11px] text-cyan-200">{p[1]}</button>;})}</div><form className="flex gap-2" onSubmit={function(e){e.preventDefault();think(q);}}><input className="h-11 flex-1 rounded-xl border border-white/10 bg-[#0A1020] px-3 text-sm outline-none" placeholder="Escribí como al socio..." value={q} onChange={function(e){setQ(e.target.value);}}/><button type="submit" disabled={loading} className="h-11 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-[#070D18]">{loading? "..." : "Enviar"}</button></form></div></div></div>);
}
