import { useState } from "react"; import { askLlama3 } from "./ollamaSeo";
export default function DigitalBoostMarketingCenter(){
  const [product, setProduct] = useState('Campera Nimbus Navy');
  const [copies, setCopies] = useState<string[]>([]);
  const [utm, setUtm] = useState({s:'instagram', m:'cpc', c:'nimbus_q1'});
  return (
    <div className="p-3 space-y-4">
      <div className="rounded-xl border border-violet-400/20 bg-[#121636] p-3"><p className="text-violet-200 font-bold text-[11px] uppercase">Marketing Suite - Full Tools</p><p className="text-white/60 text-[11px] mt-1">SEO + Email + SMS + Forms + Cupones + Ads + OG 2:1.5. Todo con Llama 3 en Termux.</p></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#121E36] border border-white/10 p-3"><p className="text-[9px] text-cyan-300 uppercase">UTM Builder</p><input value={utm.s} onChange={e=>setUtm({...utm, s:e.target.value})} className="mt-2 w-full h-8 rounded bg-black/30 border border-white/10 px-2 text-xs text-white"/><p className="mt-2 text-[8px] text-white/40 break-all">{`nimbus.shop?utm_source=${utm.s}&medium=${utm.m}&camp=${utm.c}`}</p></div>
        <div className="rounded-xl bg-[#121E36] border border-white/10 p-3"><p className="text-[9px] text-emerald-300 uppercase">Cupón Klaviyo Style</p><button className="mt-2 h-8 w-full rounded bg-emerald-400 text-black text-[11px] font-black" onClick={()=>alert('NIMBUS20 aplicado a email flow')}>NIMBUS20 -20%</button></div>
      </div>
      <div className="rounded-xl bg-[#0F1930] border border-white/10 p-3">
        <p className="text-[9px] text-violet-300 uppercase">Pulse Card L3 - ratio 2:1.5</p>
        <div className="mt-2 aspect-[2/1.5] rounded-xl bg-gradient-to-br from-[#00D4FF]/30 to-[#8B5CF6]/30 border border-white/10 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-white font-black text-base">{product}</p><p className="text-white/70 text-[11px] mt-1">Envío 48h · Stock real · Nimbus Store</p><div className="mt-3 h-7 px-4 rounded-full bg-white text-black text-[11px] font-bold flex items-center">Comprar ahora</div>
        </div>
      </div>
      <div className="rounded-xl bg-[#0F1930] border border-white/10 p-3">
        <p className="text-[11px] font-bold text-white">Ads con Llama 3</p>
        <div className="flex gap-2 mt-2"><input value={product} onChange={e=>setProduct(e.target.value)} className="flex-1 h-9 rounded-full bg-black/30 border border-white/10 px-3 text-xs text-white"/><button className="h-9 px-4 rounded-full bg-cyan-400 text-black text-[11px] font-black" onClick={async()=>{ const r=await askLlama3(`Generá 3 copies performance para ${product} envio 48h, separa |||`, `${product} envio 48h|||${product} stock real|||${product} Nimbus`); setCopies(r.split('|||')); }}>✨ IA Copy</button></div>
        {copies.map((c,i)=><div key={i} className="mt-2 p-2 rounded bg-black/20 border border-white/5 text-[11px] text-white/80">{c}</div>)}
      </div>
    </div>
  );
}
