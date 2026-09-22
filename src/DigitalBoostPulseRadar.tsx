
import { useMemo } from "react";
import { detectPulseOpportunities } from "./DigitalBoostPulseProactive";
export default function DigitalBoostPulseRadar() {
  const n = useMemo(function () {
    try { return detectPulseOpportunities().filter(function (s) { return s.significance >= 0.6; }).length; } catch { return 0; }
  }, []);
  function openBrief() {
    try { localStorage.setItem("db-pulse-seed", "briefing"); } catch {}
    try { window.dispatchEvent(new Event("db-open-pulse")); } catch {}
  }
  return (
    <button type="button" onClick={openBrief} title="PULSE radar" className="ml-1 inline-flex h-7 items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 text-[10px] font-semibold text-amber-200">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
      {n}
    </button>
  );
}
