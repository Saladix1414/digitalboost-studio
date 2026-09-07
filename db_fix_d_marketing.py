#!/usr/bin/env python3
from pathlib import Path
import re
src = Path("src")
def w(name, lines):
    (src / name).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"ok {name}")
print("=== FIX D: Marketing Hub ===")
w("DigitalBoostMarketingHub.tsx", [
'import { useMemo, useState } from "react";',
'import { buildPages, loadSeo, saveSeo, utmOf } from "./DigitalBoostSeo";',
'export default function DigitalBoostMarketingHub() {',
' const [s, setS] = useState(() => loadSeo());',
' const pages = useMemo(() => buildPages(s), [s]);',
' const home = pages.find(p => p.id === "home") || pages[0];',
' const [utm, setUtm] = useState({ u: home?.url || "/", s: "pulse", m: "social", c: "nimbus-drop" });',
' const [log, setLog] = useState("Marketing = recorte social + Pulse Card L3");',
' function saveHomeOg(title: string, desc: string) { const ov = {...(s.overrides || {}) }; ov[home.id] = {...(ov[home.id] || {}), title, description: desc }; const ns = {...s, overrides: ov }; saveSeo(ns); setS(ns); setLog("OG guardado"); }',
' function createPulseCard(kind: string, payload: string) { try { localStorage.setItem("db-pulse-card-draft", JSON.stringify({ kind, payload, t: Date.now() })); localStorage.setItem("db-pulse-seed", payload); window.dispatchEvent(new Event("db-open-pulse")); setLog("Pulse Card L3: " + kind); } catch {} }',
' return (<div className="space-y-6"><div><p className="text-lg font-semibold text-white">Marketing</p><p className="mt-1 text-sm text-[#AFC0D5]">No es ad manager. OG + UTM + L3.</p><p className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] text-cyan-200">{log}</p></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-[#0B1B30] p-5"><p className="text-[10px] uppercase text-cyan-300">OG — Home</p><input className="mt-3 h-11 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm" defaultValue={home?.title || ""} id="og-title" /><textarea className="mt-2 min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] p-3 text-sm" defaultValue={home?.description || ""} id="og-desc" /><button className="mt-3 h-11 w-full rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070D18]" onClick={() => { const t=(document.getElementById("og-title") as HTMLInputElement)?.value || home?.title; const d=(document.getElementById("og-desc") as HTMLTextAreaElement)?.value || home?.description; saveHomeOg(t,d); }}>Guardar OG</button></div><div className="rounded-2xl border border-white/10 bg-[#0B1B30] p-5"><p className="text-[10px] uppercase text-violet-300">UTM</p><input className="mt-3 h-10 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 text-sm" value={utm.u} onChange={e => setUtm({...utm, u: e.target.value })} /><button className="mt-3 h-10 w-full rounded-lg bg-white/10 text-xs" onClick={() => { const x=utmOf(utm.u, utm.s, utm.m, utm.c); navigator.clipboard.writeText(x); setLog("UTM: " + x); }}>Copiar UTM</button></div></div><div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><p className="text-sm font-semibold text-white">Pulse Card L3</p><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-white/10 bg-[#0A1020] p-4"><p className="text-xs font-semibold">1047</p><button className="mt-3 h-9 w-full rounded-lg bg-cyan-400 text-[11px] font-semibold text-[#070D18]" onClick={() => createPulseCard("1047","1047 en preparacion")}>Crear Card</button></div><div className="rounded-xl border border-white/10 bg-[#0A1020] p-4"><p className="text-xs font-semibold">Carrito</p><button className="mt-3 h-9 w-full rounded-lg border border-white/10 text-[11px]" onClick={() => createPulseCard("cart","recuperar carrito")}>Crear Card</button></div><div className="rounded-xl border border-white/10 bg-[#0A1020] p-4"><p className="text-xs font-semibold">OG</p><button className="mt-3 h-9 w-full rounded-lg border border-white/10 text-[11px]" onClick={() => createPulseCard("og","optimizar OG")}>Crear Card</button></div></div></div></div>);}',
'}',
])
ws = src / "StoreBuilderWorkspace.tsx"
t = ws.read_text(encoding="utf-8")
if "DigitalBoostMarketingHub" not in t:
    t = t.replace('import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";','import DigitalBoostSeoCenter from "./DigitalBoostSeoCenter";\nimport DigitalBoostMarketingHub from "./DigitalBoostMarketingHub";')
import re
t = re.sub(r'case "marketing":.*?return\s*\(\s*<div className="space-y-6">.*?Centro de Marketing.*?\)\s*\);\s*\n', ' case "marketing":\n return <DigitalBoostMarketingHub />;\n\n', t, flags=re.DOTALL)
ws.write_text(t, encoding="utf-8")
print("✅ marketing -> Hub")
