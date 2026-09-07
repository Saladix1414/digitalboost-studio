
type Issue = { id: string; sev: "error" | "warn" | "hint"; title: string; loc: string; why: string; fix: string; go: string };

const ISSUES: Issue[] = [
  { id: "i1", sev: "error", title: "Checkout incompleto", loc: "Settings / Payments", why: "Falta confirmar proveedor de cobro.", fix: "Abrir pagos", go: "payments" },
  { id: "i2", sev: "error", title: "Stock bajo", loc: "Inventory", why: "SKUs cerca del umbral.", fix: "Ver inventario", go: "inventory" },
  { id: "i3", sev: "warn", title: "Productos sin imagen", loc: "Products", why: "Fichas sin media bajan conversion.", fix: "Completar fichas", go: "products" },
  { id: "i4", sev: "warn", title: "SEO faltante", loc: "SEO Manager", why: "Paginas sin title/description.", fix: "Abrir SEO", go: "seo" },
  { id: "i5", sev: "warn", title: "Coleccion vacia", loc: "Products", why: "Una coleccion no tiene items.", fix: "Organizar catalogo", go: "products" },
  { id: "i6", sev: "hint", title: "Hero sin prueba social", loc: "Store Builder / Home", why: "El canvas puede vender mas con reviews.", fix: "Editar home", go: "website-builder" },
];

export default function DigitalBoostHealth({ onClose, onFix }: { onClose: () => void; onFix: (id: string) => void }) {
  const errors = ISSUES.filter((i) => i.sev === "error").length;
  const warns = ISSUES.filter((i) => i.sev === "warn").length;
  const score = Math.max(40, 100 - errors * 14 - warns * 7);
  const tone = (s: Issue["sev"]) => s === "error" ? "text-red-400" : s === "warn" ? "text-amber-300" : "text-cyan-300";
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] text-[#F7FAFF]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">Store Health</div>
            <div className="text-sm font-semibold">Diagnostics · score {score}</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {[["Score", String(score)], ["Errors", String(errors)], ["Warnings", String(warns)]].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#AFC0D5]">{l}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2 px-4 pb-4">
          {ISSUES.map((i) => (
            <div key={i.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
              <div className={"text-[10px] font-semibold uppercase tracking-[0.14em] " + tone(i.sev)}>{i.sev}</div>
              <div className="mt-1 text-sm font-medium">{i.title}</div>
              <div className="mt-1 text-[11px] text-[#AFC0D5]">{i.loc} · {i.why}</div>
              <button type="button" onClick={() => onFix(i.go)} className="mt-2 h-9 rounded-md border border-cyan-400/30 px-3 text-xs text-cyan-300">{i.fix}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
