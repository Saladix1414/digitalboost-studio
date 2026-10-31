
import { useEffect, useMemo, useRef, useState } from "react";
type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenSearch?: () => void;
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
  { id: "health", label: "Open Store Health", k: "health" },
  { id: "integrations", label: "Open Integrations", k: "integraciones" },
  { id: "automations", label: "Open Automations", k: "automations" },
  { id: "console", label: "Open Operations Console", k: "console" },
  { id: "notes", label: "Open Notifications", k: "notificaciones" },
  { id: "shortcuts", label: "Open Shortcuts", k: "atajos" },
  { id: "search", label: "Open Search", k: "buscar search pedidos" },
  { id: "ai", label: "Open PULSE", k: "ia ai pulse operador" },
  { id: "settings", label: "Open Settings", k: "config" }
];
export default function DigitalBoostCommandCenter(props: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
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
        if (!open) returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
  }, [props.onOpenShortcuts, open]);
  useEffect(() => {
    if (!open) return;
    return () => { if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus(); };
  }, [open]);
  function run(id: string) {
    setOpen(false);
    if (id === "ai") props.onOpenAI();
    else if (id === "search" && props.onOpenSearch) props.onOpenSearch();
    else if (id === "health" && props.onOpenHealth) props.onOpenHealth();
    else if (id === "integrations" && props.onOpenIntegrations) props.onOpenIntegrations();
    else if (id === "automations" && props.onOpenAutomations) props.onOpenAutomations();
    else if (id === "console" && props.onOpenConsole) props.onOpenConsole();
    else if (id === "notes" && props.onOpenNotes) props.onOpenNotes();
    else if (id === "shortcuts" && props.onOpenShortcuts) props.onOpenShortcuts();
    else props.onNavigate(id);
  }
  return (
    <>
      <button type="button" onClick={function (event) { returnFocusRef.current = event.currentTarget; setOpen(true); setQ(""); setI(0); }} aria-haspopup="dialog" aria-expanded={open} className="db-cmd-trigger">
        Cmd ⌘
      </button>
      {open && (
        <div className="db-cmd-overlay" role="dialog" aria-modal="true" aria-label="Command Center" onClick={function () { setOpen(false); }}>

          <div ref={panelRef} className="db-cmd-panel" onClick={function (e) { e.stopPropagation(); }}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, [tabindex="0"]');
              if (!focusable?.length) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
              if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }}>
            <div className="db-cmd-heading">Comandos
              <button type="button" className="commerce-icon-button" aria-label="Cerrar comandos" onClick={() => setOpen(false)}>×</button>
            </div>
            <input autoFocus placeholder="Command Center  ·  Cmd" aria-label="Buscar comando" value={q} onChange={function (e) { setQ(e.target.value); setI(0); }}
              onKeyDown={function (e) {
                if (e.key === "ArrowDown") { e.preventDefault(); setI(Math.max(0, Math.min(items.length - 1, i + 1))); }
                if (e.key === "ArrowUp") { e.preventDefault(); setI(Math.max(0, i - 1)); }
                if (e.key === "Enter" && items[i]) run(items[i].id);
              }} />
            {!items.length && <p className="db-cmd-empty">No se encontraron comandos.</p>}
            {items.map(function (c, n) {
              return <button key={c.id} type="button" className={n === i ? "db-cmd-item active" : "db-cmd-item"} onClick={function () { run(c.id); }}>{c.label}</button>;
            })}
          </div>
        </div>
      )}
    </>
  );
}
