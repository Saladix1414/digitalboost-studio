
import { useEffect, useMemo, useState } from "react";

type Props = {
  onNavigate: (id: any) => void;
  onOpenAI: () => void;
  onOpenHealth?: () => void;
};

const COMMANDS = [
  { id: "dashboard", label: "Go to Overview", k: "inicio overview" },
  { id: "orders", label: "Go to Orders", k: "pedidos" },
  { id: "products", label: "Go to Products", k: "productos" },
  { id: "customers", label: "Go to Customers", k: "clientes" },
  { id: "analytics", label: "Go to Analytics", k: "analytics" },
  { id: "campaigns", label: "Go to Marketing", k: "marketing campana" },
  { id: "website-builder", label: "Open Store Builder", k: "store builder tienda" },
  { id: "health", label: "Open Store Health", k: "health diagnostico problemas" },
  { id: "ai", label: "Open AI Operator", k: "ia ai operator" },
  { id: "settings", label: "Open Settings", k: "config" },
];

export default function DigitalBoostCommandCenter({ onNavigate, onOpenAI, onOpenHealth }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COMMANDS;
    return COMMANDS.filter((c) => (c.label + " " + c.k).toLowerCase().includes(s));
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setI(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function run(id: string) {
    setOpen(false);
    if (id === "ai") onOpenAI();
    else if (id === "health") onOpenHealth?.();
    else onNavigate(id);
  }

  if (!open) return null;
  return (
    <div className="db-cmd-overlay" onClick={() => setOpen(false)}>
      <div className="db-cmd-panel" onClick={(e) => e.stopPropagation()}>
        <input autoFocus placeholder="Command Center  ·  Ctrl K" value={q} onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setI((n) => Math.min(items.length - 1, n + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setI((n) => Math.max(0, n - 1)); }
            if (e.key === "Enter" && items[i]) run(items[i].id);
          }} />
        {items.map((c, n) => (
          <button key={c.id} type="button" className={n === i ? "db-cmd-item active" : "db-cmd-item"} onClick={() => run(c.id)}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}
