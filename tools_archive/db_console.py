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

(root / "src" / "DigitalBoostConsole.ts").write_text(r"""
export type LogItem = {
  id: string;
  at: number;
  actor: string;
  action: string;
  resource: string;
  status: "completed" | "running" | "failed";
  result: string;
};
const KEY = "db-ops-console-v1";
export function loadLog(): LogItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return [
        { id: "l1", at: Date.now() - 3600000, actor: "AI Operator", action: "Updated product price", resource: "Campera Aura", status: "completed", result: "Precio actualizado" },
        { id: "l2", at: Date.now() - 1800000, actor: "Store Builder", action: "Publish store", resource: "Home", status: "completed", result: "Version publicada" },
        { id: "l3", at: Date.now() - 600000, actor: "Automations", action: "Add VIP tag", resource: "Order DB-1048", status: "completed", result: "Tag VIP" },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function saveLog(list: LogItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50))); } catch {}
}
export function pushLog(partial: Omit<LogItem, "id" | "at">): LogItem[] {
  const item: LogItem = { id: "l-" + Date.now().toString(36), at: Date.now(), ...partial };
  const list = [item].concat(loadLog()).slice(0, 50);
  saveLog(list);
  return list;
}
export function formatWhen(at: number) {
  try { return new Date(at).toLocaleString("es-AR"); } catch { return String(at); }
}
""", encoding="utf-8")
print("ok console ts")

(root / "src" / "DigitalBoostConsole.tsx").write_text(r"""
import { useEffect, useState } from "react";
import { formatWhen, loadLog, pushLog, saveLog, type LogItem } from "./DigitalBoostConsole";

export default function DigitalBoostConsole(props: { onClose: () => void }) {
  const [list, setList] = useState<LogItem[]>([]);
  useEffect(function () { setList(loadLog()); }, []);
  function tone(s: LogItem["status"]) {
    if (s === "completed") return "text-emerald-400";
    if (s === "failed") return "text-red-400";
    return "text-amber-300";
  }
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Operations Console</div>
            <div className="text-sm font-semibold">Action · Status · Result</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="flex gap-2 px-4 pt-3">
          <button type="button" onClick={function () { setList(pushLog({ actor: "User", action: "Manual ping", resource: "Commerce OS", status: "completed", result: "Ok" })); }} className="h-9 rounded-md bg-cyan-400 px-3 text-xs font-semibold text-[#070D18]">Log event</button>
          <button type="button" onClick={function () { saveLog([]); setList([]); }} className="h-9 rounded-md border border-white/10 px-3 text-xs">Clear</button>
        </div>
        <div className="space-y-2 p-4">
          {list.map(function (row) {
            return (
              <div key={row.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{row.action}</div>
                  <div className={"text-[10px] uppercase tracking-[0.12em] " + tone(row.status)}>{row.status}</div>
                </div>
                <div className="mt-1 text-[11px] text-[#AFC0D5]">{row.actor} · {row.resource}</div>
                <div className="mt-1 text-[11px] text-[#D7E2F0]">{row.result}</div>
                <div className="mt-1 text-[10px] text-slate-500">{formatWhen(row.at)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok console ui")

(root / "src" / "DigitalBoostCommandCenter.tsx").write_text(r"""
import { useEffect, useMemo, useState } from "react";

type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenHealth?: () => void;
  onOpenIntegrations?: () => void;
  onOpenAutomations?: () => void;
  onOpenConsole?: () => void;
};

const COMMANDS = [
  { id: "dashboard", label: "Go to Overview", k: "inicio overview" },
  { id: "orders", label: "Go to Orders", k: "pedidos" },
  { id: "products", label: "Go to Products", k: "productos" },
  { id: "customers", label: "Go to Customers", k: "clientes" },
  { id: "analytics", label: "Go to Analytics", k: "analytics" },
  { id: "campaigns", label: "Go to Marketing", k: "marketing" },
  { id: "website-builder", label: "Open Store Builder", k: "store builder" },
  { id: "health", label: "Open Store Health", k: "health" },
  { id: "integrations", label: "Open Integrations", k: "integraciones" },
  { id: "automations", label: "Open Automations", k: "automations" },
  { id: "console", label: "Open Operations Console", k: "console operaciones log" },
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
if "DigitalBoostConsole from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostConsole from "./DigitalBoostConsole";',
        1,
    )
if "showConsole" not in txt:
    txt = txt.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showConsole, setShowConsole] = useState(false);",
        1,
    )
if "onOpenConsole" not in txt:
    if "onOpenAutomations={() => setShowAutomations(true)}" in txt:
        txt = txt.replace(
            "onOpenAutomations={() => setShowAutomations(true)}",
            "onOpenAutomations={() => setShowAutomations(true)} onOpenConsole={() => setShowConsole(true)}",
            1,
        )
    elif "onOpenAI={() => setShowAI(true)}" in txt:
        txt = txt.replace(
            "onOpenAI={() => setShowAI(true)}",
            "onOpenAI={() => setShowAI(true)} onOpenConsole={() => setShowConsole(true)}",
            1,
        )
if "{showConsole &&" not in txt:
    if "{showAutomations &&" in txt:
        txt = txt.replace("{showAutomations &&", "{showConsole && (<DigitalBoostConsole onClose={() => setShowConsole(false)} />)}\n      {showAutomations &&", 1)
    elif "{showAI &&" in txt:
        txt = txt.replace("{showAI &&", "{showConsole && (<DigitalBoostConsole onClose={() => setShowConsole(false)} />)}\n      {showAI &&", 1)

ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO CONSOLE")
print("Ctrl+K -> Open Operations Console")
