
import { useState } from "react";

function storeCtx() {
  let range = "7d";
  let store = "Nimbus";
  let live = true;
  try {
    range = localStorage.getItem("db-os-range-v1") || "7d";
    store = localStorage.getItem("db-active-store-v1") || "Nimbus";
    live = localStorage.getItem("db-os-live-v1") !== "0";
  } catch {}
  return { range: range, store: store, live: live };
}
function isBuilder(section: string) {
  return section === "website-builder" || section === "store-builder" || section === "builder";
}
function analyze(q: string, section: string) {
  const ctx = storeCtx();
  const stamp = ctx.store + " · " + ctx.range + " · " + (ctx.live ? "Live" : "Attention");
  const s = (q || "").toLowerCase();
  const builder = isBuilder(section);
  if (s.indexOf("hola") !== -1 || s.indexOf("quien") !== -1 || s.indexOf("sos") !== -1) {
    return builder
      ? { title: "PULSE Design", body: "Estoy en el estudio. Puedo reescribir el hero, poner CTAs y empujar conversion en el canvas.", action: "website-builder", actionLabel: "Seguir en el canvas", confirm: false }
      : { title: "PULSE", body: "Estoy en Commerce OS · " + stamp + ". Opero ventas, stock, pedidos y campanas de esta tienda.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  }
  if (builder) {
    if (s.indexOf("hero") !== -1 || s.indexOf("redisen") !== -1)
      return { title: "PULSE Design · Hero", body: "El hero tiene que vender en 3 segundos. Menos texto, un CTA, mas tension.", action: "website-builder", actionLabel: "Usar chip AI Design", confirm: false };
    if (s.indexOf("conver") !== -1 || s.indexOf("cta") !== -1)
      return { title: "PULSE Design · Conversion", body: "Todo bloque que no pide accion es ruido. CTA en hero, productos y cierre.", action: "website-builder", actionLabel: "Usar chip AI Design", confirm: false };
    if (s.indexOf("theme") !== -1 || s.indexOf("color") !== -1 || s.indexOf("noir") !== -1)
      return { title: "PULSE Design · Theme", body: "Nimbus vende calma. Noir vende precisio. Cambia el preset desde Theme.", action: "website-builder", actionLabel: "Abrir Theme", confirm: false };
    return { title: "PULSE Design", body: "En el estudio: hero, conversion, theme o copy. El chip AI Design aplica el cambio al canvas.", action: "website-builder", actionLabel: "Seguir disenando", confirm: false };
  }
  if (section === "orders" || s.indexOf("pedido") !== -1)
    return { title: "PULSE · Pedidos", body: "DB-1048 pagado. Hay uno en preparacion. El cuello esta entre pago y envio, no en la vitrina.", action: "orders", actionLabel: "Abrir Pedidos", confirm: false };
  if (section === "products" || s.indexOf("stock") !== -1 || s.indexOf("producto") !== -1)
    return { title: "PULSE · Catalogo", body: "Hay SKUs finos. Si el drop llega sin reposicion, el OS va a vender vacio.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  if (section === "customers" || s.indexOf("cliente") !== -1 || s.indexOf("vip") !== -1)
    return { title: "PULSE · Clientes", body: "El valor esta concentrado. Tag VIP y follow-up, no otra campana masiva.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (section === "analytics" || s.indexOf("venta") !== -1 || s.indexOf("analytics") !== -1)
    return { title: "PULSE · Ventas", body: "Semana en alza. Ticket estable. Mobile recorta conversion.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (s.indexOf("campan") !== -1 || s.indexOf("promo") !== -1)
    return { title: "PULSE · Campana", body: "Recuperacion de carritos 10% / 48h. Primero eso.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (s.indexOf("conver") !== -1 || s.indexOf("tienda") !== -1)
    return { title: "PULSE · Conversion", body: "El hero sostiene. El grid no. Pase al estudio y toca el canvas.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  if (s.indexOf("stock") !== -1)
    return { title: "PULSE · Stock", body: "Umbral cerca. Reponer antes del proximo drop.", action: "inventory", actionLabel: "Abrir Inventario", confirm: false };
  const here = section || "dashboard";
  return { title: "PULSE · Commerce OS", body: stamp + ". Frente: " + here + ". Pedime ventas, pedidos, stock, clientes o una campana.", action: here, actionLabel: "Seguir aca", confirm: false };
}

export default function DigitalBoostOperator(props: { onClose: () => void; onNavigate: (id: any) => void; section?: string }) {
  const section = props.section || "dashboard";
  const builder = isBuilder(section);
  const [q, setQ] = useState("");
  const [out, setOut] = useState<ReturnType<typeof analyze> | null>(null);
  const [ask, setAsk] = useState(false);
  function run() {
    const r = analyze(q || "hola", section);
    setOut(r);
    setAsk(Boolean(r.confirm));
  }
  function exec() {
    if (!out) return;
    props.onClose();
    props.onNavigate(out.action);
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={props.onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0C1427] text-[#F7FAFF]" onClick={function (e) { e.stopPropagation(); }}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400 text-xs font-bold text-[#070D18]">P</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{builder ? "PULSE Design" : "PULSE · Commerce OS"}</div>
              <div className="text-sm font-semibold">{builder ? "Estudio · canvas" : "Operador · " + section}</div>
            </div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-xs leading-5 text-[#AFC0D5]">{builder ? "Modo estudio: el chip AI Design aplica cambios al canvas. Yo te digo que tocar." : "Modo OS: leo esta pantalla y te muevo a pedidos, stock, analytics o una campana."}</p>
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder={builder ? "Redesena el hero / conversion / theme" : "Hola PULSE / ventas / pedidos / stock"} value={q} onChange={function (e) { setQ(e.target.value); }} />
          <button type="button" onClick={run} className="h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070D18]">Hablar con PULSE</button>
          {out && (
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/5 p-3">
              <div className="text-sm font-semibold">{out.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#AFC0D5]">{out.body}</p>
              {ask ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={exec} className="h-11 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                  <button type="button" onClick={function () { setAsk(false); }} className="h-11 flex-1 rounded-lg border border-white/10 text-xs">Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={exec} className="mt-3 h-11 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
