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

(root / "src" / "DigitalBoostAutomations.tsx").write_text(r"""
import { useEffect, useState } from "react";

type Flow = { id: string; on: boolean; trigger: string; condition: string; action: string };

const TRIGGERS = ["Order created", "Stock low", "Customer inactive", "Checkout started"];
const CONDITIONS = ["Order > $100", "Stock < 5", "No purchase in 30d", "Always"];
const ACTIONS = ["Add VIP tag", "Notify owner", "Marketing segment", "Create discount"];
const KEY = "db-automations-v1";

function load(): Flow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return [
        { id: "a1", on: true, trigger: "Order created", condition: "Order > $100", action: "Add VIP tag" },
        { id: "a2", on: true, trigger: "Stock low", condition: "Stock < 5", action: "Notify owner" },
        { id: "a3", on: false, trigger: "Customer inactive", condition: "No purchase in 30d", action: "Marketing segment" },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(list: Flow[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export default function DigitalBoostAutomations(props: { onClose: () => void }) {
  const [list, setList] = useState<Flow[]>([]);
  const [trigger, setTrigger] = useState("Order created");
  const [condition, setCondition] = useState("Order > $100");
  const [action, setAction] = useState("Add VIP tag");

  useEffect(function () { setList(load()); }, []);

  function commit(next: Flow[]) {
    setList(next);
    save(next);
  }

  function add() {
    commit([{ id: "a-" + Date.now().toString(36), on: true, trigger: trigger, condition: condition, action: action }].concat(list));
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-300">Automations</div>
            <div className="text-sm font-semibold">Trigger - Condition - Action</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-2 p-4">
          <select className="h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" value={trigger} onChange={function (e) { setTrigger(e.target.value); }}>
            <option>Order created</option>
            <option>Stock low</option>
            <option>Customer inactive</option>
            <option>Checkout started</option>
          </select>
          <select className="h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" value={condition} onChange={function (e) { setCondition(e.target.value); }}>
            <option>Order &gt; $100</option>
            <option>Stock &lt; 5</option>
            <option>No purchase in 30d</option>
            <option>Always</option>
          </select>
          <select className="h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" value={action} onChange={function (e) { setAction(e.target.value); }}>
            <option>Add VIP tag</option>
            <option>Notify owner</option>
            <option>Marketing segment</option>
            <option>Create discount</option>
          </select>
          <button type="button" onClick={add} className="h-11 w-full rounded-lg bg-fuchsia-500 text-sm font-semibold">Crear flujo</button>
        </div>
        <div className="space-y-2 px-4 pb-4">
          {list.map(function (f) {
            return (
              <div key={f.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="text-xs leading-5 text-[#D7E2F0]">{f.trigger} / {f.condition} / {f.action}</div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={function () { commit(list.map(function (x) { return x.id === f.id ? Object.assign({}, x, { on: !x.on }) : x; })); }} className={f.on ? "h-8 rounded-md bg-emerald-400 px-3 text-[11px] font-semibold text-[#070D18]" : "h-8 rounded-md border border-white/10 px-3 text-[11px] text-slate-400"}>{f.on ? "On" : "Off"}</button>
                  <button type="button" onClick={function () { commit(list.filter(function (x) { return x.id !== f.id; })); }} className="h-8 rounded-md border border-pink-500/30 px-3 text-[11px] text-pink-300">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok automations")

(root / "src" / "DigitalBoostCommandCenter.tsx").write_text(r"""
import { useEffect, useMemo, useState } from "react";

type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenHealth?: () => void;
  onOpenIntegrations?: () => void;
  onOpenAutomations?: () => void;
};

const COMMANDS = [
  { id: "dashboard", label: "Go to Overview", k: "inicio overview" },
  { id: "orders", label: "Go to Orders", k: "pedidos" },
  { id: "products", label: "Go to Products", k: "productos" },
  { id: "customers", label: "Go to Customers", k: "clientes" },
  { id: "analytics", label: "Go to Analytics", k: "analytics" },
  { id: "campaigns", label: "Go to Marketing", k: "marketing" },
  { id: "website-builder", label: "Open Store Builder", k: "store builder tienda" },
  { id: "health", label: "Open Store Health", k: "health diagnostico" },
  { id: "integrations", label: "Open Integrations", k: "integraciones stripe" },
  { id: "automations", label: "Open Automations", k: "automations flujos" },
  { id: "ai", label: "Open AI Operator", k: "ia ai operator" },
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
    else if (id === "health") props.onOpenHealth && props.onOpenHealth();
    else if (id === "integrations") props.onOpenIntegrations && props.onOpenIntegrations();
    else if (id === "automations") props.onOpenAutomations && props.onOpenAutomations();
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
if "DigitalBoostAutomations from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostAutomations from "./DigitalBoostAutomations";',
        1,
    )
if "DigitalBoostCommandCenter from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostCommandCenter from "./DigitalBoostCommandCenter";',
        1,
    )
if "showAutomations" not in txt:
    txt = txt.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showAutomations, setShowAutomations] = useState(false);",
        1,
    )
if "onOpenAutomations" not in txt:
    if "onOpenIntegrations={() => setShowIntegrations(true)}" in txt:
        txt = txt.replace(
            "onOpenIntegrations={() => setShowIntegrations(true)}",
            "onOpenIntegrations={() => setShowIntegrations(true)} onOpenAutomations={() => setShowAutomations(true)}",
            1,
        )
    elif "onOpenHealth={() => setShowHealth(true)}" in txt:
        txt = txt.replace(
            "onOpenHealth={() => setShowHealth(true)}",
            "onOpenHealth={() => setShowHealth(true)} onOpenAutomations={() => setShowAutomations(true)}",
            1,
        )
    elif "onOpenAI={() => setShowAI(true)}" in txt:
        txt = txt.replace(
            "onOpenAI={() => setShowAI(true)}",
            "onOpenAI={() => setShowAI(true)} onOpenAutomations={() => setShowAutomations(true)}",
            1,
        )
if "{showAutomations &&" not in txt:
    if "{showIntegrations &&" in txt:
        txt = txt.replace("{showIntegrations &&", "{showAutomations && (<DigitalBoostAutomations onClose={() => setShowAutomations(false)} />)}\n      {showIntegrations &&", 1)
    elif "{showHealth &&" in txt:
        txt = txt.replace("{showHealth &&", "{showAutomations && (<DigitalBoostAutomations onClose={() => setShowAutomations(false)} />)}\n      {showHealth &&", 1)
    elif "{showAI &&" in txt:
        txt = txt.replace("{showAI &&", "{showAutomations && (<DigitalBoostAutomations onClose={() => setShowAutomations(false)} />)}\n      {showAI &&", 1)

if "<DigitalBoostCommandCenter" not in txt:
    txt = txt.replace(
        "{showAI &&",
        "{<DigitalBoostCommandCenter onNavigate={setSection} onOpenAI={() => setShowAI(true)} onOpenAutomations={() => setShowAutomations(true)} />}\n      {showAI &&",
        1,
    )

ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO AUTOMATIONS")
