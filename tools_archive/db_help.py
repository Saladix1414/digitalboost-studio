#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
src = root / "src"
ws = src / "StoreBuilderWorkspace.tsx"
cc = src / "DigitalBoostCommandCenter.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))

(src / "DigitalBoostShortcuts.tsx").write_text(r"""
const ROWS = [
  ["Ctrl + K", "Command Center"],
  ["Ctrl + /", "Atajos"],
  ["Esc", "Cerrar overlay"],
  ["Campana", "Notifications"],
  ["Open Operations Console", "Log de acciones"],
  ["Open AI Operator", "Analizar ventas / stock"],
  ["Open Store Health", "Errores y warnings"],
  ["Open Integrations", "Connect / Disconnect"],
  ["Open Automations", "Trigger - Condition - Action"],
  ["Store Builder", "Theme / History / Undo / Redo"]
];
export default function DigitalBoostShortcuts(props: { onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[140] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Shortcuts</div>
            <div className="text-sm font-semibold">Mapa de capas</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-1">
          {ROWS.map(function (row) {
            return (
              <div key={row[0]} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#101B32] px-3 py-2">
                <span className="text-xs text-[#D7E2F0]">{row[1]}</span>
                <span className="shrink-0 rounded bg-[#0A1020] px-2 py-1 text-[10px] text-cyan-300">{row[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok shortcuts")

w = ws.read_text(encoding="utf-8")
if "from \"./DigitalBoostShortcuts" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostShortcuts from "./DigitalBoostShortcuts.tsx";',
        1,
    )
else:
    w = w.replace('from "./DigitalBoostShortcuts"', 'from "./DigitalBoostShortcuts.tsx"')
if "showShortcuts" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showShortcuts, setShowShortcuts] = useState(false);",
        1,
    )
if "<DigitalBoostShortcuts" not in w:
    w = w.replace(
        "{showAI &&",
        "{showShortcuts && (<DigitalBoostShortcuts onClose={() => setShowShortcuts(false)} />)}\n      {showAI &&",
        1,
    )
if "onOpenShortcuts" not in w and "onOpenAI={() => setShowAI(true)}" in w:
    w = w.replace(
        "onOpenAI={() => setShowAI(true)}",
        "onOpenAI={() => setShowAI(true)} onOpenShortcuts={() => setShowShortcuts(true)}",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")

if cc.is_file():
    t = cc.read_text(encoding="utf-8")
    if "onOpenShortcuts" not in t:
        t = t.replace("onOpenAI: () => void;", "onOpenAI: () => void;\n  onOpenShortcuts?: () => void;", 1)
        t = t.replace("if (id === \"ai\") props.onOpenAI();", "if (id === \"ai\") props.onOpenAI();\n    else if (id === \"shortcuts\" && props.onOpenShortcuts) props.onOpenShortcuts();", 1)
    if 'id: "shortcuts"' not in t:
        t = t.replace(
            '{ id: "ai", label: "Open AI Operator"',
            '{ id: "shortcuts", label: "Open Shortcuts", k: "atajos help" },\n  { id: "ai", label: "Open AI Operator"',
            1,
        )
    if "e.key === \"/\"" not in t:
        t = t.replace(
            "if (e.key === \"Escape\") setOpen(false);",
            "if (e.key === \"Escape\") setOpen(false);\n      if ((e.ctrlKey || e.metaKey) && e.key === \"/\" && props.onOpenShortcuts) { e.preventDefault(); props.onOpenShortcuts(); }",
            1,
        )
    cc.write_text(t, encoding="utf-8")
    print("ok command center")
print("LISTO HELP")
