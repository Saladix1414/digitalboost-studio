#!/usr/bin/env python3
from pathlib import Path
src = Path("src")
if not src.is_dir():
    raise SystemExit("cd digitalboost-studio")

css = [
"/* DigitalBoost Store Builder — chrome profesional */",
"[data-store-builder], [data-db-studio], [data-website-builder] {",
"  --sb-bg: #070B14;",
"  --sb-line: rgba(247,250,255,.08);",
"}",
"#db-studio-dock { font-family: ui-sans-serif, system-ui, sans-serif; }",
"#db-studio-dock .db-ide-bar {",
"  border: 1px solid var(--sb-line, rgba(255,255,255,.1));",
"  background: rgba(8,14,28,.94);",
"  backdrop-filter: blur(18px);",
"  box-shadow: 0 -8px 32px rgba(0,0,0,.35);",
"}",
"#db-studio-dock .db-ide-bar button {",
"  font-size: 11px;",
"  letter-spacing: .04em;",
"  text-transform: uppercase;",
"}",
"body.db-pulse-open #db-studio-dock { display: none !important; }",
]
(src / "digitalboost-studio-pro.css").write_text("\n".join(css) + "\n", encoding="utf-8")
print("ok css")

dock = src / "DigitalBoostStudioDock.tsx"
if dock.is_file():
    d = dock.read_text(encoding="utf-8")
    if "digitalboost-studio-pro.css" not in d:
        d = 'import "./digitalboost-studio-pro.css";\n' + d
        print("ok import css")
    d = d.replace(
        'className="pointer-events-auto flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#0C1427] p-1 shadow-lg"',
        'className="db-ide-bar pointer-events-auto flex gap-1 overflow-x-auto rounded-xl p-1"',
        1,
    )
    d = d.replace(
        'className="pointer-events-auto flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#0C1427]/95 p-1 shadow-lg backdrop-blur"',
        'className="db-ide-bar pointer-events-auto flex gap-1 overflow-x-auto rounded-xl p-1"',
        1,
    )
    # panel
    d = d.replace(
        "border-cyan-400/25 bg-[#0C1427] text-[#F7FAFF] shadow-2xl",
        "border-white/10 bg-[#0C1427] text-[#F7FAFF] shadow-2xl",
    )
    dock.write_text(d, encoding="utf-8")
    print("ok dock chrome")
else:
    print("skip dock")

# workspace marker so CSS applies
ws = src / "StoreBuilderWorkspace.tsx"
if ws.is_file():
    w = ws.read_text(encoding="utf-8")
    if "data-store-builder" not in w and "data-db-studio" not in w:
        w = w.replace('<div className="flex h-screen', '<div data-store-builder="true" className="flex h-screen', 1)
        ws.write_text(w, encoding="utf-8")
        print("ok data-store-builder")
    else:
        print("ya marker")

print("LISTO PRO")
