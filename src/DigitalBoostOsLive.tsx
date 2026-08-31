
import { useEffect, useState } from "react";
const KEY = "db-os-live-v1";
export default function DigitalBoostOsLive() {
  const [live, setLive] = useState(true);
  useEffect(function () {
    try { setLive(localStorage.getItem(KEY) !== "0"); } catch {}
  }, []);
  function toggle() {
    const next = !live;
    setLive(next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
  }
  return (
    <button type="button" onClick={toggle} className="hidden h-9 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] sm:inline-flex">
      <span className={live ? "h-1.5 w-1.5 rounded-full bg-emerald-400" : "h-1.5 w-1.5 rounded-full bg-amber-300"} />
      <span className={live ? "text-emerald-300" : "text-amber-300"}>{live ? "Live" : "Attention"}</span>
    </button>
  );
}
