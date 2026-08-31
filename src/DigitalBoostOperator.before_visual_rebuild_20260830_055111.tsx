
import { useState } from "react";

function analyze(q: string) {
  const s = (q || "").toLowerCase();
  if (s.indexOf("hola") !== -1 || s.indexOf("quien") !== -1 || s.indexOf("sos") !== -1)
    return { title: "PULSE", body: "Soy PULSE, la inteligencia de DigitalBoost. Opero el comercio: ventas, stock, conversion y la tienda. No soy un chat generico.", action: "dashboard", actionLabel: "Seguir en Overview", confirm: false };
  if (s.indexOf("venta") !== -1 || s.indexOf("sales") !== -1)
    return { title: "PULSE · Ventas", body: "Semana en alza. El ticket aguanta. El recorte esta en mobile: ahi se pierde la conversion.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (s.indexOf("stock") !== -1 || s.indexOf("invent") !== -1)
    return { title: "PULSE · Stock", body: "Hay SKUs bajo umbral. Si no repones, el drop siguiente vende vacio.", action: "inventory", actionLabel: "Abrir Inventario", confirm: false };
  if (s.indexOf("conver") !== -1 || s.indexOf("homepage") !== -1 || s.indexOf("tienda") !== -1)
    return { title: "PULSE · Conversion", body: "El hero sostiene. El grid no. Un CTA y prueba social mueven mas que otro banner.", action: "website-builder", actionLabel: "Abrir Store Builder", confirm: false };
  if (s.indexOf("promo") !== -1 || s.indexOf("campan") !== -1)
    return { title: "PULSE · Campana", body: "Recuperacion de carritos, 10% / 48h, segmento checkout abandonado. Eso primero.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (s.indexOf("cliente") !== -1 || s.indexOf("vip") !== -1)
    return { title: "PULSE · Clientes", body: "Hay valor concentrado en pocos perfiles. Tag VIP y follow-up, no otra campana masiva.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  return { title: "PULSE", body: "Decime el frente: ventas, stock, conversion, clientes o una campana. Yo opero DigitalBoost.", action: "dashboard", actionLabel: "Ir a Overview", confirm: false };
}

export default function DigitalBoostOperator(props: { onClose: () => void; onNavigate: (id: any) => void }) {
  const [q, setQ] = useState("");
  const [out, setOut] = useState<ReturnType<typeof analyze> | null>(null);
  const [ask, setAsk] = useState(false);
  function run() {
    const r = analyze(q || "hola");
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">DigitalBoost</div>
              <div className="text-sm font-semibold">PULSE · inteligencia propia</div>
            </div>
          </div>
          <button type="button" onClick={props.onClose} className="grid h-11 w-11 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-xs leading-5 text-[#AFC0D5]">No soy un modelo generico. Soy el operador de este OS: analizo, sugiero y ejecuto sobre tu comercio.</p>
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder="Hola PULSE / analiza mis ventas / stock / conversion" value={q} onChange={function (e) { setQ(e.target.value); }} />
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
