
import { useEffect, useMemo, useState } from "react";
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
  { id: "console", label: "Open Operations Console", k: "console log" },
  { id: "notes", label: "Open Notifications", k: "notificaciones campana" },
  { id: "shortcuts", label: "Open Shortcuts", k: "atajos help" },
  { id: "ai", label: "Open AI Operator", k: "ia ai operator" },
  { id: "settings", label: "Open Settings", k: "config" }
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
      if ((e.ctrlKey || e.metaKey) && e.key === "/" && props.onOpenShortcuts) {
        e.preventDefault();
        props.onOpenShortcuts();
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
    <div className="db-cmd-overlay" role="dialog" aria-modal="true" aria-label="Command Center" onClick={function () { setOpen(false); }}>
      <style>{".db-cmd-overlay{position:fixed;inset:0;z-index:200;background:rgba(7,13,24,.72);display:flex;align-items:flex-end;justify-content:center;padding:16px}.db-cmd-panel{width:min(560px,100%);background:#101B32;border:1px solid rgba(247,250,255,.12);border-radius:16px;overflow:hidden;color:#F7FAFF}.db-cmd-panel input{width:100%;height:48px;border:0;outline:0;background:#0C1427;color:#F7FAFF;padding:0 16px;font-size:14px}.db-cmd-item{display:block;width:100%;text-align:left;padding:12px 16px;background:transparent;border:0;color:#D7E2F0;font-size:13px}.db-cmd-item.active,.db-cmd-item:hover{background:#14233F;color:#fff}"}</style>
      <div className="db-cmd-panel" onClick={function (e) { e.stopPropagation(); }}>
        <input autoFocus placeholder="Command Center  ·  Ctrl K" aria-label="Buscar comando" value={q} onChange={function (e) { setQ(e.target.value); setI(0); }}
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
