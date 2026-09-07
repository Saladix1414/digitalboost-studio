
import { formatWhen, type Snapshot } from "./DigitalBoostHistory";

export default function DigitalBoostHistoryPanel({ items, currentCount, onRestore, onClose }: {
  items: Snapshot[]; currentCount: number; onRestore: (s: Snapshot) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0C1427] p-4 text-[#F7FAFF]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Version History</div>
            <div className="text-sm font-semibold">Restnimbusr un punto de la tienda</div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-white/10">x</button>
        </div>
        {!items.length && <p className="text-xs text-[#AFC0D5]">Todavia no hay versiones. Publica o guarda una.</p>}
        <div className="space-y-2">
          {items.map((s) => {
            const diff = (s.blocks?.length || 0) - currentCount;
            const cmp = diff === 0 ? "mismo largo" : (diff > 0 ? "+" + diff + " bloques" : diff + " bloques");
            return (
              <div key={s.id} className="rounded-xl border border-white/10 bg-[#101B32] p-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-cyan-300">{s.source}</div>
                <div className="mt-1 text-sm font-medium">{s.label}</div>
                <div className="mt-1 text-[11px] text-[#AFC0D5]">{formatWhen(s.at)} · {s.blocks?.length || 0} bloques · {cmp}</div>
                <button type="button" onClick={() => onRestore(s)} className="mt-2 h-9 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-[#070D18]">Restore</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
