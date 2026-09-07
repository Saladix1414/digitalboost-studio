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

(root / "src" / "DigitalBoostNotifications.tsx").write_text(r"""
import { useEffect, useMemo, useState } from "react";

type Note = { id: string; cat: string; title: string; body: string; at: number; read: boolean };
const CATS = ["All", "Sales", "Orders", "Customers", "Marketing", "Store", "System", "AI", "Security"];
const KEY = "db-notifications-v1";
const SEED: Note[] = [
  { id: "n1", cat: "Orders", title: "Pedido pagado", body: "DB-1048 · Martin Gonzalez · US$ 190", at: Date.now() - 900000, read: false },
  { id: "n2", cat: "Sales", title: "Revenue +18%", body: "El pulse semanal supero la semana previa.", at: Date.now() - 3600000, read: false },
  { id: "n3", cat: "AI", title: "AI Operator", body: "Sugirio mejorar el CTA del hero.", at: Date.now() - 7200000, read: true },
  { id: "n4", cat: "Store", title: "Publish ok", body: "Home publicada desde Store Builder.", at: Date.now() - 10800000, read: true },
  { id: "n5", cat: "Security", title: "Nuevo acceso", body: "Sesion Commerce OS desde este dispositivo.", at: Date.now() - 86400000, read: true },
];
function load(): Note[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED;
  } catch { return SEED; }
}
function save(list: Note[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
function when(at: number) {
  try { return new Date(at).toLocaleString("es-AR"); } catch { return ""; }
}

export default function DigitalBoostNotifications(props: { onClose: () => void }) {
  const [cat, setCat] = useState("All");
  const [list, setList] = useState<Note[]>([]);
  useEffect(function () { setList(load()); }, []);
  const shown = useMemo(function () {
    return cat === "All" ? list : list.filter(function (n) { return n.cat === cat; });
  }, [list, cat]);
  const unread = list.filter(function (n) { return !n.read; }).length;
  function commit(next: Note[]) { setList(next); save(next); }
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">Notifications</div>
            <div className="text-sm font-semibold">{unread} sin leer</div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pt-3">
          {CATS.map(function (c) {
            return <button key={c} type="button" onClick={function () { setCat(c); }} className={cat === c ? "shrink-0 rounded-full bg-amber-400/20 px-3 py-1.5 text-[11px] text-amber-200" : "shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-slate-400"}>{c}</button>;
          })}
        </div>
        <div className="px-4 pt-3">
          <button type="button" onClick={function () { commit(list.map(function (n) { return Object.assign({}, n, { read: true }); })); }} className="h-9 rounded-md border border-white/10 px-3 text-xs">Marcar todas leidas</button>
        </div>
        <div className="space-y-2 p-4">
          {shown.map(function (n) {
            return (
              <button key={n.id} type="button" onClick={function () { commit(list.map(function (x) { return x.id === n.id ? Object.assign({}, x, { read: true }) : x; })); }} className="block w-full rounded-xl border border-white/10 bg-[#101B32] p-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-cyan-300">{n.cat}</div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-amber-300" />}
                </div>
                <div className="mt-1 text-sm font-medium">{n.title}</div>
                <div className="mt-1 text-[11px] text-[#AFC0D5]">{n.body}</div>
                <div className="mt-1 text-[10px] text-slate-500">{when(n.at)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
""", encoding="utf-8")
print("ok notifications")

(root / "src" / "DigitalBoostCommandCenter.tsx").write_text(r"""
import { useEffect, useMemo, useState } from "react";
type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenHealth?: () => void;
  onOpenIntegrations?: () => void;
  onOpenAutomations?: () => void;
  onOpenConsole?: () => void;
  onOpenNotes?: () => void;
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
  { id: "notes", label: "Open Notifications", k: "notificaciones campana" },
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
    else if (id === "notes" && props.onOpenNotes) props.onOpenNotes();
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
if "DigitalBoostNotifications from" not in txt:
    txt = txt.replace(
        'import CommerceOSOverview from "./CommerceOSOverview";',
        'import CommerceOSOverview from "./CommerceOSOverview";\nimport DigitalBoostNotifications from "./DigitalBoostNotifications";',
        1,
    )
if "showNotes" not in txt:
    txt = txt.replace(
        "const [showAI, setShowAI] = useState(false);",
        "const [showAI, setShowAI] = useState(false);\n  const [showNotes, setShowNotes] = useState(false);",
        1,
    )
if "onOpenNotes" not in txt:
    if "onOpenConsole={() => setShowConsole(true)}" in txt:
        txt = txt.replace("onOpenConsole={() => setShowConsole(true)}", "onOpenConsole={() => setShowConsole(true)} onOpenNotes={() => setShowNotes(true)}", 1)
    elif "onOpenAI={() => setShowAI(true)}" in txt:
        txt = txt.replace("onOpenAI={() => setShowAI(true)}", "onOpenAI={() => setShowAI(true)} onOpenNotes={() => setShowNotes(true)}", 1)
if "{showNotes &&" not in txt:
    if "{showConsole &&" in txt:
        txt = txt.replace("{showConsole &&", "{showNotes && (<DigitalBoostNotifications onClose={() => setShowNotes(false)} />)}\n      {showConsole &&", 1)
    elif "{showAI &&" in txt:
        txt = txt.replace("{showAI &&", "{showNotes && (<DigitalBoostNotifications onClose={() => setShowNotes(false)} />)}\n      {showAI &&", 1)
if "setShowNotes(true)" not in txt.split("Bell")[0] + (txt[txt.find("Bell")-80:txt.find("Bell")+40] if "Bell" in txt else ""):
    txt = txt.replace("<Bell size={18} />", "<span onClick={function () { setShowNotes(true); }}><Bell size={18} /></span>", 1)
    txt = txt.replace("<Bell size={18}/>", "<span onClick={function () { setShowNotes(true); }}><Bell size={18} /></span>", 1)

ws.write_text(txt, encoding="utf-8")
print("ok workspace")
print("LISTO NOTIFICATIONS")
print("Campana del header o Ctrl+K -> Open Notifications")
