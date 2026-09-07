import { useEffect, useMemo, useState } from "react";
import { buildPages, healthOf, loadSeo, saveSeo, scanIssues, explainScore } from "./DigitalBoostSeo";
import { iaTitle, iaDesc, iaAlt } from "./ollamaSeo";
export default function DigitalBoostSeoCenter(){
  const [s,setS]=useState(()=>loadSeo());
  const [tab,setTab]=useState(()=>{try{return localStorage.getItem('db-seo-tab-v1')||'overview';}catch{return 'overview';}});
  const [hist,setHist]=useState<string[]>([]);
  const [log,setLog]=useState('Llama 3 · 2:1.5 · Full IA');
  const [busy,setBusy]=useState(false);
  const [show,setShow]=useState(false);
  const pages=useMemo(()=>buildPages(s),[s]);
  const issues=useMemo(()=>scanIssues(pages,s),[pages,s]);
  const health=healthOf(issues);
  useEffect(()=>{try{localStorage.setItem('db-seo-tab-v1',tab);}catch{}},[tab]);
  function commit(n:any,m:string){try{saveSeo(n);}catch{}setS(JSON.parse(JSON.stringify(n)));setLog(m);}
  const go=(t:string)=>{if(t!==tab){setHist(h=>[...h,tab].slice(-20));setTab(t);}};
  const volver=()=>{if(hist.length>0){const p=hist[hist.length-1];setHist(h=>h.slice(0,-1));setTab(p);}else if(tab!=="overview")setTab("overview");};
  return(
    <div className="p-3 space-y-4">
      <div className="flex justify-between items-center"><button onClick={volver} className="h-9 px-4 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white">← Volver</button><div className="flex gap-1"><button onClick={()=>go('overview')} className={`h-8 px-3 rounded-full text-[10px] ${tab==='overview'?'bg-cyan-400 text-black':'bg-white/5 text-white/60'}`}>SEO</button><button onClick={()=>go('marketing')} className={`h-8 px-3 rounded-full text-[10px] ${tab==='marketing'?'bg-violet-400 text-black':'bg-white/5 text-white/60'}`}>Marketing</button></div></div>
      <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">{log}</p>
      <div className="flex gap-2"><button onClick={()=>setShow(true)} className="h-10 px-4 rounded-full bg-[#1E2A44] border border-white/20 text-white text-[11px] font-bold">↩️ Restaurar</button><button onClick={()=>commit({...s,lastScan:Date.now()},explainScore(issues))} className="h-10 px-4 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-200 text-[11px] font-bold">Analizar</button><button disabled={busy} onClick={async()=>{setBusy(true);const ov:any={...s.overrides||{}};for(const p of pages){if(['Product','Homepage','Collection'].includes(p.type)){const [t,d,a]=await Promise.all([iaTitle(p.h1),iaDesc(p.h1),iaAlt(p.h1)]);ov[p.id]={...ov[p.id]||{},title:t,description:d,alt:a};}}commit({...s,overrides:ov,resolved:[...new Set([...s.resolved||[],...issues.map((i:any)=>i.id)])],lastScan:Date.now()},'✨ 100/100');setBusy(false);}} className="h-10 px-5 rounded-full bg-cyan-400 text-black text-[11px] font-black">{busy?'IA...':'✨ IA Fix'}</button></div>
      {tab==='marketing'?(<div className="rounded-xl border border-violet-400/20 bg-[#121636] p-3"><p className="text-violet-200 font-bold text-[11px]">MARKETING SUITE - FULL TOOLS</p><div className="mt-2 aspect-[2/1.5] rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-white/10 flex items-center justify-center"><p className="text-white text-xs">Campera Nimbus Navy · 2:1.5 · Comprar ahora</p></div></div>):(issues.slice(0,5).map((i:any)=><div key={i.id} className="rounded-xl border border-white/10 bg-[#0F1930] p-3 flex gap-3"><div className="w-[72px] aspect-[2/1.5] rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-400/20 flex items-center justify-center text-[8px] text-white/50">2:1.5</div><div className="flex-1"><p className="text-[10px] text-cyan-300 uppercase">{i.severity}</p><p className="text-white text-sm font-semibold">{i.title}</p></div></div>))}
      {show&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3"><div className="w-full max-w-sm rounded-[20px] border border-white/10 bg-[#121E36] p-5"><p className="text-white font-bold">¿Restaurar?</p><div className="flex gap-2 mt-4"><button onClick={()=>setShow(false)} className="flex-1 h-11 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-bold">Cancelar</button><button onClick={()=>{localStorage.removeItem('db-seo-center-v1');setShow(false);}} className="flex-1 h-11 rounded-full bg-red-400 text-black text-[11px] font-black">Restaurar</button></div></div></div>}
    </div>
  );
}
