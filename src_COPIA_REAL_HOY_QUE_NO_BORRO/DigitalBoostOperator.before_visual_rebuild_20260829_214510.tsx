
import { useState } from "react";

type Props = {
  onClose: () => void;
  onNavigate: (id: any) => void;
};

function analyze(q: string) {
  const s = q.toLowerCase();
  if (s.includes("venta") || s.includes("sales") || s.includes("rendimiento"))
    return { title: "Analisis de ventas", body: "Revenue semanal en alza (+18,4%). Ticket promedio US$ 118. El drop de conversion en mobile es el freno.", action: "analytics", actionLabel: "Abrir Analytics", confirm: false };
  if (s.includes("stock") || s.includes("reposic") || s.includes("invent"))
    return { title: "Stock critico", body: "Hay SKUs bajo umbral. Prioriza reposicion antes del proximo drop.", action: "inventory", actionLabel: "Abrir Inventario", confirm: false };
  if (s.includes("conver") || s.includes("homepage") || s.includes("tienda"))
    return { title: "Conversion", body: "El hero convierte. El grid de productos pierde atencion. CTA mas claro + social proof.", action: "website-builder", actionLabel: "Editar en Store Builder", confirm: false };
  if (s.includes("promo") || s.includes("campan") || s.includes("descuento"))
    return { title: "Campana sugerida", body: "Recuperacion de carritos: 10% extra 48h, segmento checkout abandonado.", action: "campaigns", actionLabel: "Crear campana", confirm: true };
  if (s.includes("cliente") || s.includes("vip") || s.includes("reten"))
    return { title: "Clientes", body: "4 clientes activos. 1 perfil de alto valor. Tag VIP + follow-up.", action: "customers", actionLabel: "Abrir Clientes", confirm: false };
  if (s.includes("producto") || s.includes("mejor") || s.includes("catalog"))
    return { title: "Catalogo", body: "Los destacados cargan la venta. Completa imagenes y SEO de los que no rotan.", action: "products", actionLabel: "Abrir Productos", confirm: false };
  return { title: "AI Operator", body: "Puedo analizar ventas, stock, conversion, clientes o preparar una campana. Escribi el objetivo.", action: "dashboard", actionLabel: "Ir a Overview", confirm: false };
}

export default function DigitalBoostOperator({ onClose, onNavigate }: Props) {
  const [q, setQ] = useState("");
  const [out, setOut] = useState<ReturnType<typeof analyze> | null>(null);
  const [ask, setAsk] = useState(false);

  function run() {
    const r = analyze(q || "ventas");
    setOut(r);
    setAsk(Boolean(r.confirm));
  }

  function exec() {
    if (!out) return;
    onClose();
    onNavigate(out.action);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300">AI Operator</div>
            <div className="text-sm font-semibold">Analyze · Suggest · Execute</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="space-y-3 p-4">
          <textarea className="min-h-20 w-full rounded-lg border border-white/10 bg-[#0A1020] px-3 py-2 text-sm outline-none" placeholder="Analiza mis ventas / quiero aumentar conversion / stock bajo..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" onClick={run} className="h-11 w-full rounded-lg bg-violet-500 text-sm font-semibold">Analizar</button>
          {out && (
            <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
              <div className="text-sm font-semibold">{out.title}</div>
              <p className="mt-2 text-xs leading-5 text-[#AFC0D5]">{out.body}</p>
              {ask ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={exec} className="h-10 flex-1 rounded-lg bg-cyan-400 text-xs font-semibold text-[#070D18]">Confirmar</button>
                  <button type="button" onClick={() => setAsk(false)} className="h-10 flex-1 rounded-lg border border-white/10 text-xs">Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={exec} className="mt-3 h-10 w-full rounded-lg border border-cyan-400/40 text-xs text-cyan-300">{out.actionLabel}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
