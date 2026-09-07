import React, { useEffect, useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
type Props = { onComplete?: () => void; duration?: number };
export default function CommerceOSBoot({ onComplete, duration = 1600 }: Props) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const value = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => { onComplete?.(); }, 120);
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [duration, onComplete]);
  const systems = ["Commerce Engine","Store Intelligence","Analytics","AI Operator"];
  return (
    <div className="min-h-screen overflow-hidden bg-[#02040a] text-white">
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[28px] border border-white/[.08] bg-[#070b14]/90 p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[.06]"><ShoppingBag size={34} className="text-cyan-300" /></div>
              <p className="text-[10px] font-bold uppercase tracking-[.32em] text-cyan-300/80">DigitalBoost</p>
              <h1 className="mt-2 text-2xl font-semibold">Commerce OS</h1>
              <p className="mt-2 text-sm text-slate-500">Inicializando tu entorno comercial</p>
              <div className="mt-8 w-full space-y-3 text-left">
                {systems.map((system, index) => {
                  const visible = progress >= index * 25;
                  return (
                    <div key={system} className="flex items-center justify-between rounded-xl border border-white/[.06] bg-white/[.02] px-4 py-3">
                      <span className="text-xs text-slate-400">{system}</span>
                      <span className={visible? "flex items-center gap-2 text-[10px] font-bold tracking-wider text-emerald-300" : "text-[10px] font-bold tracking-wider text-slate-700"}>{visible && <Check size={12} />}{visible? "READY" : "WAIT"}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-7 w-full">
                <div className="mb-2 flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-slate-600">Commerce Environment</span><span className="text-[10px] text-cyan-300">{progress}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400" style={{ width: progress + "%" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
