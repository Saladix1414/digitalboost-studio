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

p = src / "DigitalBoostAutomations.tsx"
raw = p.read_text(encoding="utf-8") if p.is_file() else ""
if ("export default function" not in raw) or ("TRIGGERS" not in raw):
    p.write_text(r"""
import { useEffect, useState } from "react";
type Flow = { id: string; on: boolean; trigger: string; condition: string; action: string };
const KEY = "db-automations-v1";
function load(): Flow[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return [
        { id: "a1", on: true, trigger: "Order created", condition: "Order > $100", action: "Add VIP tag" },
        { id: "a2", on: true, trigger: "Stock low", condition: "Stock < 5", action: "Notify owner" },
        { id: "a3", on: false, trigger: "Customer inactive", condition: "No purchase in 30d", action: "Marketing segment" }
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function save(list: Flow[]) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }
export default function DigitalBoostAutomations(props: { onClose: () => void }) {
  const [list, setList] = useState<Flow[]>([]);
  const [trigger, setTrigger] = useState("Order created");
  const [condition, setCondition] = useState("Order > $100");
  const [action, setAction] = useState("Add VIP tag");
  useEffect(function () { setList(load()); }, []);
  function commit(next: Flow[]) { setList(next); save(next); }
  function add() {
    commit([{ id: "a-" + Date.now().toString(36), on: true, trigger: trigger, condition: condition, action: action }].concat(list));
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-300">Automations</div>
            <div className="text-sm font-semibold">Trigger - Condition - Action</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-2 p-4">
          <select className="h-11 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" value={trigger} onChange={function (e) { setTrigger(e.target.value); }}>
            <option>Order created</option>
            <option>Stock low</option>
            <option>Customer inactive</option>
            <option>Checkout started</option>
          </select>
          <select className="h-11 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" value={condition} onChange={function (e) { setCondition(e.target.value); }}>
            <option>Order &gt; $100</option>
            <option>Stock &lt; 5</option>
            <option>No purchase in 30d</option>
            <option>Always</option>
          </select>
          <select className="h-11 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm" value={action} onChange={function (e) { setAction(e.target.value); }}>
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
                  <button type="button" onClick={function () { commit(list.map(function (x) { return x.id === f.id ? Object.assign({}, x, { on: !x.on }) : x; })); }} className={f.on ? "h-11 rounded-md bg-emerald-400 px-3 text-[11px] font-semibold text-[#070D18]" : "h-11 rounded-md border border-white/10 px-3 text-[11px] text-slate-400"}>{f.on ? "On" : "Off"}</button>
                  <button type="button" onClick={function () { commit(list.filter(function (x) { return x.id !== f.id; })); }} className="h-11 rounded-md border border-pink-500/30 px-3 text-[11px] text-pink-300">Delete</button>
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
    print("ok automations ui")
else:
    print("ok automations exists")

w = ws.read_text(encoding="utf-8")
if "from \"./DigitalBoostAutomations" not in w:
    w = w.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostAutomations from "./DigitalBoostAutomations.tsx";',
        1,
    )
else:
    w = w.replace('from "./DigitalBoostAutomations"', 'from "./DigitalBoostAutomations.tsx"')
if "showAutomations" not in w:
    w = w.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showAutomations, setShowAutomations] = useState(false);",
        1,
    )
if "<DigitalBoostAutomations" not in w:
    w = w.replace(
        "{showAI &&",
        "{showAutomations && (<DigitalBoostAutomations onClose={() => setShowAutomations(false)} />)}\n      {showAI &&",
        1,
    )
if "onOpenAutomations" not in w and "onOpenAI={() => setShowAI(true)}" in w:
    w = w.replace(
        "onOpenAI={() => setShowAI(true)}",
        "onOpenAI={() => setShowAI(true)} onOpenAutomations={() => setShowAutomations(true)}",
        1,
    )
ws.write_text(w, encoding="utf-8")
print("ok workspace")

if cc.is_file():
    t = cc.read_text(encoding="utf-8")
    if "onOpenAutomations" not in t:
        t = t.replace("onOpenAI: () => void;", "onOpenAI: () => void;\n  onOpenAutomations?: () => void;", 1)
        t = t.replace("if (id === \"ai\") props.onOpenAI();", "if (id === \"ai\") props.onOpenAI();\n    else if (id === \"automations\" && props.onOpenAutomations) props.onOpenAutomations();", 1)
    if 'id: "automations"' not in t:
        t = t.replace(
            '{ id: "ai", label: "Open AI Operator"',
            '{ id: "automations", label: "Open Automations", k: "automations flujos" },\n  { id: "ai", label: "Open AI Operator"',
            1,
        )
    cc.write_text(t, encoding="utf-8")
    print("ok command center")
print("LISTO AUTOMATIONS")
