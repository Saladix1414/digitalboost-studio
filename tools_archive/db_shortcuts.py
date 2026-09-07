#!/usr/bin/env python3
from pathlib import Path
import shutil
from datetime import datetime

root = Path.cwd()
ws = root / "src" / "StoreBuilderWorkspace.tsx"
if not ws.is_file():
    raise SystemExit("No estas en digitalboost-studio")
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2(ws, ws.with_name("StoreBuilderWorkspace.before_visual_rebuild_" + stamp + ".tsx"))
print("backup ok")

css = root / "src" / "digitalboost-os.css"
block = r"""
.db-cmd-overlay{position:fixed;inset:0;z-index:200;background:rgba(7,13,24,.72);display:flex;align-items:flex-start;justify-content:center;padding:12vh 16px 16px}
.db-cmd-panel{width:min(560px,100%);background:#101B32;border:1px solid rgba(247,250,255,.12);border-radius:16px;overflow:hidden;color:#F7FAFF}
.db-cmd-panel input{width:100%;height:48px;border:0;outline:0;background:#0C1427;color:#F7FAFF;padding:0 16px;font-size:14px}
.db-cmd-item{display:block;width:100%;text-align:left;padding:10px 16px;background:transparent;border:0;color:#D7E2F0;font-size:13px;cursor:pointer}
.db-cmd-item.active,.db-cmd-item:hover{background:#14233F;color:#fff}
"""
if css.is_file():
    cur = css.read_text(encoding="utf-8")
    if ".db-cmd-overlay" not in cur:
        css.write_text(cur + "\n" + block, encoding="utf-8")
else:
    css.write_text(block, encoding="utf-8")
print("ok css")

(root / "src" / "DigitalBoostShortcuts.tsx").write_text(r"""
const ROWS = [
  ["Ctrl + K", "Command Center"],
  ["Ctrl + /", "Atajos"],
  ["Esc", "Cerrar overlay"],
  ["Command: AI Operator", "Analizar ventas / stock / conversion"],
  ["Command: Store Health", "Errores y warnings"],
  ["Command: Integrations", "Connect / Disconnect"],
  ["Command: Automations", "Trigger - Condition - Action"],
  ["Command: Operations Console", "Log de acciones"],
  ["Command: Notifications", "Campana del header"],
  ["Store Builder", "Theme / History / Undo / Redo"],
];
export default function DigitalBoostShortcuts(props: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Shortcuts</div>
            <div className="text-sm font-semibold">Mapa de capas DigitalBoost</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
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

(root / "src" / "DigitalBoostCommandCenter.tsx").write_text(r"""
import { useEffect, useMemo, useState } from "react";
import "./digitalboost-os.css";
type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenHealth?: () => void;
  onOpenIntegrations?: () => void;
  onOpenAutomations?: () => void;
  onOpenConsole?: () => void;
  onOpenNotes?: () => void;
  onOpenShortcuts?: () => void;
};
const COMMANDS = [
  { id: "dashboard", label: "Go to Overview", k: "inicio" },
  { id: "orders", label: "Go to Orders", k: "pedidos" },
  { id: "products", label: "Go to Products", k: "productos" },
  { id: "customers", label: "Go to Customers", k: "clientes" },
  { id: "analytics", label: "Go to Analytics", k: "analytics" },
  { id: "website-builder", label: "Open Store Builder", k: "store builder" },
  { id: "health", label: "Open Store Health", k: "health" },
  { id: "integrations", label: "Open Integrations", k: "integraciones" },
  { id: "automations", label: "Open Automations", k: "automations" },
  { id: "console", label: "Open Operations Console", k: "console" },
  { id: "notes", label: "Open Notifications", k: "notificaciones" },
  { id: "shortcuts", label: "Open Shortcuts", k: "atajos help" },
  { id: "ai", label: "Open AI Operator", k: "ia ai" },
  { id: "settings", label: "Open Settings", k: "config" },
];
export default function DigitalBoostCommandCenter(props: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const items = useMemo(function () {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter(function (c) { return (c.label + " " + c.k).toLowerCase().indexOf(s) !== -1; });
  }, [q]);
  useEffect(function () {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(function (v) { return !v; });
        setQ("");
        setI(0);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (props.onOpenShortcuts) props.onOpenShortcuts();
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("keydown", onKey); };
  }, []);
  function run(id: string) {
    setOpen(false);
    if (id === "ai") props.onOpenAI();
    else if (id === "health" && props.onOpenHealth) props.onOpenHealth();
    else if (id === "integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
    else if (id === "automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (id === "console" && props.onOpenConsole) props.onOpenConsole();
    else if (id === "notes" && props.onOpenNotes) props.onOpenNotes();
    else if (id === "shortcuts" && props.onOpenShortcuts) props.onOpenShortcuts();
    else props.onNavigate(id);
  }
  if (!open) return null;
  return (
    <div className="db-cmd-overlay" onClick={function () { setOpen(false); }}>
      <div className="db-cmd-panel" onClick={function (e) { e.stopPropagation(); }}>
        <input autoFocus placeholder="Command Center  ·  Ctrl K" value={q} onChange={function (e) { setQ(e.target.value); setI(0); }}
          onKeyDown={function (e) {
            if (e.key === "ArrowDown") { e.preventDefault(); setI(Math.min(items.length - 1, i + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setI(Math.max(0, i - 1)); }
            if (e.key === "Enter" && items[i]) run(items[i].id);
          }} />
        {items.map(function (c, n) {
          return <button key={c.id} type="button" className={n === i ? "db-cmd-item active" : "db-cmd-item"} onClick={function () { run(c.id); }}>{c.label}</button>;
        })}
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok command center")

txt = ws.read_text(encoding="utf-8")
if "DigitalBoostShortcuts from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostShortcuts from "./DigitalBoostShortcuts";',
        1,
    )
if "showShortcuts" not in txt:
    txt = txt.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showShortcuts, setShowShortcuts] = useState(false);",
        1,
    )
if "onOpenShortcuts" not in txt:
    if "onOpenNotes={() => setShowNotes(true)}" in txt:
        txt = txt.replace("onOpenNotes={() => setShowNotes(true)}", "onOpenNotes={() => setShowNotes(true)} onOpenShortcuts={() => setShowShortcuts(true)}", 1)
    elif "onOpenAI={() => setShowAI(true)}" in txt:
        txt = txt.replace("onOpenAI={() => setShowAI(true)}", "onOpenAI={() => setShowAI(true)} onOpenShortcuts={() => setShowShortcuts(true)}", 1)
if "{showShortcuts &&" not in txt:
    if "{showNotes &&" in txt:
        txt = txt.replace("{showNotes &&", "{showShortcuts && (<DigitalBoostShortcuts onClose={() => setShowShortcuts(false)} />)}\n      {showNotes &&", 1)
    elif "{showAI &&" in txt:
        txt = txt.replace("{showAI &&", "{showShortcuts && (<DigitalBoostShortcuts onClose={() => setShowShortcuts(false)} />)}\n      {showAI &&", 1)
ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO SHORTCUTS")
print("Ctrl+K command  |  Ctrl+/ atajos")
