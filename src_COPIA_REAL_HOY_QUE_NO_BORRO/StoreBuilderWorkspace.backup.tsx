import { useState } from "react";
import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";
import DigitalBoostMarketingCenter from "./DigitalBoostMarketingCenter";

export default function StoreBuilderWorkspace({onBack}:{onBack:()=>void}){
  const [tab, setTab] = useState<'seo'|'marketing'>(() => {
    try{ return (localStorage.getItem('db-tab-v1') as any) || 'seo'; }catch{ return 'seo'; }
  });
  const [prevTab, setPrevTab] = useState<'seo'|'marketing'|null>(() => {
    try{ return (localStorage.getItem('db-prev-tab-v1') as any) || null; }catch{ return null; }
  });

  const switchTab = (t:'seo'|'marketing')=>{
    if(t!==tab){
      setPrevTab(tab);
      try{ localStorage.setItem('db-prev-tab-v1', tab); localStorage.setItem('db-tab-v1', t);}catch{}
      setTab(t);
    }
  };

  const handleVolver = ()=>{
    // VOLVER = página anterior, NUNCA landing
    if(prevTab){
      const p = prevTab;
      setTab(p);
      setPrevTab(tab);
      try{ localStorage.setItem('db-tab-v1', p); localStorage.setItem('db-prev-tab-v1', tab);}catch{}
    } else {
      // si no hay historial, va a SEO que es tu página anterior lógica
      if(tab==='marketing'){ switchTab('seo'); }
      // si ya estás en SEO, no hace nada, no te tira a landing
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-white">
      <div className="sticky top-0 z-20 flex items-center justify-between p-3 border-b border-white/10 bg-[#070D18]">
        <button onClick={handleVolver} className="h-9 px-4 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white">← Volver</button>
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          <button onClick={()=>switchTab('seo')} className={`px-4 h-8 rounded-full text-[11px] font-bold ${tab==='seo'?'bg-cyan-400 text-black':'text-white/60'}`}>SEO</button>
          <button onClick={()=>switchTab('marketing')} className={`px-4 h-8 rounded-full text-[11px] font-bold ${tab==='marketing'?'bg-violet-400 text-black':'text-white/60'}`}>Marketing</button>
        </div>
        <button onClick={onBack} className="h-9 px-3 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">Inicio</button>
      </div>
      {tab==='seo'? <DigitalBoostSeoCenter /> : <DigitalBoostMarketingCenter />}
    </div>
  );
}
