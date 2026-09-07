
import { useEffect, useState } from "react";
const RANGES = ["7d", "30d", "90d"];
const KEY = "db-os-range-v1";
export default function DigitalBoostOsRange() {
  const [r, setR] = useState("7d");
  useEffect(function () {
    try { setR(localStorage.getItem(KEY) || "7d"); } catch {}
  }, []);
  function pick(next: string) {
    setR(next);
    try { localStorage.setItem(KEY, next); } catch {}
    try { window.dispatchEvent(new Event("db-os-range")); } catch {}
  }
  return (
    <div className="flex items-center gap-1">
      {RANGES.map(function (id) {
        return (
          <button key={id} type="button" onClick={function () { pick(id); }} className={r === id ? "h-9 rounded-full bg-cyan-400 px-3 text-[11px] font-semibold text-[#070D18]" : "h-9 rounded-full border border-white/10 px-3 text-[11px] text-slate-400"}>
            {id}
          </button>
        );
      })}
    </div>
  );
}
