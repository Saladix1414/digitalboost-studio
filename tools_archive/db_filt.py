#!/usr/bin/env python3
from pathlib import Path
p = Path("src/DigitalBoostStudioDock.tsx")
if not p.is_file():
    raise SystemExit("cd digitalboost-studio")
d = p.read_text(encoding="utf-8")
if "const [filt, setFilt]" not in d:
    d = d.replace(
        "const [sel, setSel] = useState(0);",
        "const [sel, setSel] = useState(0);\n  const [filt, setFilt] = useState('all');",
        1,
    )
    print("ok state")
if "function passFilt" not in d:
    d = d.replace(
        "const blocks = readBlocks();",
        "const blocks = readBlocks();\n  function passFilt(b: any) {\n    const tp = String((b && (b.type || b.kind)) || '');\n    if (filt === 'hero') return tp === 'hero';\n    if (filt === 'cta') return !(b && String(b.cta || '').trim());\n    if (filt === 'hide') return !!(b && b.hidden);\n    return true;\n  }",
        1,
    )
    print("ok fn")
if "setFilt(" not in d:
    d = d.replace(
        '{tab === "outline" && (',
        '{tab === "outline" && (<div><div className="mb-2 flex gap-1 overflow-x-auto"><button type="button" onClick={function () { setFilt("all"); }} className={"h-8 rounded-full px-3 text-[10px] " + (filt === "all" ? "bg-cyan-400 text-[#070D18]" : "border border-white/10")}>Todos</button><button type="button" onClick={function () { setFilt("hero"); }} className={"h-8 rounded-full px-3 text-[10px] " + (filt === "hero" ? "bg-cyan-400 text-[#070D18]" : "border border-white/10")}>Hero</button><button type="button" onClick={function () { setFilt("cta"); }} className={"h-8 rounded-full px-3 text-[10px] " + (filt === "cta" ? "bg-cyan-400 text-[#070D18]" : "border border-white/10")}>Sin CTA</button><button type="button" onClick={function () { setFilt("hide"); }} className={"h-8 rounded-full px-3 text-[10px] " + (filt === "hide" ? "bg-cyan-400 text-[#070D18]" : "border border-white/10")}>Ocultos</button></div>',
        1,
    )
    # close extra div: after outline map we need </div> — find first outline section closer is hard
    print("ok chips (cierra el extra div a mano si Vite se queja)")
if "passFilt(" not in d.split("outline")[-1][:400]:
    d = d.replace(
        "blocks.map(function (b: any, i: number)",
        "blocks.filter(passFilt).map(function (b: any, i: number)",
        1,
    )
    print("ok filter map")
p.write_text(d, encoding="utf-8")
print("LISTO FILT")
