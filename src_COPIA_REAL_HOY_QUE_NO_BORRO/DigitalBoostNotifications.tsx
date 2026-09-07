
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
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
